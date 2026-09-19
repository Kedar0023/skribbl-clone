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
    <header className="relative flex items-center justify-between px-4 py-3 bg-primary border-b-4 border-primary text-bg shadow-lg select-none z-20">
      {/* Round Info */}
      <div className="flex items-center gap-2">
        <DrawablyBadge
          variant="outline"
          className="text-sm sm:text-base font-bold bg-bg text-primary border-primary shadow-sm px-3 py-1"
        >
          Round {round} / {totalRounds}
        </DrawablyBadge>
      </div>

      {/* Word / Word Hint Display */}
      <div className="flex flex-col items-center justify-center">
        <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-secondary">
          {isDrawer ? "✏️ You are drawing" : "🔍 Guess the word"}
        </span>
        <div className="text-xl sm:text-3xl font-extrabold tracking-widest text-bg font-mono mt-0.5 drop-shadow-sm">
          {displayWord || "..."}
        </div>
      </div>

      {/* Room ID & Timer */}
      <div className="flex items-center gap-3 sm:gap-4">
        {roomId && (
          <div className="hidden md:flex items-center gap-1.5 bg-primary/80 px-3 py-1 rounded-xl border-2 border-primary text-xs">
            <span className="text-secondary font-semibold">Room:</span>
            <span className="font-mono font-bold text-bg">{roomId}</span>
            <DrawablyButton
              variant="outline"
              className="text-[10px] px-2 py-0.5 ml-1 bg-secondary text-primary border-none font-bold hover:brightness-105"
              onClick={copyRoomId}
            >
              {copied ? "✓ Copied" : "Copy"}
            </DrawablyButton>
          </div>
        )}

        <div className="flex items-center gap-2 bg-primary/80 px-3.5 py-1.5 rounded-2xl border-2 border-secondary/50 shadow-inner">
          <span className="text-xs text-secondary font-bold uppercase hidden sm:inline">Time:</span>
          <span
            className={`text-xl sm:text-2xl font-mono font-black ${
              timeInSec <= 10 ? "text-accent animate-pulse" : "text-bg"
            }`}
          >
            {formatTime(timeInSec)}
          </span>
        </div>
      </div>
    </header>
  );
}

