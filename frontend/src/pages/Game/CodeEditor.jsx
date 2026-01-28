import Editor from '@monaco-editor/react';
import React, { useRef, useState } from 'react';
import axios from 'axios';
import socket from '../../services/socket';

function CodeEditor() {
    const [stdOut, setStdOut] = useState('');
    const [stdErr, setStdErr] = useState('');
    const editorRef = useRef(null);
    function handleEditorDidMount(editor, monaco) {
        editorRef.current = editor;
    }
    function runCode() {
        const code = editorRef.current.getValue();
        socket.emit('user-submission', code, (res) => {
            console.log(res)
            if(res.status === "ERROR"){
                console.log('here')
                setStdErr(res.message || 'Unknown error');
            }else{
                console.log('does this even work ', res.results[0].stderr)
                setStdErr(res.results?.[0].stderr);
                setStdOut(res.results?.[0].stdout);
            }   
        });      
    }
    return (
        <div>
            <div className='relative'>
                <Editor
                    height="90vh"
                    defaultLanguage="python"
                    onMount={handleEditorDidMount}
                    backgroundColor='dark'
                    theme="vs-dark"
                    width="50vw"
                />
                <div className='absolute h-[40vh] w-[45vw] bg-green-500 left-0 bottom-0'>
                    <p>
                        strErr: {stdErr}
                    </p>
                    <p>
                        strOut: {stdOut}
                    </p>
                </div>
            </div>
            <div className='bg-black flex justify-end gap-5'>
                <button onClick={runCode} className='border-2 px-2 rounded-md bg-gray-400 cursor-pointer active:scale-90 
                transition-transform duration-75'>
                    Run
                </button>
                <button className='border-2 p-1 rounded-md bg-green-400 cursor-pointer active:scale-90 
                transition-transform duration-75'>
                    Submit
                </button>
            </div>
        </div>
    )
}

export default CodeEditor