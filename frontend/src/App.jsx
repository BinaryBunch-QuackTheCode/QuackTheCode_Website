import React, { useRef } from 'react';
import Editor from '@monaco-editor/react';
import axios from 'axios';
function App() {
  const editorRef = useRef(null);

  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor;
  }

  async function runCode(){
    try{
      const response = await axios.get(' http://localhost:3000');
      console.log(response.data.message)
    }catch(e){
      console.log(`Error: ${e}`)
    }
  }

  return (
    <div>
      <button onClick={runCode} className='border-2 p-1 rounded-md bg-green-400 cursor-pointer active:scale-95 
                   transition-transform duration-75"'>
        Run
      </button>
      <Editor
        height="90vh"
        defaultLanguage="python"
        onMount={handleEditorDidMount}
        backgroundColor='dark'
        theme="vs-dark"
      />
    </div>
  );
}

export default App
