import { useState, useRef, useMemo, useCallback } from "react";
import useGameStore from "../store/gameStore";
import { strokeToSvgPath } from "../lib/freehand";
import type { Stroke } from "@repo/types/socket";
import { DrawablyButton } from "drawably/react";

const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 800;

const PALETTE = [
  "#000000", // Black
  "#ffffff", // White
  "#6b7280", // Gray
  "#ef4444", // Red
  "#f97316", // Orange
  "#eab308", // Yellow
  "#22c55e", // Green
  "#06b6d4", // Cyan
  "#3b82f6", // Blue
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#78350f", // Brown
];

const BRUSH_SIZES = [
  { label: "S", size: 4 },
  { label: "M", size: 8 },
  { label: "L", size: 16 },
  { label: "XL", size: 28 },
];

export default function Canvas() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#000000");
  const [lineWidth, setLineWidth] = useState(8);
  const [tool, setTool] = useState<"pen" | "eraser">("pen");
  const currentPoints = useRef<{ x: number; y: number }[]>([]);
  const [activePoints, setActivePoints] = useState<{ x: number; y: number }[]>([]);

  const {
    strokes,
    isDrawer,
    actions: { drawStroke, clearCanvas, undoStroke },
  } = useGameStore();

  const getSvgCoordinates = useCallback(
    (e: React.PointerEvent<SVGSVGElement>): { x: number; y: number } | null => {
      const svg = svgRef.current;
      if (!svg) return null;
      const rect = svg.getBoundingClientRect();
      const scaleX = CANVAS_WIDTH / rect.width;
      const scaleY = CANVAS_HEIGHT / rect.height;
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    },
    []
  );

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDrawer) return;
    if (e.button !== 0) return; // Only main button

    const point = getSvgCoordinates(e);
    if (!point) return;

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignored if capture unsupported
    }

    currentPoints.current = [point];
    setActivePoints([point]);
    setIsDrawing(true);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDrawing || !isDrawer) return;

    const point = getSvgCoordinates(e);
    if (!point) return;

    currentPoints.current.push(point);
    setActivePoints([...currentPoints.current]);
  };

  const handlePointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDrawing || !isDrawer) return;
    setIsDrawing(false);

    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // Ignored
    }

    if (currentPoints.current.length > 0) {
      const newStroke: Stroke = {
        color: tool === "eraser" ? "#ffffff" : color,
        width: lineWidth,
        tool,
        points: currentPoints.current,
      };
      drawStroke(newStroke);
    }

    currentPoints.current = [];
    setActivePoints([]);
  };

  // Pre-render existing strokes as SVG paths
  const renderedStrokes = useMemo(() => {
    return strokes.map((stroke, index) => {
      const pathData = strokeToSvgPath(stroke.points, { size: stroke.width });
      return (
        <path
          key={`stroke-${index}`}
          d={pathData}
          fill={stroke.tool === "eraser" ? "#ffffff" : stroke.color}
        />
      );
    });
  }, [strokes]);

  // Current active stroke path preview
  const activePathData = useMemo(() => {
    if (!isDrawing || activePoints.length === 0) return "";
    return strokeToSvgPath(activePoints, { size: lineWidth });
  }, [isDrawing, activePoints, lineWidth]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-slate-200/80 select-none p-2 sm:p-4 overflow-hidden">
      {/* Canvas Box */}
      <div className="relative w-full h-full max-w-full max-h-full flex items-center justify-center">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
          className={`w-full h-full max-h-[85vh] bg-white rounded-2xl shadow-xl border-4 border-slate-700/80 touch-none ${
            isDrawer ? "cursor-crosshair" : "cursor-default"
          }`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          style={{
            aspectRatio: `${CANVAS_WIDTH} / ${CANVAS_HEIGHT}`,
            maxWidth: "100%",
            objectFit: "contain",
          }}
        >
          {/* Background */}
          <rect width={CANVAS_WIDTH} height={CANVAS_HEIGHT} fill="#ffffff" rx={16} />

          {/* Rendered Strokes */}
          {renderedStrokes}

          {/* Active drawing stroke */}
          {isDrawing && activePathData && (
            <path
              d={activePathData}
              fill={tool === "eraser" ? "#ffffff" : color}
            />
          )}
        </svg>
      </div>

      {/* Floating Drawer Toolbar with Drawably Controls */}
      {isDrawer && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/95 backdrop-blur-md text-white px-4 py-2.5 rounded-2xl shadow-2xl border-2 border-slate-700 flex flex-wrap items-center justify-center gap-3 z-30 max-w-[95vw]">
          {/* Tool Modes */}
          <div className="flex items-center gap-1.5 border-r border-slate-700 pr-3">
            <DrawablyButton
              variant={tool === "pen" ? "solid" : "outline"}
              className="text-xs sm:text-sm px-3 py-1 font-semibold transition-all"
              onClick={() => setTool("pen")}
            >
              ✏️ Pen
            </DrawablyButton>
            <DrawablyButton
              variant={tool === "eraser" ? "solid" : "outline"}
              className="text-xs sm:text-sm px-3 py-1 font-semibold transition-all"
              onClick={() => setTool("eraser")}
            >
              🧹 Eraser
            </DrawablyButton>
          </div>

          {/* Color Palette */}
          {tool === "pen" && (
            <div className="flex items-center gap-1.5 border-r border-slate-700 pr-3">
              <div className="grid grid-flow-col grid-rows-2 gap-1.5">
                {PALETTE.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setColor(c);
                      setTool("pen");
                    }}
                    style={{ backgroundColor: c }}
                    className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 transition-transform ${
                      color === c && tool === "pen"
                        ? "scale-125 border-yellow-400 ring-2 ring-yellow-400/50 shadow-md"
                        : "border-slate-500 hover:scale-110"
                    }`}
                    aria-label={`Color ${c}`}
                  />
                ))}
              </div>
              <input
                type="color"
                value={color}
                onChange={(e) => {
                  setColor(e.target.value);
                  setTool("pen");
                }}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full cursor-pointer bg-transparent border-none ml-1"
                title="Custom Color"
              />
            </div>
          )}

          {/* Brush Sizes */}
          <div className="flex items-center gap-1.5 border-r border-slate-700 pr-3">
            {BRUSH_SIZES.map((b) => (
              <button
                key={b.label}
                type="button"
                onClick={() => setLineWidth(b.size)}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-bold text-xs transition-colors ${
                  lineWidth === b.size
                    ? "bg-sky-500 text-white shadow-inner"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <DrawablyButton
              variant="outline"
              className="text-xs sm:text-sm px-3 py-1 font-semibold"
              onClick={undoStroke}
            >
              ↩ Undo
            </DrawablyButton>

            <DrawablyButton
              variant="outline"
              tone="danger"
              className="text-xs sm:text-sm px-3 py-1 font-semibold text-rose-300"
              onClick={clearCanvas}
            >
              🗑 Clear
            </DrawablyButton>
          </div>
        </div>
      )}
    </div>
  );
}
