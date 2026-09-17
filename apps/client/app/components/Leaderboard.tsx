import useGameStore from "../store/gameStore";
import { DrawablyButton, DrawablyCard } from "drawably/react";
import { useNavigate } from "react-router";

export default function Leaderboard() {
  const { users, currentUser, actions } = useGameStore();
  const navigate = useNavigate();

  const sortedUsers = [...users].sort((a, b) => b.score - a.score);

  const handlePlayAgain = () => {
    actions.leaveRoom();
    navigate("/");
  };

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-in fade-in">
      <DrawablyCard className="bg-slate-900 border-2 border-slate-700 p-6 sm:p-8 rounded-3xl shadow-2xl max-w-lg w-full text-center">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-amber-400 mb-2">
          🏆 Game Over!
        </h2>
        <p className="text-slate-400 text-sm sm:text-base mb-6">
          Final Scores & Standings
        </p>

        <ul className="space-y-3 mb-8 text-left max-h-64 overflow-y-auto custom-scrollbar pr-1">
          {sortedUsers.map((user, index) => {
            const isMe = user.id === currentUser?.id;
            let rankClass = "bg-slate-800 border-slate-700 text-slate-300";
            let rankIcon = `#${index + 1}`;

            if (index === 0) {
              rankClass = "bg-amber-500/20 border-amber-500/60 text-amber-300 font-bold";
              rankIcon = "👑 1st";
            } else if (index === 1) {
              rankClass = "bg-slate-400/20 border-slate-400/60 text-slate-200 font-semibold";
              rankIcon = "🥈 2nd";
            } else if (index === 2) {
              rankClass = "bg-orange-700/20 border-orange-600/60 text-orange-300 font-semibold";
              rankIcon = "🥉 3rd";
            }

            return (
              <li
                key={user.id}
                className={`flex items-center justify-between p-3 rounded-xl border ${rankClass} ${
                  isMe ? "ring-2 ring-sky-400" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold w-14">{rankIcon}</span>
                  <span className="font-semibold text-base">
                    {user.name} {isMe && <span className="text-xs text-sky-400 font-normal">(You)</span>}
                  </span>
                </div>
                <span className="font-mono font-bold text-lg text-amber-300">
                  {user.score} pts
                </span>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center justify-center gap-4">
          <DrawablyButton
            variant="solid"
            className="px-6 py-2.5 font-bold text-base"
            onClick={handlePlayAgain}
          >
            Play Again
          </DrawablyButton>
        </div>
      </DrawablyCard>
    </div>
  );
}
