import { useEffect, useState } from "react";

function Lobby({ pin, name, onStart }) {
  const [dots, setDots] = useState("");
  const playerCount = 1; // placeholder for now

  // Waiting animation: "", ".", "..", "..."
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length === 3 ? "" : prev + "."));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  // Allow Enter key to start game
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        onStart();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onStart]);

  return (
    <div className="h-screen w-screen flex flex-col justify-between bg-yellow-800 text-white px-6 py-4">

      {/* Top: Game PIN */}
      <div className="text-center text-xl font-semibold">
        Game PIN: <span className="font-mono">{pin}</span>
      </div>

      {/* Middle: Player info */}
      <div className="flex flex-col items-center justify-center flex-1 gap-4">
        <h1 className="text-5xl font-bold">{name}</h1>
        <p className="text-lg opacity-80">
          Players joined: {playerCount}
        </p>

        {/* Waiting animation */}
        <p className="text-2xl font-mono h-8">
          Waiting{dots}
        </p>
      </div>

      {/* Bottom: Start Game */}
      <div className="flex justify-center">
        <button
          onClick={onStart}
          className="bg-green-500 hover:bg-green-400 text-black font-semibold px-8 py-3 rounded-lg
                     transition-transform active:scale-95"
        >
          Start Game?
        </button>
      </div>
    </div>
  );
}

export default Lobby;
