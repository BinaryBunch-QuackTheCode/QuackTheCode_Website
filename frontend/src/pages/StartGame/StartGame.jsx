import { useEffect, useState } from "react";
import "./StartGame.css";
import socket from '../../services/socket';

function StartGame({ onHostJoin, onBack, getRole, triggerNotification}) {
  const [pin, setPin] = useState("");
  const [name, setName] = useState("");
  const [starting, setStarting] = useState(false);
  const [roundDuration, setRoundDuration] = useState(20);

  useEffect(() => {
    socket.emit('create-pin', (uniquePin) => {
      setPin(uniquePin);
    });
  }, []);

  async function handleStartGame(e) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!pin || !trimmed) return;
    if (roundDuration <= 0) { 
      triggerNotification("Error", "Round time must be greater than 0");
      return;
    }
    socket.emit('create-game', roundDuration, name, pin, (role) => {
      console.log('Role: ', role);
      getRole(role);
    })
    setStarting(true);
    if (onHostJoin) await onHostJoin(pin, trimmed);
  }

  return (
    <div className="h-screen flex flex-col justify-center items-center bg-[#232323]">
      <h1 className="text-white text-5xl mb-8 font-['Press_Start_2P']">QuackTheCode</h1>

      <div className="font-['Press_Start_2P'] text-sm text-white/75 mb-4">Your Game PIN:</div>

      <div className="font-['Press_Start_2P'] text-2xl tracking-wider text-black bg-white border-4 border-black rounded-none px-5 py-3 mb-6 min-w-[200px] text-center shadow-[3px_3px_0_rgba(0,0,0,0.2)]" aria-label="Game PIN">
        {pin || "......"}
      </div>

      <form className="flex flex-col gap-3 items-center" onSubmit={handleStartGame}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your Name"
          className="px-3 py-3 text-center rounded-none border-4 border-black bg-white w-56 outline-none font-['Press_Start_2P'] text-sm placeholder:text-gray-400 placeholder:text-xs focus:border-green-600 focus:ring-2 focus:ring-green-300"
          maxLength={20}
        />

        <button
          type="submit"
          className="font-['Press_Start_2P'] text-xs px-5 py-3 bg-green-600 text-white border-4 border-black rounded-none cursor-pointer hover:bg-green-700 active:translate-x-0.5 active:translate-y-0.5 w-56 shadow-[4px_4px_0_rgba(0,0,0,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={starting || !pin || !name.trim()}
        >
          {starting ? "Starting..." : "Start Game"}
        </button>
      </form>
        <form class="max-w-sm mx-auto">
            <label for="number-input" class="block mb-2.5 text-white mt-4 text-sm font-medium text-heading">Game Time (minutes):</label>
            <input type="number" id="number-input" aria-describedby="helper-text-explanation" class="block w-full px-3 py-2.5 bg-neutral-secondary-medium border border-white text-white text-heading text-sm rounded-base focus:ring-brand focus:border-brand shadow-xs placeholder:text-body" placeholder="10" required onChange={(e) => setRoundDuration(e.target.value * 60)}/>
        </form>

      <button type="button" className="font-['Press_Start_2P'] text-xs mt-4 bg-transparent border-none cursor-pointer text-white/75 underline hover:text-white" onClick={onBack}>
        Back
      </button>
    </div>
  );
}

export default StartGame;
