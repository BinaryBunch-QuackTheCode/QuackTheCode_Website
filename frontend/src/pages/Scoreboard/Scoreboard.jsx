import "./Scoreboard.css";

export default function Scoreboard({ teams = [], onNext, onEnd }) {
  const sorted = [...teams].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

  return (
    <div className="scoreboard-container">
      <h1 className="scoreboard-title">Scoreboard</h1>

      <div className="scoreboard-card">
        {sorted.map((t, idx) => (
          <div className="scoreboard-row" key={t.id ?? idx}>
            <div className="scoreboard-rank">{idx + 1}</div>
            <div className="scoreboard-name">{t.name}</div>
            <div className="scoreboard-score">{t.score ?? 0}</div>
          </div>
        ))}
      </div>

      <div className="scoreboard-actions">
        <button className="scoreboard-button" onClick={onNext}>Next Question</button>
        <button className="scoreboard-button secondary" onClick={onEnd}>End Game</button>
      </div>
    </div>
  );
}
