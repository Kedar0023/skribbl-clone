
interface Player {
	id: string;
	name: string;
	score: number;
	isSelf: boolean;
}

interface SidebarProps {
	players: Player[];
	currentDrawerId: string;
}

const Players = ({
	players,
	currentDrawerId,
}:SidebarProps) => {
	const getPlayerStatus = (player: Player) => {
		if (player.id === currentDrawerId) return "(Drawing)";
		if (player.isSelf) return "(You)";
		return "";
	};

	return (
		<aside className="w-1/5 min-w-[180px] max-w-[250px] bg-gray-800 border-r border-gray-700 flex flex-col p-4">
			<h3 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">
				Players
			</h3>
			<ul className="flex-grow space-y-2 overflow-y-auto custom-scrollbar">
				{players
					.sort((a, b) => b.score - a.score)
					.map((player) => (
						<li
							key={player.id}
							className="flex justify-between items-center text-lg"
						>
							<span className={player.isSelf ? "font-bold text-green-400" : ""}>
								{player.name}{" "}
								<span className="text-sm text-gray-400">
									{getPlayerStatus(player)}
								</span>
							</span>
							<span className="font-semibold text-gray-300">
								{player.score}
							</span>
						</li>
					))}
			</ul>
		</aside>
	);
};

export default Players;
