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
import Doodles from "./test";

export function meta() {
  return [
    { title: "Skribbl Clone - Hand-Drawn Multiplayer Drawing Game" },
    {
      name: "description",
      content:
        "Play Skribbl clone with hand-drawn Drawably UI and real-time multiplayer!",
    },
  ];
}

export default function Home() {
  const [playerName, setPlayerName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [showJoinInput, setShowJoinInput] = useState(false);
  const navigate = useNavigate();

  const { roomId, actions } = useGameStore();

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
    <main className="home-page min-h-screen w-full overflow-hidden bg-[#fffaf0] text-[#302b3d] relative">
      {/* Playful background */}

      <Doodles/>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-10">
        {/* Hero */}
        <header className="text-center mb-8 max-w-2xl">

          <div className="relative inline-block">
            <div className="absolute -right-5 -top-6 text-2xl rotate-12">
              ✨
            </div>

            <h1 className="text-6xl sm:text-8xl leading-[0.9] font-black tracking-[0.06em] text-[#1b1a1f] kablammo">
              <DrawablyUnderline>SkRibbl</DrawablyUnderline>
              <span className="inline-block -rotate-2">
                <DrawablyHighlight fill="#d9557e">Doodle</DrawablyHighlight>
              </span>
            </h1>


          </div>

          <p className="mt-6 mx-auto max-w-md text-sm sm:text-base font-bold leading-relaxed text-[#6c6678]">
            Grab a pencil, join your friends, and see who can turn terrible
            drawings into brilliant guesses.
          </p>
        </header>

        {/* Main card */}
        <DrawablyCard stroke="#302b3d" fill="#fffaf0"
        className="w-full max-w-lg bg-white/90 p-5 sm:p-7 shadow-[0_20px_60px_rgba(48,43,61,0.12)] backdrop-blur-md">
          {/* Nickname */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <label className="text-xs font-black uppercase tracking-[0.15em] text-[#6256d9]">
                Your nickname
              </label>

              <span className="text-xs font-bold text-[#aaa4b2]">
                {playerName.length}/18
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <DrawablyInput
                  type="text"
                  stroke="#302b3d"
                  fill="#f7f5ff"
                  placeholder="What should we call you?"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  maxLength={18}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handlePlayClick();
                    }
                  }}
                  className="drawably-input-focus w-full rounded-2xl bg-[#f7f5ff] px-4 py-3.5 text-base font-bold text-[#302b3d] placeholder:text-[#aaa4b2] shadow-inner"
                />
              </div>

                  <DrawablyButton
                    stroke="#121212"
                    fill="#6256d9"
                    onClick={handlePlayClick}
                    variant="solid"
                    className="rounded-2xl bg-[#6256d9] text-white! px-7 py-3.5 text-base font-black shadow-[0_5px_0_#443ba9] transition-all hover:-translate-y-0.5 hover:brightness-105 active:translate-y-1 active:shadow-none"
                  >
                    Let's Play!
                  </DrawablyButton>
            </div>
          </div>

          {/* Join code */}
          {showJoinInput && (
            <div className="mt-5 rounded-2xl bg-[#fff7d6] p-4 animate-in fade-in slide-in-from-top-2">
              <div className="mb-2 flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-[0.15em] text-[#8c6d00]">
                  Room code
                </label>

                <button
                  type="button"
                  onClick={() => setShowJoinInput(false)}
                  className="text-xs font-black text-[#8c6d00] hover:underline"
                >
                  Cancel
                </button>
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <DrawablyInput
                    type="text"
                    placeholder="e.g. room-1234"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        submitJoinCode();
                      }
                    }}
                    className="drawably-input-focus w-full rounded-xl bg-white px-4 py-3 font-mono font-bold text-[#302b3d] placeholder:text-[#aaa4b2]"
                  />
                </div>

                <DrawablyButton
                  onClick={submitJoinCode}
                  variant="solid"
                  className="rounded-xl bg-[#f6c945] px-5 py-3 font-black text-[#302b3d] shadow-[0_4px_0_#c79c18] hover:brightness-105 active:translate-y-1 active:shadow-none"
                >
                  Join
                </DrawablyButton>
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-[#e9e5ef]" />
            <span className="rounded-full bg-[#f4f1f8] px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[#aaa4b2]">
              or
            </span>
            <div className="h-px flex-1 bg-[#e9e5ef]" />
          </div>

          {/* Secondary actions */}
          <div className="space-y-3">
            <DrawablyButton
              stroke="#d9557e"
              fill = "#d9557e"
              onClick={handleCreateRoomClick}
              variant="solid"
              className="w-full py-3.5 text-base text-black  transition-all hover:-translate-y-0.5 hover:brightness-105 active:translate-y-1 active:shadow-none"
            >
              Create a Private Room
            </DrawablyButton>

            {!showJoinInput && (
              <DrawablyButton
                onClick={handleJoinViaCodeClick}
                variant="outline"
                className="w-full rounded-2xl bg-[#f1edff] py-3.5 text-base font-black text-[#6256d9] transition-all hover:-translate-y-0.5 hover:bg-[#e9e4ff]"
              >
                <span className="mr-2"></span>
                Join with Room Code
              </DrawablyButton>
            )}
          </div>
        </DrawablyCard>

        {/* Tiny feature row */}
        <div className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-bold text-[#8c8695]">
          <span> Multiplayer</span>
          <span>•</span>
          <span> Freehand drawing</span>
          <span>•</span>
          <span> Leaderboards</span>
        </div>

        <footer className="mt-6 text-center text-[11px] font-semibold text-[#aaa4b2]">
          Made with ❤️ by Kedar0023
        </footer>
      </div>
    </main>
  );
}
