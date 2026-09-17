import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import useGameStore from "../store/gameStore";
import {
  DrawablyButton,
  DrawablyInput,
  DrawablyCard,
  DrawablyUnderline,
  DrawablyHighlight,
  DrawablyBadge,
} from "drawably/react";

export function meta() {
  return [
    { title: "Skribbl Clone - Hand-Drawn Multiplayer Drawing Game" },
    { name: "description", content: "Play Skribbl clone with hand-drawn Drawably UI and real-time multiplayer!" },
  ];
}

export default function Home() {
  const [playerName, setPlayerName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [showJoinInput, setShowJoinInput] = useState(false);
  const navigate = useNavigate();

  const { roomId, actions } = useGameStore();

  // Watch for roomId to navigate to the game room
  useEffect(() => {
    if (roomId) {
      navigate("/game");
    }
  }, [roomId, navigate]);

  const handlePlayClick = () => {
    if (!playerName.trim()) {
      alert("Please enter your nickname!");
      return;
    }
    actions.joinQuickGame(playerName.trim());
  };

  const handleCreateRoomClick = () => {
    if (!playerName.trim()) {
      alert("Please enter your nickname!");
      return;
    }
    actions.createRoom(playerName.trim(), () => {
      navigate("/game");
    });
  };

  const handleJoinViaCodeClick = () => {
    if (!playerName.trim()) {
      alert("Please enter your nickname!");
      return;
    }
    setShowJoinInput(true);
  };

  const submitJoinCode = () => {
    const code = joinCode.trim();
    if (!code) {
      alert("Please enter a room code!");
      return;
    }
    actions.joinRoom(code, playerName.trim());
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 select-none relative overflow-hidden">

      {/* Header / Title */}
      <div className="text-center mb-8 z-10">
        <div className="inline-block mb-3">
          <DrawablyBadge variant="outline" className="text-xs sm:text-sm font-bold text-amber-300 px-3 py-1">
            ✨ Freehand Multiplayer Drawing Game
          </DrawablyBadge>
        </div>
        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-white drop-shadow-md">
          <DrawablyUnderline>Skribbl</DrawablyUnderline>{" "}
          <DrawablyHighlight>Draw</DrawablyHighlight>
        </h1>
        <p className="text-slate-400 text-sm sm:text-base mt-2">
          Guess words, doodle with friends, climb the leaderboard!
        </p>
      </div>

      {/* Main Interaction Card */}
      <DrawablyCard className=" backdrop-blur-md  p-6 sm:p-8 rounded-3xl shadow-2xl w-full max-w-md flex flex-col gap-6 z-10">
        {/* Name Input & Play Button */}
        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase tracking-wider font-bold text-slate-400">
            Player Nickname
          </label>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <DrawablyInput
                type="text"
                placeholder="Enter your name..."
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                maxLength={18}
                className="w-full text-base font-semibold text-slate-900 placeholder:text-slate-400"
              />
            </div>
            <DrawablyButton
              onClick={handlePlayClick}
              variant="solid"
              className="px-5 py-2 font-bold text-base"
            >
              Play
            </DrawablyButton>
          </div>
        </div>

        {/* Join by Code Form (if opened) */}
        {showJoinInput && (
          <div className="flex flex-col gap-2 p-3 bg-slate-800/80 rounded-2xl border border-slate-700 animate-in fade-in">
            <label className="text-xs uppercase tracking-wider font-bold text-amber-300">
              Enter Room Code
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <DrawablyInput
                  type="text"
                  placeholder="e.g. room-1234"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  className="w-full text-sm font-mono text-slate-900 placeholder:text-slate-400"
                />
              </div>
              <DrawablyButton
                onClick={submitJoinCode}
                variant="solid"
                className="px-4 py-1.5 font-bold text-sm"
              >
                Join
              </DrawablyButton>
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-slate-700" />
          <span className="text-xs uppercase font-bold text-slate-500">OR</span>
          <div className="flex-1 h-px bg-slate-700" />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <DrawablyButton
            onClick={handleCreateRoomClick}
            variant="outline"
            className="w-full py-2.5 font-bold text-base text-slate-200"
          >
            ➕ Create Private Room
          </DrawablyButton>

          {!showJoinInput && (
            <DrawablyButton
              onClick={handleJoinViaCodeClick}
              variant="outline"
              className="w-full py-2.5 font-bold text-base text-slate-300"
            >
              🔑 Join via Room Code
            </DrawablyButton>
          )}
        </div>
      </DrawablyCard>

      {/* Footer */}
      <footer className="mt-8 text-center text-xs text-slate-500 z-10">
        <p>Built with React Router, Drawably UI, and Socket.IO</p>
      </footer>
    </div>
  );
}
