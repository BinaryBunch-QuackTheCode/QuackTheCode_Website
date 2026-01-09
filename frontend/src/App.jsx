import React, { useRef, useEffect, useState} from 'react';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import Login from "./pages/Login/Login";
import Lobby from "./pages/Lobby/Lobby";

function App() {
  const editorRef = useRef(null);

  const [questions, setQuestions] = useState(null)
  const [screen, setScreen] = useState("login");
  const [gamePin, setGamePin] = useState("")
  const [playerName, setPlayerName] = useState("");
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
      {screen === "login" && (
      <Login
        onJoin={(pin, name) => {
          setGamePin(pin);
          setPlayerName(name);
          setScreen("lobby");
        }}
      />
    )}

    {screen === "lobby" && (
      <Lobby
        pin={gamePin}
        name={playerName}
        onStart={() => setScreen("game")}
      />
    )}
      {screen === "game" && (
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
