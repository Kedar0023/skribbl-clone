import { useState } from "react";
import { useNavigate } from "react-router";
import useGameStore from "../store/gameStore";
import {
  DrawablyButton,
  DrawablyCard,
  DrawablyInput,
  DrawablyBadge,
  DrawablyUnderline,
} from "drawably/react";

export function meta() {
  return [
    { title: "Create Room - Skribbl Game" },
    { name: "description", content: "Create a private room for Skribbl game" },
  ];
}

export default function CreateRoom() {
  const [playerName, setPlayerName] = useState("");
  const [maxPlayers, setMaxPlayers] = useState(8);
  const navigate = useNavigate();
  const { actions } = useGameStore();

  const handleDecrease = () => {
    setMaxPlayers((prev) => Math.max(2, prev - 1));
  };

  const handleIncrease = () => {
    setMaxPlayers((prev) => Math.min(16, prev + 1));
  };

  const handleCreateRoom = () => {
    const name = playerName.trim() || "Host";
    actions.createRoom(name, (roomId) => {
      navigate("/game");
    });
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-white p-4 select-none">
      <div className="text-center mb-8">
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
          <DrawablyUnderline>Create Private Room</DrawablyUnderline>
        </h1>
        <p className="text-teal-300/80 text-sm sm:text-base mt-2">
          Configure room settings and invite friends to draw!
        </p>
      </div>

      <DrawablyCard className="bg-slate-900/90 backdrop-blur-md border-2 border-teal-700/60 p-6 sm:p-8 rounded-3xl shadow-2xl w-full max-w-md flex flex-col gap-6">
        {/* Name Input */}
        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase tracking-wider font-bold text-slate-300">
            Your Host Nickname
          </label>
          <DrawablyInput
            type="text"
            placeholder="Enter your name..."
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="w-full text-base font-semibold text-slate-900"
          />
        </div>

        {/* Max Players Counter */}
        <div className="flex items-center justify-between p-3 bg-slate-800/80 rounded-2xl border border-slate-700">
          <div className="flex flex-col">
            <span className="font-bold text-sm text-slate-200">Max Players</span>
            <span className="text-xs text-slate-400">Allowed in room</span>
          </div>

          <div className="flex items-center gap-3">
            <DrawablyButton
              variant="outline"
              className="w-9 h-9 flex items-center justify-center text-lg font-bold"
              onClick={handleDecrease}
            >
              -
            </DrawablyButton>

            <span className="font-mono text-xl font-bold w-6 text-center text-amber-300">
              {maxPlayers}
            </span>

            <DrawablyButton
              variant="outline"
              className="w-9 h-9 flex items-center justify-center text-lg font-bold"
              onClick={handleIncrease}
            >
              +
            </DrawablyButton>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 mt-2">
          <DrawablyButton
            variant="solid"
            className="w-full py-3 font-bold text-base bg-teal-500 hover:bg-teal-600"
            onClick={handleCreateRoom}
          >
            🚀 Create & Enter Room
          </DrawablyButton>

          <DrawablyButton
            variant="outline"
            className="w-full py-2 font-semibold text-sm text-slate-400"
            onClick={() => navigate("/")}
          >
            ← Back to Home
          </DrawablyButton>
        </div>
      </DrawablyCard>
    </div>
  );
}
