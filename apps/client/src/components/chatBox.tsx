import React from "react";

interface ChatMessage {
	id: string;
	sender: string;
	message: string;
	isCorrectGuess?: boolean;
}

interface ChatboxProps {
	chatMessages: ChatMessage[];
	guessInput: string;
	setGuessInput: (val: string) => void;
	handleGuessSubmit: (e: React.FormEvent) => void;
	isDrawing: boolean;
}

const ChatBox = ({
	chatMessages,
	guessInput,
	setGuessInput,
	handleGuessSubmit,
	isDrawing,
}: ChatboxProps) => (
	<aside className="w-1/4 min-w-[220px] max-w-[350px] bg-gray-800 border-l border-gray-700 flex flex-col">
		<div className="flex-grow p-4 overflow-y-auto custom-scrollbar space-y-2">
			{chatMessages.map((msg) => (
				<div key={msg.id} className="text-base break-words">
					<span className="font-semibold text-gray-300">
						{msg.sender} &gt;&gt;
					</span>
					<span
						className={`ml-2 ${msg.isCorrectGuess ? "text-green-400" : "text-gray-200"}`}
					>
						{msg.message}
					</span>
				</div>
			))}
		</div>
		{/* //-------------------------------------------------------------------------------------------------- */}
		<form
			onSubmit={handleGuessSubmit}
			className="p-4 border-t border-gray-700 bg-gray-900"
		>
			<input
				type="text"
				value={guessInput}
				onChange={(e) => setGuessInput(e.target.value)}
				placeholder={
					isDrawing ? "You are drawing..." : "Type your guess here..."
				}
				disabled={isDrawing}
				className="w-full p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
			/>
		</form>
	</aside>
);

export default ChatBox;
