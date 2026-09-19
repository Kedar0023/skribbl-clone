import { useState } from "react";
import { useNavigate } from "react-router";
import useGameStore from "../store/gameStore";
import {
  DrawablyButton,
  DrawablyCard,
  DrawablyInput,
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
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-bg text-primary p-4 select-none relative overflow-hidden">
      {/* Decorative Background Accents */}
      <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-secondary/30 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -right-16 w-80 h-80 rounded-full bg-accent/30 blur-3xl pointer-events-none" />

      <div className="text-center mb-8 z-10">
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-primary">
          <DrawablyUnderline>Create Private Room</DrawablyUnderline>
        </h1>
        <p className="text-primary/80 text-sm sm:text-base mt-2 font-bold">
          Configure room settings and invite friends to draw!
        </p>
      </div>

      <DrawablyCard className="bg-surface border-4 border-primary p-6 sm:p-8 rounded-3xl shadow-2xl w-full max-w-md flex flex-col gap-6 z-10 text-primary">
        {/* Name Input */}
        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase tracking-wider font-black text-primary">
            Your Host Nickname
          </label>
          <DrawablyInput
            type="text"
            placeholder="Enter your name..."
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="w-full text-base font-bold bg-bg text-primary placeholder:text-primary/50 border-2 border-primary"
          />
        </div>

        {/* Max Players Counter */}
        <div className="flex items-center justify-between p-3.5 bg-bg rounded-2xl border-2 border-secondary">
          <div className="flex flex-col">
            <span className="font-black text-sm text-primary">Max Players</span>
            <span className="text-xs text-primary/70 font-semibold">Allowed in room</span>
          </div>

          <div className="flex items-center gap-3">
            <DrawablyButton
              variant="outline"
              className="w-9 h-9 flex items-center justify-center text-lg font-black bg-secondary text-primary border-2 border-primary"
              onClick={handleDecrease}
            >
              -
            </DrawablyButton>

            <span className="font-mono text-xl font-black w-6 text-center text-primary">
              {maxPlayers}
            </span>

            <DrawablyButton
              variant="outline"
              className="w-9 h-9 flex items-center justify-center text-lg font-black bg-secondary text-primary border-2 border-primary"
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
            className="w-full py-3 font-black text-base bg-accent text-primary border-2 border-primary hover:brightness-105"
            onClick={handleCreateRoom}
          >
            🚀 Create & Enter Room
          </DrawablyButton>

          <DrawablyButton
            variant="outline"
            className="w-full py-2 font-bold text-sm text-primary border-2 border-primary bg-bg hover:bg-bg/80"
            onClick={() => navigate("/")}
          >
            ← Back to Home
          </DrawablyButton>
        </div>
      </DrawablyCard>
    </div>
  );
}

