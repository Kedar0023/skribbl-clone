import { useState, useRef, useMemo, useCallback } from "react";
import useGameStore from "../store/gameStore";
import { strokeToSvgPath } from "../lib/freehand";
import type { Stroke } from "@repo/types/socket";
import { PaperButton } from "./Button";

const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 800;

// Incorporate the theme palette + classic essentials
const PALETTE = [
  "#000000", // Black
  "#ffffff", // White
  "#6256d9", // Doodle violet
  "#67c9b1", // Mint
  "#d9557e", // Rose
  "#f6c945", // Sun
  "#ef4444", // Red
  "#f97316", // Orange
  "#eab308", // Yellow
  "#22c55e", // Green
  "#8b5cf6", // Purple
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
  const [color, setColor] = useState("#6256d9");
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
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-paper-grey50 p-2 select-none sm:p-4">
      {/* Canvas Box */}
      <div className="relative w-full h-full max-w-full max-h-full flex items-center justify-center">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
          className={`h-full w-full max-h-[85vh] rounded-paper-lg border-2 border-paper-black bg-white shadow-paper touch-none ${
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
          <rect width={CANVAS_WIDTH} height={CANVAS_HEIGHT} fill="#ffffff" rx={24} />

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

      {/* Floating paper toolbar for the active drawer */}
      {isDrawer && (
        <div className="absolute bottom-4 left-1/2 z-30 flex max-w-[95vw] -translate-x-1/2 flex-wrap items-center justify-center gap-3 rounded-paper border-2 border-paper-black bg-white px-4 py-2.5 shadow-paper paper-enter">
          {/* Tool Modes */}
          <div className="flex items-center gap-1.5 border-r-2 border-paper-black pr-3">
            <PaperButton variant={tool === "pen" ? "secondary" : "ghost"} className="px-3 py-1 text-base"
              onClick={() => setTool("pen")}
            >
              ✏️ Pen
            </PaperButton>
            <PaperButton variant={tool === "eraser" ? "secondary" : "ghost"} className="px-3 py-1 text-base"
              onClick={() => setTool("eraser")}
            >
              🧹 Eraser
            </PaperButton>
          </div>

          {/* Color Palette */}
          {tool === "pen" && (
            <div className="flex items-center gap-1.5 border-r-2 border-paper-black pr-3">
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
                    className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 transition-transform cursor-pointer ${
                      color === c && tool === "pen"
                        ? "scale-125 border-paper-black ring-2 ring-paper-pink shadow-paper-sm"
                        : "border-paper-black hover:scale-110"
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
          <div className="flex items-center gap-1.5 border-r-2 border-paper-black pr-3">
            {BRUSH_SIZES.map((b) => (
              <button
                key={b.label}
                type="button"
                onClick={() => setLineWidth(b.size)}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center font-black text-xs transition-colors cursor-pointer ${
                  lineWidth === b.size
                  ? "bg-paper-lilac text-paper-black shadow-paper-sm border-2 border-paper-black"
                    : "bg-paper-grey50 text-paper-black border-2 border-paper-black hover:bg-paper-blue"
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <PaperButton variant="blue" className="px-3 py-1 text-base"
              onClick={undoStroke}
            >
              ↩ Undo
            </PaperButton>

            <PaperButton className="px-3 py-1 text-base"
              onClick={clearCanvas}
            >
              🗑 Clear
            </PaperButton>
          </div>
        </div>
      )}
    </div>
  );
}
