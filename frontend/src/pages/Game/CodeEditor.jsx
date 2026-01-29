import Editor from '@monaco-editor/react';
import React, { useRef, useState, useCallback, useEffect } from 'react';
import socket from '../../services/socket';

function CodeEditor() {
    const [stdOut, setStdOut] = useState('');
    const [stdErr, setStdErr] = useState('');
    const [terminalHeight, setTerminalHeight] = useState(200);
    const [isDragging, setIsDragging] = useState(false);
    const editorRef = useRef(null);
    const containerRef = useRef(null);
    
    function handleEditorDidMount(editor, monaco) {
        editorRef.current = editor;
    }
    
    function runCode() {
        const code = editorRef.current.getValue();
        socket.emit('user-submission', code, (res) => {
            console.log(res)
            if(res.status === "ERROR"){
                setStdErr(res.message || 'Unknown error');
            } else {
                setStdErr(res.results?.[0].stderr || '');
                setStdOut(res.results?.[0].stdout || '');
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
            <div className="flex-1 min-h-0">
                <Editor
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
                <div className="text-zinc-400 text-xs uppercase tracking-wider mb-2">Output</div>
                {stdErr && (
                    <div className="mb-2">
                        <span className="text-red-400">stderr: </span>
                        <pre className="text-red-300 whitespace-pre-wrap">{stdErr}</pre>
                    </div>
                )}
                {stdOut && (
                    <div>
                        <span className="text-green-400">stdout: </span>
                        <pre className="text-green-300 whitespace-pre-wrap">{stdOut}</pre>
                    </div>
                )}
                {!stdErr && !stdOut && (
                    <div className="text-zinc-500 italic">Run your code to see output...</div>
                )}
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