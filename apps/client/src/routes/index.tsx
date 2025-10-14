import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {  useState } from "react";
export const Route = createFileRoute("/")({
	component: App,
});

function App() {
	const [playerName, setPlayerName] = useState<string>("");
	const navigate = useNavigate();

	const handlePlayClick = () => {
		if (playerName.trim()) {
			navigate({ to: "/game" });
		} else {
			alert("Please enter a name!");
		}
	};

	const handleCreateRoomClick = () => {
		alert("Creating a new room...");
	};

	return (
		<div className="flex flex-col items-center justify-center h-screen w-screen bg-teal-800 text-white p-4">
			<h1
				className="text-6xl md:text-8xl font-extrabold text-white mb-12 schoolbell"
				style={{
					textShadow: "4px 4px 0px rgba(0,0,0,0.2)",
				}}
			>
				Skibble.io
			</h1>

			{/* Main Content Box */}
			<div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl shadow-lg w-full max-w-md flex flex-col items-center space-y-6">
				{/* Name Input and Play Button */}
				<div className="flex items-stretch w-full">
					<input
						type="text"
						placeholder="Enter your name"
						value={playerName}
						onChange={(e) => setPlayerName(e.target.value)}
						className="flex-grow p-3 rounded-l-md text-lg text-gray-800 bg-gray-100 border-2 border-transparent focus:outline-none focus:ring-4 focus:ring-green-400 focus:border-green-500 transition-all"
					/>
					<button
						onClick={handlePlayClick}
						className="bg-green-400 text-white font-bold text-lg px-6 rounded-r-md hover:bg-green-600 focus:outline-none focus:ring-4 focus:ring-green-400 transition-colors duration-300"
					>
						Play
					</button>
				</div>

				{/* 'Or' Divider */}
				<div className="flex items-center w-full">
					<div className="flex-grow h-px bg-white/20"></div>
					<span className="px-4 text-sm font-light text-white/50">OR</span>
					<div className="flex-grow h-px bg-white/20"></div>
				</div>

				{/* Create Room Button */}
				<button
					onClick={handleCreateRoomClick}
					className="w-full bg-gray-200 text-gray-800 font-bold py-3 px-6 rounded-md text-lg hover:bg-gray-300 focus:outline-none focus:ring-4 focus:ring-gray-400 transition-colors duration-300"
				>
					Create a Private Room
				</button>
			</div>

			{/* Footer text */}
			<footer className="absolute bottom-4 text-center text-sm text-white">
				<p>Made with ❤️ by Deapool69</p>
			</footer>
		</div>
	);
}
