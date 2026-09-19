import { useState } from "react";
import { useNavigate } from "react-router";
import useGameStore from "../store/gameStore";
import { DrawablyButton, DrawablyCard, DrawablyInput, DrawablyUnderline } from "drawably/react";
import Doodles from "./test";

export function meta() { return [{ title: "Create Room - Skribbl Doodle" }, { name: "description", content: "Create a private drawing room" }]; }

export default function CreateRoom() {
  const [playerName, setPlayerName] = useState("");
  const [maxPlayers, setMaxPlayers] = useState(8);
  const navigate = useNavigate();
  const { actions } = useGameStore();
  return <main className="skribble-page relative min-h-screen overflow-hidden bg-paper px-4 py-10 text-ink"><Doodles />
    <section className="relative z-10 mx-auto flex min-h-[calc(100vh-5rem)] max-w-md flex-col items-center justify-center"><header className="mb-7 text-center skribble-enter"><p className="mb-2 text-xs font-black uppercase tracking-[.2em] text-lilac">Private doodle club</p><h1 className="text-4xl font-black leading-none sm:text-6xl"><DrawablyUnderline stroke="#302b3d">Create a room</DrawablyUnderline></h1><p className="mx-auto mt-4 max-w-sm font-bold leading-relaxed text-muted">Set the stage, share the code, and let the questionable masterpieces begin.</p></header>
      <DrawablyCard stroke="#302b3d" fill="#fffaf0" className="skribble-panel skribble-enter w-full bg-white/85 p-6 backdrop-blur-sm sm:p-7" style={{ animationDelay: "80ms" }}><div className="space-y-6"><label className="block space-y-2"><span className="px-1 text-xs font-black uppercase tracking-[.15em] text-lilac">Your host nickname</span><DrawablyInput type="text" stroke="#302b3d" fill="#f7f5ff" placeholder="What should we call you?" value={playerName} onChange={(e) => setPlayerName(e.target.value)} maxLength={18} className="drawably-input-focus w-full bg-[#f7f5ff] px-4 py-3 text-base font-bold text-ink placeholder:text-[#aaa4b2]" /></label>
        <div className="rounded-2xl bg-[#f1edff] p-4"><div className="mb-4 flex items-start justify-between gap-4"><div><p className="font-black text-ink">Drawing seats</p><p className="text-sm font-bold text-muted">Invite between 2 and 16 players.</p></div><span className="rounded-full bg-mint px-2 py-1 text-xs font-black text-ink">room size</span></div><div className="flex items-center justify-between rounded-xl bg-paper px-3 py-2"><DrawablyButton type="button" variant="outline" stroke="#302b3d" onClick={() => setMaxPlayers((n) => Math.max(2, n - 1))} className="h-9 w-9 bg-white text-lg font-black text-ink">−</DrawablyButton><span className="font-mono text-2xl font-black text-lilac">{maxPlayers}</span><DrawablyButton type="button" variant="outline" stroke="#302b3d" onClick={() => setMaxPlayers((n) => Math.min(16, n + 1))} className="h-9 w-9 bg-white text-lg font-black text-ink">+</DrawablyButton></div></div>
        <div className="space-y-3"><DrawablyButton variant="solid" stroke="#121212" fill="#d9557e" onClick={() => actions.createRoom(playerName.trim() || "Host", () => navigate("/game"))} className="w-full py-3.5 text-base font-black text-white shadow-[0_5px_0_#a8385c] transition-all hover:-translate-y-0.5 active:translate-y-1 active:shadow-none">Create & enter room</DrawablyButton><DrawablyButton variant="outline" stroke="#6256d9" onClick={() => navigate("/")} className="w-full bg-[#f1edff] py-3 font-black text-lilac">← Back to home</DrawablyButton></div></div></DrawablyCard>
    </section></main>;
}
