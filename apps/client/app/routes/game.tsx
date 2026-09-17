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
    isDrawer,
    availableWords,
    wordToGuess,
    actions: { selectWord, startGame, leaveRoom },
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
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-white overflow-hidden select-none">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Game Workspace */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left: Players list */}
        <Players players={users} currentDrawerId={currentDrawerId} />

        {/* Center: Canvas area with game state overlays */}
        <div className="flex-1 relative flex flex-col bg-slate-200 overflow-hidden">
          {/* LOBBY Overlay */}
          {gameState === GameState.LOBBY && (
            <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
              <DrawablyCard className="bg-slate-900 border-2 border-slate-700 p-8 rounded-3xl shadow-2xl max-w-md w-full text-center flex flex-col items-center gap-4">
                <DrawablyBadge variant="outline" className="text-sm font-bold text-amber-300">
                  LOBBY
                </DrawablyBadge>
                <h2 className="text-3xl font-extrabold text-white">
                  Waiting for players...
                </h2>
                <p className="text-slate-400 text-sm">
                  {users.length} player{users.length === 1 ? "" : "s"} in room. Ready to start?
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <DrawablyButton
                    onClick={startGame}
                    variant="solid"
                    className="px-8 py-3 text-lg font-bold"
                  >
                    ▶ Start Game
                  </DrawablyButton>
                </div>
              </DrawablyCard>
            </div>
          )}

          {/* CHOOSING Overlay (Drawer view) */}
          {gameState === GameState.CHOOSING && isDrawer && (
            <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4 animate-in fade-in">
              <DrawablyCard className="bg-slate-900 border-2 border-slate-700 p-8 rounded-3xl shadow-2xl max-w-lg w-full text-center flex flex-col items-center gap-5">
                <DrawablyBadge variant="outline" className="text-sm font-bold text-amber-300">
                  YOUR TURN
                </DrawablyBadge>
                <h2 className="text-3xl font-extrabold text-white">
                  Choose a Word to Draw!
                </h2>
                <div className="flex flex-wrap items-center justify-center gap-3 w-full mt-2">
                  {availableWords.map((word) => (
                    <DrawablyButton
                      key={word}
                      onClick={() => selectWord(word)}
                      variant="solid"
                      className="px-6 py-3 text-lg font-bold capitalize"
                    >
                      {word}
                    </DrawablyButton>
                  ))}
                </div>
              </DrawablyCard>
            </div>
          )}

          {/* CHOOSING Overlay (Guesser view) */}
          {gameState === GameState.CHOOSING && !isDrawer && (
            <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in">
              <DrawablyCard className="bg-slate-900 border-2 border-slate-700 p-8 rounded-3xl shadow-2xl max-w-md w-full text-center flex flex-col items-center gap-3">
                <h2 className="text-2xl font-bold text-slate-200">
                  ✏️ The drawer is picking a word...
                </h2>
                <p className="text-slate-400 text-sm">
                  Get ready to guess quickly for maximum points!
                </p>
              </DrawablyCard>
            </div>
          )}

          {/* ROUND_END Overlay */}
          {gameState === GameState.ROUND_END && (
            <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4 animate-in fade-in">
              <DrawablyCard className="bg-slate-900 border-2 border-slate-700 p-8 rounded-3xl shadow-2xl max-w-md w-full text-center flex flex-col items-center gap-3">
                <DrawablyBadge variant="outline" className="text-sm font-bold text-amber-300">
                  ROUND OVER
                </DrawablyBadge>
                <h2 className="text-2xl font-bold text-slate-300">
                  The word was:
                </h2>
                <div className="text-4xl font-extrabold text-amber-300 capitalize tracking-wider font-mono">
                  {wordToGuess || "..."}
                </div>
                <p className="text-slate-400 text-sm mt-2">
                  Preparing the next round...
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
