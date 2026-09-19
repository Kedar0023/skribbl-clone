import type { User } from "@repo/types/socket";
import useGameStore from "../store/gameStore";
import { DrawablyBadge, DrawablyCard } from "drawably/react";

interface PlayersProps {
  players: User[];
  currentDrawerId: string | null;
}

export default function Players({ players, currentDrawerId }: PlayersProps) {
  const { currentUser, hostId } = useGameStore();

  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <aside className="w-48 sm:w-60 bg-paper border-r border-line flex flex-col p-3 sm:p-4 select-none flex-shrink-0 text-ink">
      <div className="flex items-center justify-between pb-3 mb-3 border-b-2 border-lilac/15">
        <h3 className="text-base sm:text-lg font-black text-ink flex items-center gap-1.5">
          Players ({" " + players.length + " "})
        </h3>
      </div>

      <ul className="flex-1 space-y-2 overflow-y-auto custom-scrollbar pr-1">

        {sortedPlayers.map((player, index) => {
          const isMe = player.id === currentUser?.id;
          const isDrawer = player.id === currentDrawerId;
          const isHost = player.id === hostId;

          let rankBadge = `${index + 1}`;
          if (index === 0) rankBadge = "🥇";
          else if (index === 1) rankBadge = "🥈";
          else if (index === 2) rankBadge = "🥉";

          return (
            <li key={player.id} className="skribble-enter">
              <DrawablyCard
                stroke={isMe ? "#d9557e" : "#302b3d"}
                fill={isMe ? "#fff7fb" : "#ffffff"}
                className={`flex items-center justify-between p-2.5 text-ink transition-transform hover:-translate-y-px`}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                <span className="text-sm font-black w-5 text-center flex-shrink-0">
                  {rankBadge}
                </span>

                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-sm truncate flex items-center gap-1">
                    {player.name}
                    {isMe && (
                      <span className="text-[11px] text-lilac font-extrabold bg-[#f1edff] px-1.5 py-0.2 rounded-full">
                        You
                      </span>
                    )}
                  </span>
                  <div className="flex items-center gap-1 flex-wrap">
                    {isHost && (
                      <span className="text-[10px] text-lilac font-bold">
                        👑 Host
                      </span>
                    )}
                    {isDrawer && (
                      <span className="text-[10px] text-rose font-black animate-pulse">
                        ✏️ Drawing
                      </span>
                    )}
                  </div>
                </div>
                </div>


                  {player.score} pts
              </DrawablyCard>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
