import { useState } from "react";
import useGameStore from "../store/gameStore";
import { DrawablyBadge, DrawablyButton } from "drawably/react";

export default function Navbar() {
  const { round, totalRounds, wordToGuess, wordHint, timeInSec, roomId, isDrawer } =
    useGameStore();
  const [copied, setCopied] = useState(false);

  const formatTime = (time: number) => {
    const min = Math.floor(time / 60);
    const sec = time % 60;
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  const copyRoomId = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Determine what word representation to display
  const displayWord = isDrawer
    ? wordToGuess
    : wordHint || (wordToGuess ? wordToGuess.replace(/[a-zA-Z0-9]/g, "_ ") : "");

  return (
    <header className="relative flex items-center justify-between px-4 py-3 bg-slate-900 border-b-2 border-slate-700 text-white shadow-md select-none z-20">
      {/* Round Info */}
      <div className="flex items-center gap-2">
        <DrawablyBadge variant="outline" className="text-sm sm:text-base font-bold text-amber-400">
          Round {round} / {totalRounds}
        </DrawablyBadge>
      </div>

      {/* Word / Word Hint Display */}
      <div className="flex flex-col items-center justify-center">
        <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-widest text-slate-400">
          {isDrawer ? "🎨 You are drawing" : "🔍 Guess the word"}
        </span>
        <div className="text-xl sm:text-3xl font-bold tracking-widest text-amber-300 font-mono mt-0.5">
          {displayWord || "..."}
        </div>
      </div>

      {/* Room ID & Timer */}
      <div className="flex items-center gap-3 sm:gap-5">
        {roomId && (
          <div className="hidden md:flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-xl border border-slate-700 text-xs">
            <span className="text-slate-400">Room:</span>
            <span className="font-mono font-bold text-slate-200">{roomId}</span>
            <DrawablyButton
              variant="outline"
              className="text-[10px] px-2 py-0.5 ml-1"
              onClick={copyRoomId}
            >
              {copied ? "✓ Copied" : "Copy"}
            </DrawablyButton>
          </div>
        )}

        <div className="flex items-center gap-2 bg-slate-800/90 px-3 py-1 rounded-xl border border-slate-700">
          <span className="text-xs text-slate-400 uppercase hidden sm:inline">Time:</span>
          <span
            className={`text-xl sm:text-2xl font-mono font-bold ${
              timeInSec <= 10 ? "text-rose-400 animate-pulse" : "text-amber-400"
            }`}
          >
            {formatTime(timeInSec)}
          </span>
        </div>
      </div>
    </header>
  );
}
