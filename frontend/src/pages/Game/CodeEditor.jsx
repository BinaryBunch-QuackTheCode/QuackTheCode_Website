import Editor from '@monaco-editor/react';
import React, { useRef } from 'react';
import axios from 'axios';
import socket from '../../services/socket';

function CodeEditor(){
    const editorRef = useRef(null);
    function handleEditorDidMount(editor, monaco) {
        editorRef.current = editor;
    }
    async function runCode(){
        try{
          const response = await axios.post('/submit', {code: editorRef.current.getValue()});
          console.log(response.data.message);
        }catch(e){
          console.log(`Error: ${e}`);
        }
    }
    return(
        <div>
            <Editor
            height="90vh"
            defaultLanguage="python"
            onMount={handleEditorDidMount}
            backgroundColor='dark'
            theme="vs-dark"
            width="50vw"
            />
            <button onClick={runCode} className='border-2 p-1 rounded-md bg-green-400 cursor-pointer active:scale-90 
            transition-transform duration-75'>
            Run
            </button>
        </div>
    )
}

export default CodeEditor