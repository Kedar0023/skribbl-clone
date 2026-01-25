import { useRef, useState } from "react";
import CanvasDraw from "react-canvas-draw";

const Canvas = () => {
	const canvasRef = useRef<CanvasDraw>(null);
	const [color, setColor] = useState("#000");
	const [isEraser, setIsEraser] = useState(false);

	const handleUndo = () => {
		canvasRef.current?.undo();
	};

	const handleClear = () => {
		canvasRef.current?.clear();
	};

	return (
		<main className="grow flex flex-col relative">
			<div className="w-full h-full flex justify-center pt-2.5 ">
				<CanvasDraw
					ref={canvasRef}
					brushRadius={3}
					brushColor={isEraser ? "#fff" : color}
					lazyRadius={0}
					canvasHeight={800}
					canvasWidth={1200}
					
				/>
			</div>
			<div className="p-2 flex gap-2 items-center bg-blue-900
			 absolute bottom-5 left-[50%] transform -translate-x-[50%] 
			 rounded-md shadow z-999">
				<input
					type="color"
					className="w-8 h-8 rounded-full border-none p-0 cursor-pointer appearance-none"
					value={color}
					onChange={(e) => {
						setColor(e.target.value);
						if (isEraser) setIsEraser(false);
					}}
				/>

				<button
					onClick={() => setIsEraser(!isEraser)}
					className="px-2 py-1 border rounded"
				>
					{isEraser ? "Draw" : "Eraser"}
				</button>

				<button onClick={handleUndo} className="px-2 py-1 border rounded">
					Undo
				</button>

				<button onClick={handleClear} className="px-2 py-1 border rounded">
					Clear
				</button>
			</div>
		</main>
	);
};

export default Canvas;
