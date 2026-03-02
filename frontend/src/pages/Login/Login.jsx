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
    <div className="relative min-h-[100dvh] w-full text-white">
      {/* Animated background */}
      <div className="absolute inset-0 z-0 bg-animated" />
      {/* Noise overlay */}
      <div className="absolute inset-0 z-10 bg-noise opacity-20 mix-blend-overlay pointer-events-none" />
      <div className="absolute inset-0 z-20 bg-pixels opacity-35 pointer-events-none" />

      {/* Content */}
      <div className="relative z-30 min-h-[100dvh] flex flex-col justify-center items-center">
        <h1 className="text-white text-5xl mb-8 font-['Press_Start_2P']">QuackTheCode</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 items-center text-black">
          {step === "pin" ? (
            <input
              type="text"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Game PIN"
              className="px-3 py-3 text-2xl text-center rounded-none border-4 border-black bg-white w-56 outline-none font-['Press_Start_2P'] text-sm placeholder:text-gray-400 placeholder:text-xs focus:border-green-600 focus:ring-2 focus:ring-green-300"
              maxLength={6}
            />
          ) : (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="px-3 py-3 text-2xl text-center rounded-none border-4 border-black bg-white w-56 outline-none font-['Press_Start_2P'] text-sm placeholder:text-gray-400 placeholder:text-xs focus:border-green-600 focus:ring-2 focus:ring-green-300"
              maxLength={20}
            />
          )}
          <label className="flex items-center gap-2 text-white font-['Press_Start_2P'] text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={musicEnabled}
              onChange={(e) => setMusicEnabled(e.target.checked)}
              className="w-4 h-4 accent-green-600"
            />
            <span>Music</span>
          </label>

          <button type="submit" className="font-['Press_Start_2P'] text-xs px-5 py-3 bg-green-600 text-white border-4 border-black rounded-none cursor-pointer hover:bg-green-700 active:translate-x-0.5 active:translate-y-0.5 w-56 shadow-[4px_4px_0_rgba(0,0,0,0.3)]">
            {step === "pin" ? "Enter PIN" : "Join Game"}
          </button>
        </form>

        <p className="font-['Press_Start_2P'] text-sm text-gray-400 my-3">OR</p>

        <button
          type="button"
          className="font-['Press_Start_2P'] text-xs px-5 py-3 bg-green-600 text-white border-4 border-black rounded-none cursor-pointer hover:bg-green-700 active:translate-x-0.5 active:translate-y-0.5 w-56 shadow-[4px_4px_0_rgba(0,0,0,0.3)]"
          onClick={() => onStartGame(musicEnabled)}
        >
          Start a Game
        </button>
      </div>
    </div>
  );
}

export default Login;
