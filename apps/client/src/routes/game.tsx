import ChatBox from "@/components/chatBox";
import MainCanvas from "@/components/MainCanvas";
import Navbar from "@/components/Navbar";
import Players from "@/components/Players";
import { createFileRoute } from "@tanstack/react-router";
import { useRef } from "react";

export const Route = createFileRoute("/game")({
	component: RouteComponent,
});

function RouteComponent() {
	interface Player {
		id: string;
		name: string;
		score: number;
		isSelf: boolean;
	}

	interface ChatMessage {
		id: string;
		sender: string;
		message: string;
		isCorrectGuess?: boolean;
	}
	const players: Player[] = [
		{ id: "p-1", name: "Zelda", score: 345, isSelf: false },
		{ id: "p-2", name: "Link", score: 210, isSelf: true }, 
		{ id: "p-3", name: "Ganon", score: 450, isSelf: false }, 
		{ id: "p-4", name: "Impa", score: 155, isSelf: false },
	];

	const chatMessages: ChatMessage[] = [
		{ id: "c-1", sender: "Impa", message: "Is it a vehicle?" },
		{ id: "c-2", sender: "Zelda", message: "motorcycle?" },
		{ id: "c-3", sender: "Zelda", message: "motorbike", isCorrectGuess: true },
		{ id: "c-4", sender: "Link", message: "Good guess!" },
	];

	const doNothing = () => {};
	const canvasRef = useRef<HTMLCanvasElement>(null);

	return (
		<div className="flex flex-col h-screen w-screen bg-gray-900 text-white  overflow-hidden">
			<Navbar
				round={5}
				totalRounds={7}
				wordToGuess={"One Piece"}
				timeInSec={120}
			/>
			<div className="flex flex-grow overflow-hidden">
				<Players players={players} currentDrawerId={"001"} />
				<MainCanvas canvasRef={canvasRef} isDrawing={true} />
				<ChatBox
					chatMessages={chatMessages}
					guessInput={""}
					setGuessInput={doNothing}
					handleGuessSubmit={doNothing}
					isDrawing={false}
				/>
			</div>
		</div>
	);
}
