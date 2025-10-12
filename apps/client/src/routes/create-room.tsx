import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react';

export const Route = createFileRoute('/create-room')({
  component: RouteComponent,
})
interface CreateRoomProps {
	onStartGame?: (maxPlayers: number) => void;
	onInvitePlayers?: (roomId: string) => void; // Assuming a roomId would be generated
}

function RouteComponent({ onStartGame, onInvitePlayers }:  CreateRoomProps ) {
	const [maxPlayers, setMaxPlayers] = useState<number>(3); // Initial value based on your image

	const handleDecreasePlayers = () => {
		setMaxPlayers((prev) => Math.max(2, prev - 1)); // Minimum 2 players for a game
	};

	const handleIncreasePlayers = () => {
		setMaxPlayers((prev) => Math.min(12, prev + 1)); // Common max for Skribbl.io, adjustable
	};

	const handleStartClick = () => {
		if (onStartGame) {
			onStartGame(maxPlayers);
		} else {
			alert(`Starting game with ${maxPlayers} players!`);
		}
	};

	const handleInviteClick = () => {
		// In a real app, this would generate a room ID and share it.
		const roomId = "YOUR_GENERATED_ROOM_ID"; // Placeholder
		if (onInvitePlayers) {
			onInvitePlayers(roomId);
		} else {
			alert(
				`Invite link for room ${roomId} copied! (Max Players: ${maxPlayers})`
			);
		}
	};

	return (
		<div className="flex flex-col items-center justify-center h-screen w-screen bg-teal-800 text-white p-4">
			{/* Game Title */}
			<h1
				className="text-6xl md:text-8xl font-extrabold text-white mb-2"
				style={{
					textShadow: "4px 4px 0px rgba(0,0,0,0.2)",
				}}
			>
				Skibble.io
			</h1>

			{/* Subtitle */}
			<h2
				className="text-3xl md:text-4xl font-semibold text-white mb-16"
				style={{
					textShadow: "2px 2px 0px rgba(0,0,0,0.1)",
				}}
			>
				Create a room
			</h2>

			{/* Player Count Control */}
			<div className="flex items-center space-x-4 mb-20 bg-white/10 backdrop-blur-sm p-6 rounded-xl shadow-lg">
				<span className="text-2xl font-semibold text-white">
					Max no of players :
				</span>
				<div className="flex items-center bg-gray-100 rounded-lg overflow-hidden shadow-inner">
					<button
						onClick={handleDecreasePlayers}
						className="p-3 text-2xl font-bold text-gray-800 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-4 focus:ring-gray-400 transition-colors duration-200"
					>
						-
					</button>
					<span className="min-w-[40px] text-center text-3xl font-bold text-gray-900 px-4 select-none">
						{maxPlayers}
					</span>
					<button
						onClick={handleIncreasePlayers}
						className="p-3 text-2xl font-bold text-gray-800 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-4 focus:ring-gray-400 transition-colors duration-200"
					>
						+
					</button>
				</div>
			</div>

			{/* Action Buttons */}
			<div className="flex space-x-8">
				<button
					onClick={handleStartClick}
					className="bg-green-500 text-white font-bold text-2xl py-4 px-12 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-6 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-teal-800 transition-all duration-300 shadow-lg transform hover:scale-105"
				>
					Start
				</button>
				<button
					onClick={handleInviteClick}
					className="bg-pink-500 text-white font-bold text-2xl py-4 px-12 rounded-lg hover:bg-pink-600 focus:outline-none focus:ring-6 focus:ring-pink-400 focus:ring-offset-2 focus:ring-offset-teal-800 transition-all duration-300 shadow-lg transform hover:scale-105"
				>
					Invite
				</button>
			</div>

			{/* Footer text */}
			<footer className="absolute bottom-4 text-center text-sm text-white/40">
				<p>
					A Skribbl.io clone project built with React, TS, and Tailwind CSS.
				</p>
			</footer>
		</div>
	);
}
