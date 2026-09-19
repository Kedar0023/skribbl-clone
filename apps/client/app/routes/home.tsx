import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import useGameStore from "../store/gameStore";
import { PaperButton } from "../components/Button";

export function meta() {
  return [
    { title: "Skribbl Doodle — Draw & Guess" },
    { name: "description", content: "A paper-craft multiplayer drawing game." },
  ];
}
export default function Home() {
  const [playerName, setPlayerName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [showJoinInput, setShowJoinInput] = useState(false);
  const navigate = useNavigate();
  const { roomId, actions } = useGameStore();
  useEffect(() => {
    if (roomId) navigate("/game");
  }, [roomId, navigate]);
  const requireName = () => {
    if (!playerName.trim()) {
      alert("Please enter your nickname!");
      return false;
    }
    return true;
  };
  const join = () => {
    if (!requireName()) return;
    if (!joinCode.trim()) return alert("Please enter a room code!");
    actions.joinRoom(joinCode.trim(), playerName.trim());
  };
  return (
    <main className="paper-page min-h-screen overflow-hidden px-4 py-8 text-paper-black">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-xl flex-col items-center justify-center">
        <header className="paper-enter mb-8 text-center">
          <p className="mb-2 font-body text-xs font-extrabold uppercase tracking-[.2em] text-paper-grey">
            A pocket-sized party game
          </p>
          <h1 className="font-hand text-6xl leading-[.75] sm:text-8xl">
            Skribbl{" "}
            <span className="inline-block -rotate-3 rounded-paper border-2 border-paper-black bg-paper-pink px-3 py-2 shadow-paper">
              Doodle
            </span>
          </h1>
          <p className="mx-auto mt-7 max-w-md font-body font-bold leading-relaxed text-paper-grey">
            Pick a word. Draw your best paper masterpiece. Guess before the
            clock runs out.
          </p>
        </header>
        <section
          className="paper-surface paper-enter w-full p-5 sm:p-7"
          style={{ animationDelay: "80ms" }}
        >
          <label className="mb-2 flex justify-between px-1 font-body text-xs font-extrabold uppercase tracking-[.16em]">
            <span>Your nickname</span>
            <span className="text-paper-grey">{playerName.length}/18</span>
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              className="paper-input min-w-0 flex-1 bg-white px-4 py-3 font-body font-bold placeholder:text-paper-grey"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              maxLength={18}
              placeholder="What should we call you?"
              onKeyDown={(e) =>
                e.key === "Enter" &&
                requireName() &&
                actions.joinQuickGame(playerName.trim())
              }
            />
            <PaperButton
              className="shrink-0"
              onClick={() =>
                requireName() && actions.joinQuickGame(playerName.trim())
              }
            >
              ✏ Play now
            </PaperButton>
          </div>
          {showJoinInput && (
            <div className="paper-enter mt-5 rounded-paper border-2 border-paper-black bg-paper-blue/40 p-4">
              <div className="mb-2 flex justify-between font-body text-xs font-extrabold uppercase tracking-[.16em]">
                <label htmlFor="room-code">Room code</label>
                <button
                  type="button"
                  onClick={() => setShowJoinInput(false)}
                  className="underline"
                >
                  Cancel
                </button>
              </div>
              <div className="flex gap-3">
                <input
                  id="room-code"
                  className="paper-input min-w-0 flex-1 bg-white px-3 py-2 font-mono font-bold"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  placeholder="e.g. room-1234"
                  onKeyDown={(e) => e.key === "Enter" && join()}
                />
                <PaperButton variant="blue" onClick={join}>
                  Join
                </PaperButton>
              </div>
            </div>
          )}
          <div className="my-6 flex items-center gap-3">
            <span className="h-0.5 flex-1 bg-paper-black" />
            <span className="font-hand text-xl">or make a table</span>
            <span className="h-0.5 flex-1 bg-paper-black" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <PaperButton
              variant="secondary"
              className="w-full"
              onClick={() =>
                requireName() &&
                actions.createRoom(playerName.trim(), () => navigate("/game"))
              }
            >
              Create private room
            </PaperButton>
            <PaperButton
              variant="ghost"
              className="w-full"
              onClick={() => requireName() && setShowJoinInput(true)}
            >
              Join with code
            </PaperButton>
          </div>
        </section>
        <p className="mt-7 font-body text-xs font-extrabold uppercase tracking-[.12em] text-paper-grey">
          Multiplayer · Freehand drawing · Big guesses
        </p>
      </div>
    </main>
  );
}
