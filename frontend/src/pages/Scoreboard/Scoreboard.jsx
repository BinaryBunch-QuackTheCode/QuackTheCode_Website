import "./Scoreboard.css";

export default function Scoreboard({ players, onNext, onEnd, role }) {

  const roundResults = [];
  console.log("Players: ", players);

  players.forEach(player => {
    const result = player.results[player.results.length - 1];
    console.log(result);
    roundResults.push({
      name: player.name, 
      succeeded: result.succeeded, 
      avgCpuTimeMs: result.avgCpuTimeMs, 
      submissionTimeMs: result.submissionTimeMs
    })
  });

  return (
    <div className="scoreboard-container">
      <h1 className="scoreboard-title">Scoreboard</h1>

      <div className="scoreboard-card">
        {roundResults.map((result, idx) => (
          <div className="scoreboard-row" key={idx}>
            <div className="scoreboard-name">{result.name}</div>
            <div className="scoreboard-rank">{result.succeeded ? "Completed" : "Incomplete"}</div>
            <div className="scoreboard-score">CPU Time: {result.avgCpuTimeMs}ms</div>
            <div className="scoreboard-score">Submission Time: {result.submissionTimeMs / 1000} seconds</div>
          </div>
        ))}
      </div>

      { role === 'host' && 
      <div className="scoreboard-actions">
        <button className="scoreboard-button" onClick={onNext}>Next Question</button>
        <button className="scoreboard-button secondary" onClick={onEnd}>End Game</button>
      </div>
       }
    </div>
  );
}
