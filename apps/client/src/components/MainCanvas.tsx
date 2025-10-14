import { Eraser, Paintbrush2Icon, Pen, Trash2, UndoIcon } from "lucide-react";
import React, {  useState, useEffect } from "react";
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

type Tool = "pen" | "eraser";

interface Stroke {
	color: string;
	width: number;
	points: { x: number; y: number }[];
	tool: Tool;
}

const DEFAULT_COLOR = colors[0];
const DEFAULT_WIDTH = 4;

const MainCanvas: React.FC<MainCanvasProps> = ({ canvasRef, isDrawing }) => {
	const [canvasColor, setcanvasColor] = useState<string>("#285e61");
	const [tool, setTool] = useState<Tool>("pen");
	const [color, setColor] = useState<string>(DEFAULT_COLOR);
	const [strokes, setStrokes] = useState<Stroke[]>([]);
	const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);

	// Drawing handlers
	const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
		if (!isDrawing) return;
		const rect = e.currentTarget.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;
		setCurrentStroke({
			color: tool === "pen" ? color : canvasColor,
			width: tool === "pen" ? DEFAULT_WIDTH : 16,
			points: [{ x, y }],
			tool,
		});
	};

	const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
		if (!isDrawing || !currentStroke) return;
		const rect = e.currentTarget.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;
		setCurrentStroke((prev) =>
			prev ? { ...prev, points: [...prev.points, { x, y }] } : prev
		);
	};

	const handlePointerUp = () => {
		if (!isDrawing || !currentStroke) return;
		setStrokes((prev) => [...prev, currentStroke]);
		setCurrentStroke(null);
	};

	// Redraw all strokes
	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		const drawStroke = (stroke: Stroke) => {
			ctx.strokeStyle = stroke.color;
			ctx.lineWidth = stroke.width;
			ctx.lineCap = "round";
			ctx.lineJoin = "round";
			ctx.beginPath();
			stroke.points.forEach((pt, i) => {
				if (i === 0) ctx.moveTo(pt.x, pt.y);
				else ctx.lineTo(pt.x, pt.y);
			});
			ctx.stroke();
		};
		strokes.forEach(drawStroke);
		if (currentStroke) drawStroke(currentStroke);
	}, [strokes, currentStroke, canvasRef]);

	// Resize canvas to fit parent
	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const resize = () => {
			const parent = canvas.parentElement;
			if (!parent) return;
			canvas.width = parent.clientWidth;
			canvas.height = parent.clientHeight;
		};
		resize();
		window.addEventListener("resize", resize);
		return () => window.removeEventListener("resize", resize);
	}, [canvasRef]);

	// Tool actions
	const handleUndo = () => {
		setStrokes((prev) => prev.slice(0, -1));
	};
	const handleClear = () => {
		setStrokes([]);
	};

	return (
		<main className="flex-grow flex flex-col relative">
			<canvas
				ref={canvasRef}
				className="flex-grow w-full h-full"
				onPointerDown={handlePointerDown}
				onPointerMove={handlePointerMove}
				onPointerUp={handlePointerUp}
				onPointerLeave={handlePointerUp}
				style={{
					backgroundColor: canvasColor,
					touchAction: "none",
					cursor: tool === "eraser" ? "crosshair" : "pointer",
				}}
			></canvas>
			{isDrawing && (
				<div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center space-x-2 bg-gray-800 p-2 rounded-xl shadow-lg border border-gray-600">
					<button
						className={`p-2 text-xl rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 ${tool === "pen" ? "bg-gray-600" : "hover:bg-gray-600"}`}
						onClick={() => setTool("pen")}
						title="Pen"
					>
						<Pen />
					</button>
					<button
						className={`p-2 text-xl rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 ${tool === "eraser" ? "bg-gray-600" : "hover:bg-gray-600"}`}
						onClick={() => setTool("eraser")}
						title="Eraser"
					>
						<Eraser />
					</button>
					<button
						className="p-2 text-xl hover:bg-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400"
						onClick={handleUndo}
						title="Undo"
					>
						<UndoIcon />
					</button>
					<button
						className="p-2 text-xl hover:bg-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400"
						onClick={handleClear}
						title="Clear"
					>
						<Trash2 />
					</button>

					<div className="w-px h-6 bg-gray-500 mx-2"></div>
					{colors.map((c) => (
						<button
							key={c}
							className={`w-8 h-8 rounded-full border-2 border-gray-400 hover:scale-110 transition-transform duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400 ${color === c ? "ring-2 ring-blue-400" : ""}`}
							style={{ backgroundColor: c }}
							onClick={() => {
								setColor(c);
								setTool("pen");
							}}
							title={`Color: ${c}`}
						/>
					))}
				</div>
			)}
		</main>
	);
};

export default MainCanvas;
