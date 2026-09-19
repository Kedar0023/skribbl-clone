import { useState } from "react";
import { useNavigate } from "react-router";
import useGameStore from "../store/gameStore";
import { PaperButton } from "../components/Button";
export function meta() {
  return [{ title: "Create a room — Skribbl Doodle" }];
}
export default function CreateRoom() {
  const [playerName, setPlayerName] = useState("");
  const [maxPlayers, setMaxPlayers] = useState(8);
  const navigate = useNavigate();
  const { actions } = useGameStore();
  return (
    <main className="paper-page flex min-h-screen items-center justify-center p-4 text-paper-black">
      <section className="w-full max-w-md">
        <header className="mb-7 text-center">
          <p className="font-body text-xs font-extrabold uppercase tracking-[.2em] text-paper-grey">
            Private doodle club
          </p>
          <h1 className="mt-2 font-hand text-6xl">Create a room</h1>
          <p className="mt-3 font-body font-bold text-paper-grey">
            Invite your favourite artists and share the code.
          </p>
        </header>
        <div className="paper-surface p-6">
          <label className="block font-body text-xs font-extrabold uppercase tracking-[.15em]">
            Host nickname
            <input
              className="paper-input mt-2 w-full bg-white px-4 py-3 font-body text-base font-bold"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              maxLength={18}
              placeholder="What should we call you?"
            />
          </label>
          <div className="mt-6 rounded-paper border-2 border-paper-black bg-paper-lilac/50 p-4">
            <p className="font-hand text-2xl">Drawing seats</p>
            <p className="text-sm font-bold text-paper-grey">
              Choose between 2 and 16 players.
            </p>
            <div className="mt-4 flex items-center justify-between">
              <PaperButton
                variant="ghost"
                className="h-10 w-10 p-0"
                onClick={() => setMaxPlayers((n) => Math.max(2, n - 1))}
              >
                −
              </PaperButton>
              <span className="font-hand text-4xl">{maxPlayers}</span>
              <PaperButton
                variant="ghost"
                className="h-10 w-10 p-0"
                onClick={() => setMaxPlayers((n) => Math.min(16, n + 1))}
              >
                +
              </PaperButton>
            </div>
          </div>
          <div className="mt-6 grid gap-3">
            <PaperButton
              className="w-full"
              onClick={() =>
                actions.createRoom(playerName.trim() || "Host", () =>
                  navigate("/game"),
                )
              }
            >
              Create & enter room
            </PaperButton>
            <PaperButton
              variant="ghost"
              className="w-full"
              onClick={() => navigate("/")}
            >
              ← Back home
            </PaperButton>
          </div>
        </div>
      </section>
    </main>
  );
}
