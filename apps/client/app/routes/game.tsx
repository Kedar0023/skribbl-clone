import { useEffect } from "react";
import { useNavigate } from "react-router";
import useGameStore from "../store/gameStore";
import Navbar from "../components/Navbar";
import Players from "../components/Players";
import ChatBox from "../components/ChatBox";
import Canvas from "../components/Canvas";
import Leaderboard from "../components/Leaderboard";
import { GameState } from "@repo/types/socket";
import { DrawablyButton, DrawablyCard, DrawablyBadge } from "drawably/react";

export function meta() {
  return [
    { title: "Playing Skribbl Game" },
    { name: "description", content: "Skribbl game room" },
  ];
}

export default function Game() {
  const navigate = useNavigate();
  const {
    roomId,
    users,
    currentUser,
    currentDrawerId,
    gameState,
    isHost,
    isDrawer,
    timeInSec,
    availableWords,
    wordToGuess,
    actions: { selectWord, startGame },
  } = useGameStore();

  // If user accesses /game directly without a room, return to lobby
  useEffect(() => {
    if (!roomId) {
      navigate("/");
    }
  }, [roomId, navigate]);

  if (!roomId) {
    return null;
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-bg text-primary overflow-hidden select-none">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Game Workspace */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left: Players list */}
        <Players players={users} currentDrawerId={currentDrawerId} />

        {/* Center: Canvas area with game state overlays */}
        <div className="flex-1 relative flex flex-col bg-bg overflow-hidden">
          {/* LOBBY Overlay */}
          {gameState === GameState.LOBBY && (
            <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-primary/80 backdrop-blur-sm p-4 animate-in fade-in">
              <DrawablyCard className="bg-bg border-4 border-primary p-8 rounded-3xl shadow-2xl max-w-md w-full text-center flex flex-col items-center gap-4 text-primary">
                <DrawablyBadge
                  variant="outline"
                  className="text-xs font-black bg-accent text-primary px-3 py-1 border border-primary"
                >
                  GAME LOBBY
                </DrawablyBadge>
                <h2 className="text-3xl font-black text-primary">
                  Waiting for players...
                </h2>
                <p className="text-primary/80 text-sm font-semibold">
                  {users.length} player{users.length === 1 ? "" : "s"} in room.
                  {users.length < 2 && " (Need at least 2 players to start)"}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  {isHost ? (
                    <DrawablyButton
                      onClick={startGame}
                      variant="solid"
                      disabled={users.length < 2}
                      className="px-8 py-3 text-lg font-black bg-accent text-primary border-2 border-primary hover:brightness-105 disabled:opacity-50"
                    >
                      ▶ Start Game (Host)
                    </DrawablyButton>
                  ) : (
                    <div className="text-sm font-bold text-primary/80 italic">
                      Waiting for the host to start the match...
                    </div>
                  )}
                </div>
              </DrawablyCard>
            </div>
          )}

          {/* STARTING Countdown Overlay */}
          {gameState === GameState.STARTING && (
            <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-primary/80 backdrop-blur-sm p-4 animate-in fade-in">
              <DrawablyCard className="bg-bg border-4 border-primary p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center flex flex-col items-center gap-3 text-primary">
                <DrawablyBadge
                  variant="outline"
                  className="text-xs font-black bg-secondary text-primary px-3 py-1 border border-primary"
                >
                  GET READY!
                </DrawablyBadge>
                <h2 className="text-2xl font-black text-primary">
                  Game Starting In
                </h2>
                <div className="text-6xl font-black text-accent font-mono animate-bounce">
                  {timeInSec}
                </div>
              </DrawablyCard>
            </div>
          )}

          {/* CHOOSING Overlay (Drawer view) */}
          {gameState === GameState.CHOOSING && isDrawer && (
            <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-primary/85 backdrop-blur-sm p-4 animate-in fade-in">
              <DrawablyCard className="bg-bg border-4 border-primary p-8 rounded-3xl shadow-2xl max-w-lg w-full text-center flex flex-col items-center gap-5 text-primary">
                <DrawablyBadge
                  variant="outline"
                  className="text-xs font-black bg-accent text-primary px-3 py-1 border border-primary"
                >
                  YOUR TURN TO DRAW!
                </DrawablyBadge>
                <h2 className="text-3xl font-black text-primary">
                  Choose a Word to Draw!
                </h2>
                <div className="flex flex-wrap items-center justify-center gap-3 w-full mt-2">
                  {availableWords.map((word) => (
                    <DrawablyButton
                      key={word}
                      onClick={() => selectWord(word)}
                      variant="solid"
                      className="px-6 py-3 text-lg font-black capitalize bg-secondary text-primary border-2 border-primary hover:brightness-105"
                    >
                      {word}
                    </DrawablyButton>
                  ))}
                </div>
                <div className="text-xs font-bold text-primary/70">
                  Pick before timer runs out: {timeInSec}s
                </div>
              </DrawablyCard>
            </div>
          )}

          {/* CHOOSING Overlay (Guesser view) */}
          {gameState === GameState.CHOOSING && !isDrawer && (
            <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-primary/80 backdrop-blur-sm p-4 animate-in fade-in">
              <DrawablyCard className="bg-bg border-4 border-primary p-8 rounded-3xl shadow-2xl max-w-md w-full text-center flex flex-col items-center gap-3 text-primary">
                <h2 className="text-2xl font-black text-primary">
                  ✏️ The drawer is picking a word...
                </h2>
                <p className="text-primary/80 text-sm font-semibold">
                  Get ready to guess quickly for maximum points!
                </p>
              </DrawablyCard>
            </div>
          )}

          {/* ROUND_END Overlay */}
          {gameState === GameState.ROUND_END && (
            <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-primary/85 backdrop-blur-sm p-4 animate-in fade-in">
              <DrawablyCard className="bg-bg border-4 border-primary p-8 rounded-3xl shadow-2xl max-w-md w-full text-center flex flex-col items-center gap-3 text-primary">
                <DrawablyBadge
                  variant="outline"
                  className="text-xs font-black bg-accent text-primary px-3 py-1 border border-primary"
                >
                  ROUND OVER
                </DrawablyBadge>
                <h2 className="text-2xl font-bold text-primary/80">
                  The word was:
                </h2>
                <div className="text-4xl font-black text-primary capitalize tracking-wider font-mono">
                  {wordToGuess || "..."}
                </div>
                <p className="text-primary/70 text-sm mt-2 font-semibold">
                  Preparing the next turn...
                </p>
              </DrawablyCard>
            </div>
          )}

          {/* Freehand SVG Canvas */}
          <Canvas />
        </div>

        {/* Right: ChatBox */}
        <ChatBox />
      </div>

      {/* GAME_END: Leaderboard Modal */}
      {gameState === GameState.GAME_END && <Leaderboard />}
    </div>
  );
}

