import { Eraser, Paintbrush2Icon, Pen, Trash2, UndoIcon } from "lucide-react";
import React from "react";
import type { RefObject } from "react";

interface MainCanvasProps {
	canvasRef: RefObject<HTMLCanvasElement | null>;
	isDrawing: boolean;
}

const colors = [
	"#2E3440", // Dark Slate
	"#4C566A", // Slate Gray
	"#D8DEE9", // Light Gray
	"#88C0D0", // Soft Blue
	"#81A1C1", // Muted Blue
	"#EBCB8B", // Soft Yellow
	"#A3BE8C", // Muted Green
	"#B48EAD", // Soft Purple
];

const MainCanvas: React.FC<MainCanvasProps> = ({ canvasRef, isDrawing }) => (
	<main className="flex-grow flex flex-col bg-teal-100 relative">
		<canvas
			ref={canvasRef}
			className="flex-grow w-full h-full bg-teal-800"
		></canvas>
		{isDrawing && (
			<div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center space-x-2 bg-gray-800 p-2 rounded-xl shadow-lg border border-gray-600">
				<button className="p-2 text-xl hover:bg-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400">
					<Pen />
				</button>
				<button className="p-2 text-xl hover:bg-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400">
					<Eraser/>
				</button>
				<button className="p-2 text-xl hover:bg-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400">
					<UndoIcon/>
				</button>
				<button className="p-2 text-xl hover:bg-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400">
					<Trash2/>
				</button>
				<button className="p-2 text-xl hover:bg-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400">
					<Paintbrush2Icon/>
				</button>
				<div className="w-px h-6 bg-gray-500 mx-2"></div>
				{colors.map((color) => (
					<button
						key={color}
						className="w-8 h-8 rounded-full border-2 border-gray-400 hover:scale-110 transition-transform duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400"
						style={{ backgroundColor: color }}
					/>
				))}
			</div>
		)}
	</main>
);

export default MainCanvas;
