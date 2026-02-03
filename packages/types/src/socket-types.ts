export type User = {
	id: string;
	name: string;
	score: number;
};

export type Stroke = {
	color: string;
	width: number;
	points: { x: number; y: number }[];
	tool: "pen" | "eraser";
};

export enum GameState {
	LOBBY = "LOBBY",
	STARTING = "STARTING",
	CHOOSING = "CHOOSING",
	DRAWING = "DRAWING",
	ROUND_END = "ROUND_END",
	GAME_END = "GAME_END",
}

export interface ServerToClientEvents {
	"room-joined": (roomId: string, users: User[]) => void;
	"room-error": (msg: string) => void;
	"user-joined": (user: User) => void;
	"user-left": (userId: string) => void;
	"chat-msg": (msg: string) => void;
	"get-stroke": (stroke: Stroke) => void;
	"game-state-change": (state: GameState) => void;
	"timer-tick": (time: number) => void;
	"your-turn-to-choose": (words: string[]) => void;
	"word-selected": (word: string) => void;
	"correct-guess": (userId: string) => void;
    "round-sync": (round: number, totalRounds: number) => void;
}

export interface ClientToServerEvents {
	"create-room": (username: string, callback: (roomId: string) => void) => void;
	"join-room": (roomId: string, username: string) => void;
	"draw-stroke": (stroke: Stroke) => void;
	"start-game": () => void;
	"select-word": (word: string) => void;
	"send-chat": (msg: string) => void;
    "join-quick-game": (username: string) => void;
	"get-room-id" :()=>string;

}

export interface InterServerEvents {
	ping: () => void;
}

export interface SocketData {
	name: string;
	roomId: string;
}

