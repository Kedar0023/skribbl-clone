import type { User } from "@repo/types/socket";
import useGameStore from "../store/gameStore";
import { DrawablyBadge } from "drawably/react";

interface PlayersProps {
  players: User[];
  currentDrawerId: string | null;
}

export default function Players({ players, currentDrawerId }: PlayersProps) {
  const currentUser = useGameStore((state) => state.currentUser);

  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <aside className="w-48 sm:w-60 bg-slate-900 border-r-2 border-slate-700 flex flex-col p-3 sm:p-4 select-none flex-shrink-0">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-700">
        <h3 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-1.5">
          👥 Players ({players.length})
        </h3>
      </div>

      <ul className="flex-1 space-y-2 overflow-y-auto custom-scrollbar pr-1">
        {sortedPlayers.map((player, index) => {
          const isMe = player.id === currentUser?.id;
          const isDrawer = player.id === currentDrawerId;

          let rankBadge = `${index + 1}`;
          if (index === 0) rankBadge = "👑";
          else if (index === 1) rankBadge = "🥈";
          else if (index === 2) rankBadge = "🥉";

          return (
            <li
              key={player.id}
              className={`flex items-center justify-between p-2 rounded-xl transition-all ${
                isMe
                  ? "bg-sky-950/60 border border-sky-500/60 text-sky-200 shadow-sm"
                  : "bg-slate-800/60 border border-slate-700/60 text-slate-300"
              }`}
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="text-sm font-bold w-5 text-center flex-shrink-0">
                  {rankBadge}
                </span>

                <div className="flex flex-col min-w-0">
                  <span className="font-semibold text-sm truncate flex items-center gap-1">
                    {player.name}
                    {isMe && <span className="text-xs text-sky-400 font-normal">(You)</span>}
                  </span>
                  {isDrawer && (
                    <span className="text-[11px] text-amber-400 flex items-center gap-1 font-medium">
                      ✏️ Drawing
                    </span>
                  )}
                </div>
              </div>

              <DrawablyBadge
                variant="outline"
                className="text-xs font-mono font-bold px-2 py-0.5 ml-2 text-amber-300 flex-shrink-0"
              >
                {player.score} pts
              </DrawablyBadge>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
