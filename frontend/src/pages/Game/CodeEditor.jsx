import Editor from '@monaco-editor/react';
import React, { useRef, useState, useCallback, useEffect } from 'react';
import socket from '../../services/socket';
import Spinner from '../../components/spinner';

function CodeEditor({LeetCode, onFinish}) {
    const [stdOut, setStdOut] = useState(['', '', '']);
    const [stdErr, setStdErr] = useState(['', '', '']);
    const [terminalHeight, setTerminalHeight] = useState(200);
    const [isDragging, setIsDragging] = useState(false);
    const editorRef = useRef(null);
    const containerRef = useRef(null);


    // Results panel state
    
    const [outputNum, setOutputNum] = useState(0);

    const [succeded, setSucceeded] = useState(null);
    const [loading, setLoading] = useState(false);
    const [cpuTimeMs, setCpuTimeMs] = useState(null);
    const [resultError, setResultError] = useState(null);
    
    function handleEditorDidMount(editor, monaco) {
        editorRef.current = editor;
    }

    function submitCode() { 
        const code = editorRef.current.getValue();
        setLoading(true);
        socket.emit('user-submission', code, (res) => {
            setLoading(false);
            if(res.status === "ERROR"){
                setStdErr(res.message || 'Unknown error');
            } else {
                if (res.results.length === 0) return;
                let totalCpuTimeMs = 0;
                for (let i = 0; i < res.results?.length; i++) {
                    if (res.results[i].succeeded === false) { 
                        let reason = ""
                        if (res.results[i].time_limit_exceeded) {
                            reason = "Time Limit Exceeded";
                        } else if (res.results[i].tests_failed) {
                            reason = "Test Failed";
                        } else {
                            reason = "Unknown error";
                        }
                        setResultError({
                            failed_case_num: i,
                            reason: reason,
                            failed_case: res.inputs_code[i]
                        });
                        setSucceeded(false);
                        return;
                    }
                    totalCpuTimeMs += res.results[i].cpu_time_ms;
                }
                if (res.results.length > 0) {
                    setCpuTimeMs(totalCpuTimeMs / res.results.length)
                }
                onFinish();
            }   
        });      
    }
    
    function runCode() {
        const code = editorRef.current.getValue();
        setLoading(true);
        socket.emit('user-run', code, (res) => {
            setLoading(false);
            if(res.status === "ERROR"){
                setStdErr(res.message || 'Unknown error');
            } else {
                const outputs = [...res.results]; 
                while (outputs.length < 3) { 
                    outputs.push('');
                }
                setStdErr([outputs[0].stderr, outputs[1].stderr || '', outputs[2].stderr || ''] );
                setStdOut([outputs[0].stdout, outputs[1].stdout || '', outputs[2].stdout || ''] );


                let totalCpuTimeMs = 0;
                for (let i = 0; i < res.results?.length; i++) {
                    if (res.results[i].succeeded === false) { 
                        let reason = ""
                        if (res.results[i].time_limit_exceeded) {
                            reason = "Time Limit Exceeded";
                        } else if (res.results[i].tests_failed) {
                            reason = "Test Failed";
                        } else {
                            reason = "Unknown error";
                        }

                        setSucceeded(false);
                        setResultError({
                            failed_case_num: i,
                            reason: reason,
                            failed_case: res.inputs_code[i]
                        });
                        return;
                    }
                    totalCpuTimeMs += res.results[i].cpu_time_ms;
                }
                if (res.results.length > 0) {
                    setCpuTimeMs(totalCpuTimeMs / res.results.length)
                }
                setSucceeded(true);
            }   
        });      
    }
    
    // Handle mouse drag for resizing
    const handleMouseDown = useCallback((e) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);
    
    const handleMouseMove = useCallback((e) => {
        if (!isDragging || !containerRef.current) return;
        
        const containerRect = containerRef.current.getBoundingClientRect();
        const newTerminalHeight = containerRect.bottom - e.clientY - 44; // 44px for button bar
        
        // Clamp between 40px and 80% of container
        const maxHeight = containerRect.height * 0.8;
        const minHeight = 40;
        setTerminalHeight(Math.max(minHeight, Math.min(maxHeight, newTerminalHeight)));
    }, [isDragging]);
    
    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);
    
    // Add global mouse listeners when dragging
    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'row-resize';
            document.body.style.userSelect = 'none';
        }
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);
    
    return (
        <div ref={containerRef} className="flex flex-col h-[100vh] w-[50vw]">
            {/* Code Editor - takes remaining space */}
            <div className="flex-1 min-h-0 bg-[#1E1E1E]">
                <Editor
                    loading={null}
                    defaultValue={LeetCode.func_def}
                    height="100%"
                    defaultLanguage="python"
                    onMount={handleEditorDidMount}
                    theme="vs-dark"
                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                    }}
                />
            </div>
            
            {/* Resize Handle */}
            <div 
                onMouseDown={handleMouseDown}
                className={`h-2 bg-zinc-800 hover:bg-zinc-600 transition-colors cursor-row-resize 
                           flex items-center justify-center select-none
                           ${isDragging ? 'bg-zinc-600' : ''}`}
            >
                <div className={`w-12 h-1 rounded-full transition-colors
                                ${isDragging ? 'bg-zinc-300' : 'bg-zinc-500 hover:bg-zinc-400'}`} />
            </div>
            
            {/* Terminal Panel - fixed height based on drag */}
            <div 
                style={{ height: terminalHeight }} 
                className="bg-zinc-900 text-white overflow-auto p-4 font-mono text-sm flex-shrink-0"
            >
                <div className="flex">
                    <div className="mr-5 text-zinc-400 text-xs uppercase tracking-wider mb-2">Output</div>
                    <div className="h-5 -mt-1">
                        <button 
                            onClick={() => setOutputNum(0)}
                            className={`mr-3 hover:bg-zinc-700 text-white font-mono 
                                       text-xs py-1 px-4 rounded ${outputNum === 0 ? 'bg-zinc-600' : 'bg-zinc-800'}`}>Case 1</button> 
                        <button 
                            onClick={() => setOutputNum(1)}
                            className={`mr-3 hover:bg-zinc-700 text-white font-mono 
                                       text-xs py-1 px-4 rounded ${outputNum === 1 ? 'bg-zinc-600' : 'bg-zinc-800'}`}>Case 2</button> 
                        <button 
                            onClick={() => setOutputNum(2)}
                            className={`mr-3 hover:bg-zinc-700 text-white font-mono 
                                       text-xs py-1 px-4 rounded ${outputNum === 2 ? 'bg-zinc-600' : 'bg-zinc-800'}`}>Case 3</button> 
                    </div> 
                </div>
                {(stdErr[0] !== '' || stdErr[1] !== '' || stdErr[2] !== '') && (
                    <div className="mb-2">
                        <span className="text-red-400">stderr: </span>
                        <pre className="text-red-300 whitespace-pre-wrap">{stdErr[outputNum]}</pre>
                    </div>
                )}
                {(stdOut[0] !== '' || stdOut[1] !== '' || stdOut[2] !== '') && (
                    <div>
                        <span className="text-green-400">stdout: </span>
                        <pre className="text-green-300 whitespace-pre-wrap">{stdOut[outputNum]}</pre>
                    </div>
                )}
                {(!(stdErr[0] !== '' || stdErr[1] !== '' || stdErr[2] !== '') && 
                 !(stdOut[0] !== '' || stdOut[1] !== '' || stdOut[2] !== '')) && (
                    <div className="text-zinc-500 italic">Run your code to see output...</div>
                )}
            </div>

            {/* Results Panel */}
            <div 
                className="h-50 bg-zinc-900 text-white overflow-auto p-4 font-mono text-sm flex-shrink-0 border-t-1 border-black"
            >
                <div className="text-zinc-400 text-xs uppercase tracking-wider mb-2">Results</div>
                { loading ? 
                    <Spinner/>
                    : succeded ?  
                <>
                    <div>
                        <span className="text-green-400">Success! Now quick, submit your code!</span>
                    </div>
                    <div>
                        <span className="text-green-400">Average CPU Time: {cpuTimeMs}ms</span>
                    </div>
                </>
                    : succeded === false ? 
                <div>
                    <span className="text-red-400">Failure</span>
                    <pre className="text-zinc-400 whitespace-pre-wrap">Reason: {resultError?.reason}</pre>
                    <pre className="text-zinc-200 whitespace-pre-wrap">Test Case {resultError?.failed_case_num + 1}</pre>
                    <pre className="text-zinc-400 whitespace-pre-wrap">{resultError?.failed_case}</pre>
                </div>
                    : 
                    <></>
                }
            </div> 
            
            {/* Button Bar */}
            <div className="bg-zinc-800 flex justify-end gap-3 px-4 py-2 border-t border-zinc-700 flex-shrink-0">
                <button 
                    onClick={runCode} 
                    className="px-4 py-1.5 rounded bg-zinc-600 hover:bg-zinc-500 text-white font-medium 
                               transition-all active:scale-95 cursor-pointer"
                >
                    Run
                </button>
                <button 
                    onClick={submitCode}
                    className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium 
                               transition-all active:scale-95 cursor-pointer"
                >
                    Submit
                </button>
            </div>
        </div>
    )
}

export default CodeEditor
