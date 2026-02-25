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
import Spinner from './components/spinner';
import Notification from './components/notification';

function App() {
  const [questions, setQuestions] = useState(null);
  const [screen, setScreen] = useState("login");
  const [gamePin, setGamePin] = useState("");
  const [playerCount, setPlayerCount] = useState(1);
  const [lobbyNames, setLobbyNames] = useState([]);
  const [userName, setUserName] = useState('');
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playersRemaining, setPlayersRemaining] = useState(0);
  const [scoreResults, setScoreResults] = useState([]);


  const [role, setRole] = useState('');

  const triggerNotification = (title, text) => {
      setShowNotification({title, text})
      setTimeout(() => {
        setShowNotification(null);
      }, 5000);
  } 

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
    
    socket.on('get-questions', (q) => {
      console.log('questions: ', q)
      setQuestions(q);
    })

    socket.on('get-time', (t, dur) => {
      console.log('time : ', t);
      setTime(t);
      setDuration(dur);
    })

    socket.on('game-error', (message) => {
      triggerNotification('Error', message);
    });

    socket.on('players-remaining', (remaining) => {
      setPlayersRemaining(remaining);
    });

    socket.on('score-results', (players) => {
      setScoreResults(players);
    })


    return () => {
      socket.disconnect();  
    };
  }, [])

  // Fetch questions when entering the game screen
  socket.on('set-page', (obj) => {
    setScreen(obj.screen);
  })

  const [showNotification, setShowNotification] = useState(null)

  return (
    <div>
      { showNotification && 
        <Notification title={showNotification.title} text={showNotification.text}></Notification>
      }
      {screen === "login" && (
      <Login
        onJoin={(pin, name, musicOn) => {
          socket.emit("join-game", pin, name, (status) => {
            if (status) { 
              setMusicEnabled(musicOn);
              setGamePin(pin);
              setScreen("lobby");
              setUserName(name);
            }
          });
        }}
        onStartGame={(musicOn) => {
          setMusicEnabled(musicOn);
          setScreen("startGame");
        }}
      />
    )}
    {screen === "preview" && (
      <div className='flex justify-center items-center bg-[#232323] min-h-screen text-white'>
        <Spinner/> 
      </div>
    )}
    {screen === "startGame" && (
      <StartGame
        onHostJoin={(pin, name) => {
          setGamePin(pin);
          setUserName(name);
          setScreen("lobby");
        }}
        onBack={() => {
          setScreen("login");
          socket.emit("disconnect");
          }
        }
        getRole={(role) => setRole(role)}
        triggerNotification={triggerNotification}
      />
    )} 

    {screen === "lobby" && (
      <Lobby
        pin={gamePin}
        lobbyNames={lobbyNames}
        onStart={() => {
          socket.emit('start-game', gamePin);
        }}
        playerCount={playerCount}
        userName={userName}
        musicEnabled={musicEnabled}
        role={role}
      />
    )}
      {screen === "game" && (
        questions ? (
          <div className='flex flex-col xl:flex-row'>
            <CodeEditor LeetCode={questions} onFinish={() => {}}/>
            <LeetQuestion LeetInfo={questions} endTime={time} duration={duration} playersRemaining={playersRemaining}/>
          </div>
        ) : (
            <Spinner/> 
        )
      )}

      {screen === "submitted" && (
      <div className='flex justify-center items-center bg-[#232323] min-h-screen text-white'>
          Successfully Submitted! Hang tight while others complete the question
      </div>
      )}
      
     {screen === "scoreboard" && (
       <Scoreboard
         players={scoreResults}
         onNext={() => {
             if (role === 'host') { 
                socket.emit('start-game', gamePin);
             }
         }}
         onEnd={() => {
             if (role === 'host') { 
                socket.emit('switch-screen', gamePin, 'podium')
             }
         }}
         role={role}
       />
     )}

     {screen === "podium" && (
       <Podium
         players={scoreResults}
         onBackToLobby={() => {
             if (role === 'host') { 
                 socket.emit('back-to-lobby', gamePin);
             }
         }}
       />
     )}
    </div>
  );
}

export default App
