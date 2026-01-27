import React, { useRef, useEffect, useState } from 'react';
import axios from 'axios';
import Login from "./pages/Login/Login";
import Lobby from "./pages/Lobby/Lobby";
import StartGame from "./pages/StartGame/StartGame";
import CodeEditor from './pages/Game/CodeEditor';
import LeetQuestion from './pages/Game/LeetQuestion';
import socket from './services/socket';
import Scoreboard from "./pages/Scoreboard/Scoreboard";
import Podium from "./pages/Podium/Podium";

function App() {
  const [questions, setQuestions] = useState(null);
  const [screen, setScreen] = useState("login");
  const [gamePin, setGamePin] = useState("");
  const [playerCount, setPlayerCount] = useState(0);
  const [lobbyNames, setLobbyNames] = useState([]);
  const [userName, setUserName] = useState('');
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [teams, setTeams] = useState([
    { id: "me", name: userName || "Team 1", score: 0 }, 
  ]);
  useEffect(() => {
    socket.connect();
    /*
      socket.on listens for events. here we are 
      listening for when the socket connects to the server 
    */
    socket.on('connect', () => { 
      console.log('Connected:', socket.id);
    });

    socket.on('player-count', (count) => {
      setPlayerCount(count);
    })
    socket.on('lobby-names', (name) => {
      console.log('lobby_names:', name)
      setLobbyNames(name);
    })
    return () => {
      socket.disconnect();  
    };
  }, [])
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

      {import.meta.env.DEV && (
        <div
          style={{
            position: "fixed",
            top: 10,
            right: 10,
            display: "flex",
            gap: "8px",
            zIndex: 9999,
          }}
        >
          <button onClick={() => setScreen("game")}>Game</button>
          <button onClick={() => setScreen("scoreboard")}>Scoreboard</button>
          <button onClick={() => setScreen("podium")}>Podium</button>
        </div>
      )}

      {screen === "login" && (
      <Login
        onJoin={(pin, name, musicOn) => {
          setMusicEnabled(musicOn);
          setGamePin(pin);
          setScreen("lobby");
          socket.emit("join-game", pin, name);
          setUserName(name);
        }}
        onStartGame={(musicOn) => {
          setMusicEnabled(musicOn);
          setScreen("startGame");
        }}
      />
    )}

    {screen === "startGame" && (
      <StartGame
        onHostJoin={(pin, name) => {
          setGamePin(pin);
          setUserName(name);
          socket.emit("join-game", pin, name);
          setScreen("lobby");
        }}
        onBack={() => setScreen("login")}
      />
    )} 

    {screen === "lobby" && (
      <Lobby
        pin={gamePin}
        lobbyNames={lobbyNames}
        onStart={() => {setScreen("game")}}
        playerCount={playerCount}
        userName={userName}
        musicEnabled={musicEnabled}
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
      
     {screen === "scoreboard" && (
       <Scoreboard
         teams={teams}
         onNext={() => setScreen("game")}
         onEnd={() => setScreen("podium")}
       />
     )}

     {screen === "podium" && (
       <Podium
         teams={teams}
         onBackToLobby={() => setScreen("lobby")}
       />
     )}
    </div>
  );
}

export default App
