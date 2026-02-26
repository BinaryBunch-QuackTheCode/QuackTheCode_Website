export default function Scoreboard({ players, onNext, onEnd, role }) {
  const roundResults = [];
  console.log('Players: ', players)
  players.forEach((player) => {
    let count = 0;
    for (let i = 0; i < player.results.length; i++) {
      const result = player.results[i];
      if (result.succeeded) {
        count++;
      }
    }
    const result = player.results[player.results.length - 1];
    player.points = (player.points || 0) + (result.succeeded ? 1000 - Math.round(result.avgCpuTimeMs/1000) - Math.round(result.submissionTimeMs/1000) : 0);
    console.log(player.points)
    roundResults.push({
      name: player.name,
      succeeded: result.succeeded,
      totalSucc: count,
      avgCpuTimeMs: result.avgCpuTimeMs,
      submissionTimeMs: result.submissionTimeMs,
      points: player.points
    });
  });

  roundResults.sort((a, b) => {
    return b.points - a.points;
  })

  return (
    <div className="relative min-h-[100dvh] w-full text-white">
      {/* ── layered background (matches Lobby) ── */}
      <div className="absolute inset-0 z-0 bg-animated" />
      <div className="absolute inset-0 z-10 bg-noise opacity-20 mix-blend-overlay pointer-events-none" />
      <div className="absolute inset-0 z-20 bg-pixels opacity-35 pointer-events-none" />

      {/* ── content ── */}
      <div className="relative z-30 min-h-[100dvh] flex flex-col items-center justify-center gap-8 px-4 py-10">
        {/* Title */}
        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight drop-shadow-[0_0_24px_rgba(16,185,129,0.45)]">
          Scoreboard
        </h1>

        {/* Results card */}
        <div className="w-full max-w-2xl bg-white/10 backdrop-blur-xl border border-white/15 rounded-2xl p-5 shadow-[0_8px_32px_rgba(0,0,0,0.35)] flex flex-col gap-3">
          {roundResults.map((result, idx) => (
            <div
              key={idx}
              className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0 justify-between bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-5 py-4 transition-colors duration-200"
            >
              {/* Left — Name + Badge */}
              <div className="flex items-center gap-3">
                <span className="text-lg sm:text-xl font-bold">{result.name}</span>
                <span
                  className={[
                    "text-xs font-semibold px-2.5 py-0.5 rounded-full",
                    result.succeeded
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30"
                      : "bg-red-500/20 text-red-300 border border-red-400/30",
                  ].join(" ")}
                >
                  {result.succeeded ? "✓ Completed" : "✗ Incomplete"}
                </span>
              </div>

              {/* Right — Stats */}
              <div className="flex items-center gap-4 text-sm text-white/70">
                <span className="flex items-center gap-1.5">
                  <span className="text-emerald-400">💰</span>
                  {result.points} Points
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-emerald-400">⚡</span>
                  {result.avgCpuTimeMs}ms
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-amber-400">⏱</span>
                  {(result.submissionTimeMs / 1000).toFixed(1)}s
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Host actions */}
        {role === "host" && (
          <div className="flex gap-4">
            <button
              onClick={onNext}
              className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-7 py-3 rounded-lg transition-all duration-150 active:scale-95 cursor-pointer shadow-lg shadow-emerald-500/25"
            >
              Next Question
            </button>
            <button
              onClick={onEnd}
              className="bg-white/10 hover:bg-white/15 border border-white/20 font-semibold px-7 py-3 rounded-lg transition-all duration-150 active:scale-95 cursor-pointer backdrop-blur-md"
            >
              End Game
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
