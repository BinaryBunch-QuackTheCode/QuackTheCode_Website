import { useMemo } from "react";
import { characterImages } from "../../assets/characters";

export default function CharacterSelect({
  lobbyNames = [],     // [{id, name}, ...]
  userName,            // my display name
  selections = {},     // { [playerId]: slotIndex }
  myId,
  onPick,
  slotCount = 8,
}) {
  const slots = useMemo(() => Array.from({ length: slotCount }, (_, i) => i), [slotCount]);

  const players = useMemo(() => {
    const normalized = (lobbyNames || [])
      .filter(Boolean)
      .map((p) => ({ id: p.id, name: p.name }));

    const hasMe = normalized.some((p) => p.id === myId);
    return hasMe ? normalized : [{ id: myId, name: userName || "You" }, ...normalized];
  }, [lobbyNames, myId, userName]);

  // invert selections -> { [slotIndex]: playerId }
  const slotOwners = useMemo(() => {
    const owners = {};
    for (const [playerId, slotIndex] of Object.entries(selections || {})) {
      if (slotIndex !== null && slotIndex !== undefined) owners[slotIndex] = playerId;
    }
    return owners;
  }, [selections]);

  const labelForPlayer = (playerId) => {
    const idx = players.findIndex((p) => p.id === playerId);
    return idx >= 0 ? `${idx + 1}P` : "P";
  };

  const nameForPlayer = (playerId) =>
    players.find((p) => p.id === playerId)?.name || "Player";

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="grid gap-2 sm:gap-3 grid-cols-2 sm:grid-cols-4">
        {slots.map((slotIndex) => {
          const ownerId = slotOwners[slotIndex];
          const taken = ownerId !== undefined;
          const mine = ownerId === myId;

          const imgSrc = characterImages?.[slotIndex];

          return (
            <button
              key={slotIndex}
              onClick={() => !taken && onPick?.(slotIndex)}
              disabled={taken && !mine}
              className={[
                "relative rounded-md overflow-hidden aspect-square",
                "border border-white/20 bg-black/25 transition",
                taken ? "cursor-not-allowed opacity-90" : "hover:bg-black/35 cursor-pointer",
                mine ? "outline outline-4 outline-green-400" : "outline outline-1 outline-white/20",
              ].join(" ")}
            >
              {imgSrc ? (
                <img
                  src={imgSrc}
                  alt={`Character ${slotIndex + 1}`}
                  className="w-full h-full object-contain p-1"
                  draggable="false"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/60 font-mono">
                  PNG {slotIndex + 1}
                </div>
              )}

              {taken && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-1 left-1 text-xs sm:text-sm font-extrabold text-red-500 drop-shadow">
                    {labelForPlayer(ownerId)}
                  </div>
                  <div className="absolute bottom-1 left-1 right-1 text-[10px] sm:text-xs font-semibold bg-black/55 px-1 py-0.5 rounded">
                    {nameForPlayer(ownerId)}
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
