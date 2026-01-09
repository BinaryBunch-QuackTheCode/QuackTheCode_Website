import React, { useRef, useEffect, useState} from 'react';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import Login from "./pages/Login/Login";

function App() {
  const editorRef = useRef(null);
  const [joined, setJoined] = useState(false);

  const [questions, setQuestions] = useState(null)
  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor;
  }

  async function runCode(){
    try{
      const response = await axios.post('http://localhost:3000/submit', {code: editorRef.current.getValue()});
      console.log(response.data.message);
    }catch(e){
      console.log(`Error: ${e}`);
    }
  }

  useEffect(() => {
    const getQuestions = async () => {
      try{
        const response = await axios.get('http://localhost:3000/get_questions');
        setQuestions(response.data);
        console.log(response.data)
      } catch(e){
        console.log(`Error getting questions: ${e}`);
      }
    }
    getQuestions()
  }, [])

  if (!questions) {
    return <div>Loading problem...</div>;
  }

  return (
    <div>
      {!joined ? (
        <Login onJoin={() => setJoined(true)} />
      ) : (
        <>
        <h1> 
          {questions[0].title}
        </h1>
        <p>
          {questions[0].question}
        </p>
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
