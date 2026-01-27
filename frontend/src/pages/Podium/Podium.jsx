import "./Podium.css";

export default function Podium({ teams = [], onBack }) {
  const sorted = [...teams].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  const top = sorted.slice(0, 3);

  return (
    <div className="podium-container">
      <h1 className="podium-title">Winners</h1>

      <div className="podium-grid">
        {top.map((t, i) => (
          <div className={'podium-card place-${i + 1}'} key={t.id ?? i}>
            <div className="podium-medal">{i === 0 ? "gold" : i === 1 ? "silver" : "bronze"}</div>
            <div className="podium-name">{t.name}</div>
            <div className="podium-score">{t.score ?? 0} pts</div>
          </div>
        ))}
      </div>

      <button className="podium-button" onClick={onBack}>Back</button>
    </div>
  );
}
