import { useState } from "react";
import "./Login.css";
import socket from "../../services/socket";
function Login({ onJoin, onStartGame }) {
  const [pin, setPin] = useState("");
  const [name, setName] = useState("");
  const [step, setStep] = useState("pin");
  const [musicEnabled, setMusicEnabled] = useState(true);


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step === "pin") {
      /* 
      When a user types in a pin and enters we send the pin to the backend to verify
      if it is a valid pin. if it is then we will move the name section. if not then we
      clear the pin in the textbox and tell the user the to type in a valid pin
      */
      console.log("Entered PIN:", pin);
      const isValid = await new Promise((resolve) => {
        socket.emit('check-pin', pin, resolve);
      });
      if(!isValid){
        setPin('')
        return
      }
      setStep("name"); // move to name entry
    } else {
      console.log("Player name:", name);
      onJoin(pin, name); // enter the game
    }
  };

  return (
    <div className="login-container">
      <h1 className="login-title">QuackTheCode</h1>

      <form onSubmit={handleSubmit} className="login-form">
        {step === "pin" ? (
          <input
            type="text"
            value={pin}
            /* how demanding the pin is, all number for letter pin*/
            onChange={(e) => setPin(e.target.value)}
            placeholder="Game PIN"
            className="pin-input"
            maxLength={6}
          />
        ) : (
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            className="pin-input"
            maxLength={20}
          />
        )}
         <label className="music-toggle">
          <input
            type="checkbox"
            checked={musicEnabled}
            onChange={(e) => setMusicEnabled(e.target.checked)}
          />
          <span style={{ marginLeft: 8 }}>Music</span>
        </label>
        
        <button type="submit" className="login-button">
          {step === "pin" ? "Enter PIN" : "Join Game"}
        </button>
      </form>
      <h1 className="font-bold my-2">
        OR
      </h1>
      {/* Start Game button */}
      <button
        type="button"
        className="login-button"
        onClick={onStartGame}
      >
        Start a Game
      </button>
    </div>
  );
}

export default Login;
