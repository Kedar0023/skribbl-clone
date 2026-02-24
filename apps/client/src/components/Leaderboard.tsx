import useGameStore from "@/store/gameStore";

const Leaderboard = () => {
  const { users, currentUser } = useGameStore();
  const sortedUsers = [...users].sort((a, b) => b.score - a.score);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-50 text-white">
      <h2 className="text-5xl font-bold mb-8 text-yellow-400">Game Over!</h2>

      <div className="bg-gray-800 rounded-xl p-8 shadow-2xl w-full max-w-lg">
        <h3 className="text-2xl font-bold mb-6 text-center border-b border-gray-700 pb-4">
          Leaderboard
        </h3>

        <ul className="space-y-4">
          {sortedUsers.map((user, index) => {
            let rowClass =
              "flex justify-between items-center p-3 rounded-lg text-lg";
            let rankIcon = null;

            if (index === 0) {
              rowClass +=
                " bg-yellow-500/20 text-yellow-300 font-bold border border-yellow-500/50";
              rankIcon = "👑";
            } else if (index === 1) {
              rowClass += " bg-gray-400/20 text-gray-300 font-semibold";
              rankIcon = "🥈";
            } else if (index === 2) {
              rowClass += " bg-orange-700/20 text-orange-400 font-semibold";
              rankIcon = "🥉";
            } else {
              rowClass += " bg-gray-700/50 text-gray-400";
              rankIcon = `#${index + 1}`;
            }

            const isMe = user.id === currentUser?.id;

            return (
              <li
                key={user.id}
                className={`${rowClass} ${isMe ? "ring-2 ring-blue-500" : ""}`}
              >
                <div className="flex items-center gap-4">
                  <span className="w-8 text-center">{rankIcon}</span>
                  <span>
                    {user.name}
                    {isMe && (
                      <span className="text-sm ml-2 text-blue-400">(You)</span>
                    )}
                  </span>
                </div>
                <span className="font-mono font-bold text-xl">
                  {user.score}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-8 flex gap-4">
        <button
          onClick={() => window.location.reload()} // Simple reload to join new game for now
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors shadow-lg"
        >
          Play Again
        </button>
      </div>
    </div>
  );
};

export default Leaderboard;
