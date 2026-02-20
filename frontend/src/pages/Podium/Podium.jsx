import "./Podium.css";

export default function Podium({ players, onBackToLobby }) {

  const finalResults = [];

  console.log('Players: ', players);

  players.forEach(player => {
    const finalResult = {
      name: player.name,
      numSucceeded: 0,
      totalAvgCPUTimeMs: 0,
      avgSubmissionTimeMs: 0,
    };

    player.results.forEach(result => {
      console.log(result);
      if (result.succeeded) { 
        finalResult.numSucceeded++; 
        finalResult.totalAvgCPUTimeMs += result.avgCpuTimeMs; 
        finalResult.avgSubmissionTimeMs += result.submissionTimeMs; 
      }
    });

    if (finalResult.numSucceeded > 0) { 
      finalResult.totalAvgCPUTimeMs /= finalResult.numSucceeded; 
      finalResult.avgSubmissionTimeMs /= finalResult.numSucceeded; 
    }

    finalResults.push(finalResult);
  });

  return (
    <div className="podium-container">
      <h1 className="podium-title">Winners</h1>

      <div className="podium-grid">
        {finalResults.map((result, i) => (
          <div className={'podium-card place-${i + 1}'} key={i}>
            <div className="podium-medal">{i === 0 ? "gold" : i === 1 ? "silver" : "bronze"}</div>
            <div className="podium-name">{result.name}</div>
            <div className="podium-score">Questions Completed: {result.numSucceeded}</div>
            <div className="podium-score">Total Average CPU Time: {result.totalAvgCPUTimeMs}ms</div>
            <div className="podium-score">Average Submission Time: {result.avgSubmissionTimeMs / 1000} seconds</div>
          </div>
        ))}
      </div>

      <button className="podium-button" onClick={onBackToLobby}>Back to Lobby</button>
    </div>
  );
}
