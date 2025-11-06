import { create } from "zustand";
import type{ Stroke } from "@repo/types/socket"

interface GameState {
	round: number;
	totalRounds: number;
	wordToGuess: string;
	timeInSec: number;
	//-------- stroke action
	strokes: Stroke[];
	setStrokes: (stroke: Stroke) => void;
	addStroke: (stroke: Stroke) => void;
	undoStroke: () => void;
	clearCanvas: () => void;
}

const useGameStore = create<GameState>()((set) => ({
	round: 3,
	totalRounds: 7,
	wordToGuess: "pineapple",
	timeInSec: 120,
	strokes: [],
	addStroke: (stroke) =>
		set((state) => ({ strokes: [...state.strokes, stroke] })),
	setStrokes: (stroke) => set({ strokes: [stroke] }),

	undoStroke: () => set((state) => ({ strokes: state.strokes.slice(0, -1) })),
	clearCanvas: () => set(() => ({ strokes: [] })),
}));

export default useGameStore;
