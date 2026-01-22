import { useEffect, useState } from "react";
import socket from "../../services/socket";
import CharacterSelect from "./CharacterSelect";

function Lobby({ pin, userName, lobbyNames, onStart, playerCount = 1 }) {
  const [dots, setDots] = useState("");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selections, setSelections] = useState({});
  const myId = socket.id;

  // keeps teammate line safe + avoids undefined entries
  const playerName = {};
  const safeLobbyNames = (lobbyNames || []).filter(Boolean);

  const handlePick = (slotIndex) => {
    setSelections((prev) => ({ ...prev, [myId]: slotIndex }));
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length === 3 ? "" : prev + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter") onStart();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onStart]);

  return (
    <div className="h-screen w-screen flex flex-col justify-between bg-yellow-800 text-white px-6 py-4">
      {/* Left hover/click drawer for players */}
      <div
        className="fixed left-0 top-0 h-full z-50 group"
        onMouseEnter={() => setDrawerOpen(true)}
        onMouseLeave={() => setDrawerOpen(false)}
      >
        {/* Peek handle */}
        <button
          type="button"
          onClick={() => setDrawerOpen((v) => !v)}
          className={[
            "h-full w-10 flex items-center justify-center",
            "bg-white/10 hover:bg-white/15",
            "backdrop-blur-md border-r border-white/15",
            "transition cursor-pointer",
          ].join(" ")}
          aria-label="Toggle player list"
          title="Players"
        >
          <span
            className={[
              "text-white/80 text-xl select-none",
              "transition-transform duration-200",
              drawerOpen ? "rotate-180" : "",
            ].join(" ")}
          >
            ❯
          </span>
        </button>

        {/* Glass panel */}
        <div
          className={[
            "absolute left-0 top-0 h-full w-72",
            "bg-gradient-to-b from-white/20 to-white/5 backdrop-blur-xl",
            "border-r border-white/15",
            "shadow-[0_0_30px_rgba(0,0,0,0.25)]",
            "text-white p-4",
            "transform transition-transform duration-200 ease-out",
            drawerOpen ? "translate-x-0" : "-translate-x-[calc(100%-2.5rem)]",
          ].join(" ")}
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="font-bold text-lg">Players</div>
              <div className="text-sm opacity-80">{playerCount} joined</div>
            </div>

            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="px-2 py-1 rounded-md bg-white/10 hover:bg-white/15 border border-white/15"
              aria-label="Close player list"
            >
              ✕
            </button>
          </div>

          <div className="space-y-2 overflow-auto max-h-[calc(100vh-120px)] pr-1">
            {/* You */}
            <div className="rounded-md px-3 py-2 bg-white/10 border border-white/15">
              <div className="font-semibold">{userName}</div>
              <div className="text-xs opacity-70">(You)</div>
            </div>

            {/* Teammate line preserved, just moved here */}
            {safeLobbyNames
              .filter(({ id } = playerName) => id !== socket.id)
              .map(({ name } = playerName, index) => (
                <p
                  key={index}
                  className="rounded-md px-3 py-2 bg-white/5 border border-white/10 font-semibold"
                >
                  {name}
                </p>
              ))}
          </div>
        </div>
      </div>

      {/* Top */}
      <div className="text-center text-xl font-semibold">
        Game PIN: <span className="font-mono">{pin}</span>
      </div>

      {/* Middle */}
      <div className="flex flex-col items-center justify-center flex-1 gap-4 w-full">
        <h1 className="text-5xl font-bold">{userName}</h1>
        <p className="text-lg opacity-80">Players joined: {playerCount}</p>
        <div className="text-center">
          <div className="text-3xl sm:text-4xl font-extrabold tracking-wide">
            Choose Your Quacker!
          </div>
        </div>
        <div className="w-full max-w-4xl">
          <CharacterSelect
            lobbyNames={lobbyNames}
            userName={userName}
            selections={selections}
            myId={myId}
            onPick={handlePick}
          />
        </div>

        {/* Waiting */}
        <p className="text-2xl font-mono h-8">Waiting{dots}</p>
      </div>

      {/* Bottom */}
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
