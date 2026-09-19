import { useState } from "react";
import useGameStore from "../store/gameStore";
import { DrawablyButton } from "drawably/react";

export default function Navbar() {
  const {
    round,
    totalRounds,
    wordToGuess,
    wordHint,
    timeInSec,
    roomId,
    isDrawer,
  } = useGameStore();
  const [copied, setCopied] = useState(false);
  const displayWord = isDrawer
    ? wordToGuess
    : wordHint ||
      (wordToGuess ? wordToGuess.replace(/[a-zA-Z0-9]/g, "_ ") : "");
  const copyRoomId = async () => {
    if (roomId) {
      await navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  const time = `${Math.floor(timeInSec / 60)}:${String(timeInSec % 60).padStart(2, "0")}`;
  return (
    <header className="relative z-20 flex items-center justify-between gap-3 border-b border-line bg-paper/95 px-3 py-3 text-ink">
      <p className="text-xl font-black  tracking-[.16em] sm:text-2xl">
        Round {round}/{totalRounds}
      </p>
      <div className="min-w-0 flex-1 text-center">
        <p className="text-[10px] font-black uppercase tracking-[.16em] text-lilac">
          {isDrawer ? "Your masterpiece" : "Guess the doodle"}
        </p>
        <div className="truncate text-lg font-black tracking-[.16em] text-ink sm:text-2xl">
          {displayWord || "..."}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div
          className={`rounded-xl px-3 py-1.5 font-mono text-lg font-black ${timeInSec <= 10 ? "bg-[#fff0d6] text-rose animate-pulse" : "bg-[#f1edff] text-lilac"}`}
        >
          {time}
        </div>
        {roomId && (
          <DrawablyButton
            variant="outline"
            stroke="#302b3d"
            onClick={copyRoomId}
            className="hidden bg-white px-3 py-1.5 text-xs font-black text-ink md:inline-flex stroke-1"
          >
            {copied ? "Copied!" : `Code: ${roomId}`}
          </DrawablyButton>
        )}
      </div>
    </header>
  );
}
