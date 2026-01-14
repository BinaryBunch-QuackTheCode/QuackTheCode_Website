import React, { useRef, useEffect, useState } from 'react';
import axios from 'axios';
import Login from "./pages/Login/Login";
import Lobby from "./pages/Lobby/Lobby";
import StartGame from "./pages/StartGame/StartGame";
import CodeEditor from './pages/Game/CodeEditor';
import LeetQuestion from './pages/Game/LeetQuestion';
function App() {
  const editorRef = useRef(null);
  const [questions, setQuestions] = useState(null);
  const [screen, setScreen] = useState("login");
  const [gamePin, setGamePin] = useState("");
  const [playerName, setPlayerName] = useState("");

  // Fetch questions when entering the game screen
  useEffect(() => {
    if (screen === "game" && !questions) {
      const getQuestions = async () => {
        try {
          const response = await axios.get('/get_questions');
          setQuestions(response.data);
          console.log(response.data);
        } catch (e) {
          console.log(`Error getting questions: ${e}`);
        }
      };
      getQuestions();
    }
  }, [screen, questions]);

  return (
    <div>
      {screen === "login" && (
      <Login
        onJoin={(pin, name) => {
          setGamePin(pin);
          setPlayerName(name);
          setScreen("lobby");
        }}
        onStartGame={() => setScreen("startGame")}
      />
    )}

    {screen === "startGame" && (
      <StartGame
        onHostJoin={(pin, name) => {
          setGamePin(pin);
          setPlayerName(name);
          setScreen("lobby");
        }}
        onBack={() => setScreen("login")}
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
        questions ? (
          <div className='flex flex-col xl:flex-row'>
            <CodeEditor/>
            <LeetQuestion LeetInfo={questions}/>
          </div>
        ) : (
          <div>Loading problem...</div>
        )
      )}
    </div>
  );
}

export default App
