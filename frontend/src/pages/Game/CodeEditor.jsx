import Editor from '@monaco-editor/react';
import React, { useRef } from 'react';
import axios from 'axios';
import socket from '../../services/socket';

function CodeEditor() {
    const editorRef = useRef(null);
    function handleEditorDidMount(editor, monaco) {
        editorRef.current = editor;
    }
    async function runCode() {
        try {
            const response = await axios.post('/submit', { code: editorRef.current.getValue() });
            console.log(response.data.message);
        } catch (e) {
            console.log(`Error: ${e}`);
        }
    }
    return (
        <div>
            <Editor
                height="90vh"
                defaultLanguage="python"
                onMount={handleEditorDidMount}
                backgroundColor='dark'
                theme="vs-dark"
                width="50vw"
            />
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