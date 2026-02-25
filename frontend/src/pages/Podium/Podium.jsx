export default function Podium({ players, onBackToLobby }) {
  const finalResults = [];

  players.forEach((player) => {
    const finalResult = {
      name: player.name,
      numSucceeded: 0,
      totalAvgCPUTimeMs: 0,
      avgSubmissionTimeMs: 0,
      points: player.points || 0,
    };

    player.results.forEach((result) => {
      console.log(result.points);
      if (result.succeeded) {
        finalResult.numSucceeded++;
        finalResult.totalAvgCPUTimeMs += result.avgCpuTimeMs;
        finalResult.avgSubmissionTimeMs += result.submissionTimeMs;
      }
      console.log()
    });

    if (finalResult.numSucceeded > 0) {
      finalResult.totalAvgCPUTimeMs /= finalResult.numSucceeded;
      finalResult.avgSubmissionTimeMs /= finalResult.numSucceeded;
    }

    finalResults.push(finalResult);
  });

  //sort the final results from highest to lowest points
  finalResults.sort((a,b) => {
    return b.points - a.points;
  })

  // Only take top 3
  const top3 = finalResults.slice(0, 3);

  // Podium display order: 2nd, 1st, 3rd
  const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean);

  const podiumConfig = [
    { medal: "🥈", label: "2nd", height: "h-40", gradient: "from-gray-300/20 to-gray-400/10", border: "border-gray-300/30", glow: "" },
    { medal: "🥇", label: "1st", height: "h-56", gradient: "from-amber-300/20 to-yellow-400/10", border: "border-amber-300/40", glow: "shadow-[0_0_40px_rgba(251,191,36,0.25)]" },
    { medal: "🥉", label: "3rd", height: "h-32", gradient: "from-orange-400/20 to-orange-500/10", border: "border-orange-400/30", glow: "" },
  ];

  return (
    <div className="relative min-h-[100dvh] w-full text-white">
      {/* ── layered background ── */}
      <div className="absolute inset-0 z-0 bg-animated" />
      <div className="absolute inset-0 z-10 bg-noise opacity-20 mix-blend-overlay pointer-events-none" />
      <div className="absolute inset-0 z-20 bg-pixels opacity-35 pointer-events-none" />

      {/* ── content ── */}
      <div className="relative z-30 min-h-[100dvh] flex flex-col items-center justify-center gap-10 px-4 py-10">
        {/* Title */}
        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight drop-shadow-[0_0_24px_rgba(251,191,36,0.4)]">
          🏆 Winners
        </h1>

        {/* Podium */}
        <div className="flex items-end justify-center gap-4 sm:gap-6 w-full max-w-3xl">
          {podiumOrder.map((result, i) => {
            const cfg = podiumConfig[i];
            if (!result) return null;

            return (
              <div key={i} className="flex flex-col items-center gap-3 flex-1 max-w-[240px]">
                {/* Player info card */}
                <div
                  className={[
                    "w-full bg-white/10 backdrop-blur-xl border rounded-2xl p-4 text-center",
                    "transition-all duration-300",
                    cfg.border,
                    cfg.glow,
                  ].join(" ")}
                >
                  <div className="text-4xl sm:text-5xl mb-2">{cfg.medal}</div>
                  <div className="text-lg sm:text-xl font-bold truncate">{result.name}</div>
                  <div className="mt-2 space-y-1 text-xs sm:text-sm text-white/70">
                    <div>✅ {result.points} Points</div>
                    <div>✅ {result.numSucceeded} solved</div>
                    <div>⚡ {result.totalAvgCPUTimeMs.toFixed(1)}ms avg</div>
                    <div>⏱ {(result.avgSubmissionTimeMs / 1000).toFixed(1)}s avg</div>
                  </div>
                </div>

                {/* Podium pillar */}
                <div
                  className={[
                    "w-full rounded-t-xl bg-gradient-to-t border border-b-0",
                    cfg.height,
                    cfg.gradient,
                    cfg.border,
                    "flex items-center justify-center",
                    "transition-all duration-500",
                  ].join(" ")}
                >
                  <span className="text-2xl sm:text-3xl font-extrabold text-white/60">
                    {cfg.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Back button */}
        <button
          onClick={onBackToLobby}
          className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-8 py-3 rounded-lg transition-all duration-150 active:scale-95 cursor-pointer shadow-lg shadow-emerald-500/25"
        >
          Back to Lobby
        </button>
      </div>
    </div>
  );
}
