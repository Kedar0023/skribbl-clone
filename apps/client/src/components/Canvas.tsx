import { useEffect, useRef, useState } from "react";
import useGameStore from "../store/gameStore";
import type { Stroke } from "@repo/types/socket";

const Canvas = () => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [isDrawing, setIsDrawing] = useState(false);
	const [color, setColor] = useState("#000000");
	const [lineWidth, setLineWidth] = useState(3);
    const [isEraser, setIsEraser] = useState(false);

    // Track current stroke points
    const currentPoints = useRef<{x: number, y: number}[]>([]);
    
    // Track rendered strokes to avoid redraw
    const renderedStrokeCount = useRef(0);
    
    const { strokes, actions: { drawStroke }, clearCanvas, undoStroke } = useGameStore();

    // Helper to get coordinates
    const getCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    };

    // Draw a single stroke on the canvas
    const drawLine = (ctx: CanvasRenderingContext2D, stroke: Stroke) => {
        if (stroke.points.length < 2) return;
        
        ctx.beginPath();
        ctx.lineWidth = stroke.width;
        ctx.strokeStyle = stroke.tool === "eraser" ? "#ffffff" : stroke.color;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        
        ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        
        for (let i = 1; i < stroke.points.length; i++) {
            ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
        }
        
        ctx.stroke();
    };

	const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
		const { x, y } = getCoords(e);
        currentPoints.current = [{ x, y }];
		setIsDrawing(true);
        
        const ctx = canvasRef.current?.getContext("2d");
        if(ctx) {
            ctx.beginPath();
            ctx.moveTo(x, y);
        }
	};

	const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
		if (!isDrawing) return;
        
        const { x, y } = getCoords(e);
        currentPoints.current.push({ x, y });
        
        const ctx = canvasRef.current?.getContext("2d");
        if(ctx) {
            ctx.lineWidth = lineWidth;
            ctx.strokeStyle = isEraser ? "#ffffff" : color;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            
            ctx.lineTo(x, y);
            ctx.stroke();
        }
	};

	const endDrawing = () => {
		if (!isDrawing) return;
		setIsDrawing(false);
        
        const newStroke: Stroke = {
            color: color,
            width: lineWidth,
            tool: isEraser ? "eraser" : "pen",
            points: currentPoints.current
        };
        
        // Optimistically add to store/server
        drawStroke(newStroke);
        currentPoints.current = [];
	};
    
    // Sync Effect: Draw remote strokes
    useEffect(() => {
        const ctx = canvasRef.current?.getContext("2d");
        if(!ctx) return;
        
        // If strokes array shrunk (undo/clear), full redraw
        if (strokes.length < renderedStrokeCount.current) {
            ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
            renderedStrokeCount.current = 0;
        }
        
        // Draw new strokes
        for (let i = renderedStrokeCount.current; i < strokes.length; i++) {
            drawLine(ctx, strokes[i]);
        }
        
        renderedStrokeCount.current = strokes.length;
        
    }, [strokes]);

	const handleClear = () => {
        const ctx = canvasRef.current?.getContext("2d");
        if(ctx) {
            ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
        }
        clearCanvas(); // Updates store
	};

	return (
		<main className="flex flex-col relative items-center justify-center bg-gray-300 h-full">
        {console.log(isDrawing)}
            <div className="relative rounded-lg overflow-hidden cursor-pointer ">
                <canvas
                    style={{backgroundColor: "#ffffff"}}
                    ref={canvasRef}
                    width={1200}
                    height={800}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={endDrawing}
                    onMouseLeave={endDrawing}
                    className="touch-none"
                    
                />
            </div>
            
			<div className="py-2 flex gap-4 items-center bg-gray-800 text-white
			 absolute bottom-4 left-1/2 transform -translate-x-1/2 
			 rounded-md shadow-lg z-10 px-4">
				<input
					type="color"
					className="w-8 h-8 rounded-full border-none p-0 cursor-pointer"
					value={color}
					onChange={(e) => {
						setColor(e.target.value);
						setIsEraser(false);
					}}
				/>
                
                <input 
                    type="range" 
                    min="1" 
                    max="20" 
                    value={lineWidth} 
                    onChange={(e) => setLineWidth(parseInt(e.target.value))}
                    className="w-24 accent-sky-600"
                />

				<button
					onClick={() => setIsEraser(!isEraser)}
					className={`px-3 py-1 rounded-md transition-colors ${
                        isEraser ? "bg-blue-500" : "hover:bg-gray-700"
                    }`}
				>
					{isEraser ? "Eraser" : "Draw"}
				</button>

				<button onClick={undoStroke} className="px-3 py-1 hover:bg-gray-700 rounded-md">
					Undo
				</button>

				<button onClick={handleClear} className="px-3 py-1 hover:red-700 text-red-400 rounded-md">
					Clear
				</button>
			</div>
		</main>
	);
};

export default Canvas;
