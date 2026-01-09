import React, { useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import Login from "./pages/Login/Login";

function App() {
  const editorRef = useRef(null);
  const [joined, setJoined] = useState(false);

  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor;
  }

  async function runCode(){
    try{
      const response = await axios.get('http://localhost:3000');
      console.log(response.data.message)
    }catch(e){
      console.log(`Error: ${e}`)
    }
  }

  return (
    <div>
      {!joined ? (
        <Login onJoin={() => setJoined(true)} />
      ) : (
        <>
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
      </>
      )}
    </div>
  );
}

export default App
