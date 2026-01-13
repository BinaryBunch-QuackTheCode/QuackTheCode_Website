import { useEffect, useState } from "react";
import "./StartGame.css";

function StartGame({ onHostJoin, onBack }) {
  const [pin, setPin] = useState("");
  const [name, setName] = useState("");
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    const newPin = Math.floor(100000 + Math.random() * 900000).toString();
    setPin(newPin);
  }, []);

  async function handleStartGame(e) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!pin || !trimmed) return;

    setStarting(true);

    if (onHostJoin) await onHostJoin(pin, trimmed);
  }

  return (
    <div className="start-container">
      <h1 className="start-title">QuackTheCode</h1>

      <div className="start-label">Your Game PIN:</div>

      <div className="start-pin-box" aria-label="Game PIN">
        {pin || "......"}
      </div>

      <form className="start-form" onSubmit={handleStartGame}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your Name"
          className="start-name-input"
          maxLength={20}
        />

        <button
          type="submit"
          className="start-button"
          disabled={starting || !pin || !name.trim()}
        >
          {starting ? "Starting..." : "Start Game"}
        </button>
      </form>

      <button type="button" className="start-back" onClick={onBack}>
        Back
      </button>
    </div>
  );
}

export default StartGame;
