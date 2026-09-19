import useGameStore from "../store/gameStore";
import { DrawablyButton, DrawablyCard, DrawablyBadge } from "drawably/react";
import { useNavigate } from "react-router";

export default function Leaderboard() {
  const { users, currentUser, isHost, actions } = useGameStore();
  const navigate = useNavigate();

  const sortedUsers = [...users].sort((a, b) => b.score - a.score);

  const handleLeaveRoom = () => {
    actions.leaveRoom();
    navigate("/");
  };

  const handlePlayAgain = () => {
    actions.playAgain();
  };

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-primary/90 backdrop-blur-md p-4 animate-in fade-in select-none">
      <DrawablyCard className="bg-bg border-4 border-primary p-6 sm:p-8 rounded-3xl shadow-2xl max-w-lg w-full text-center text-primary">
        <div className="inline-block mb-2">
          <DrawablyBadge
            variant="outline"
            className="bg-accent text-primary font-black text-sm px-4 py-1"
          >
            🎉 GAME OVER!
          </DrawablyBadge>
        </div>

        <h2 className="text-3xl sm:text-4xl font-black text-primary mb-1">
          Final Standings
        </h2>
        <p className="text-primary/70 text-sm sm:text-base mb-6 font-semibold">
          Check out the ultimate doodle masters!
        </p>

        <ul className="space-y-3 mb-8 text-left max-h-64 overflow-y-auto custom-scrollbar pr-1">
          {sortedUsers.map((user, index) => {
            const isMe = user.id === currentUser?.id;
            let rankClass = "bg-surface border-primary/30 text-primary";
            let rankIcon = `#${index + 1}`;

            if (index === 0) {
              rankClass =
                "bg-accent/20 border-accent text-primary font-black ring-2 ring-accent/40";
              rankIcon = "👑 1st";
            } else if (index === 1) {
              rankClass =
                "bg-secondary/20 border-secondary text-primary font-bold";
              rankIcon = "🥈 2nd";
            } else if (index === 2) {
              rankClass =
                "bg-bg border-primary/40 text-primary font-bold";
              rankIcon = "🥉 3rd";
            }

            return (
              <li
                key={user.id}
                className={`flex items-center justify-between p-3 rounded-2xl border-2 ${rankClass} ${
                  isMe ? "ring-2 ring-primary" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-black w-14">{rankIcon}</span>
                  <span className="font-bold text-base">
                    {user.name}{" "}
                    {isMe && (
                      <span className="text-xs text-accent font-black">
                        (You)
                      </span>
                    )}
                  </span>
                </div>
                <span className="font-mono font-black text-lg text-primary">
                  {user.score} pts
                </span>
              </li>
            );
          })}
        </ul>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {isHost ? (
            <DrawablyButton
              variant="solid"
              className="px-6 py-2.5 font-black text-base bg-accent text-primary border-2 border-primary hover:brightness-105"
              onClick={handlePlayAgain}
            >
              🔄 Play Again (Host)
            </DrawablyButton>
          ) : (
            <div className="text-xs font-bold text-primary/80 italic">
              Waiting for host to restart or choose to exit...
            </div>
          )}

          <DrawablyButton
            variant="outline"
            className="px-6 py-2.5 font-bold text-base bg-secondary text-primary border-2 border-primary hover:brightness-105"
            onClick={handleLeaveRoom}
          >
            🚪 Leave Room
          </DrawablyButton>
        </div>
      </DrawablyCard>
    </div>
  );
}

