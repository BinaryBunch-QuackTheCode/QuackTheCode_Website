/* structure + logic */
import { useState } from "react";
import "./Login.css";

function Login({ onJoin, onStartGame }) {
  const [pin, setPin] = useState("");
  /*store name*/
  const [name, setName] = useState("");
  const [step, setStep] = useState("pin");
  
  const handleSubmit = (e) => {
      e.preventDefault();
      if (step === "pin") {
        console.log("Entered PIN:", pin);
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
        <button type="submit" className="login-button">
          {step === "pin" ? "Enter PIN" : "Join Game"}
        </button>
      </form>

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
