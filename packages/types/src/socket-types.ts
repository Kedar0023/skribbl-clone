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

/** Structured chat message — replaces the old "Name: message" string format. */
export type ChatMessage = {
  sender: string;
  message: string;
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
  /** For the drawer: receives the full word. For guessers: receives only the word length. */
  "word-selected": (word: string) => void;
  "correct-guess": (userId: string) => void;
  "round-sync": (round: number, totalRounds: number) => void;
  "clear-canvas": () => void;
  /** Dedicated score update event — replaces the abused "room-joined" for score broadcasts. */
  "score-update": (users: User[]) => void;
  /** Broadcast when the drawer undoes a stroke. */
  "undo-stroke": () => void;
  /** Server-driven word hint — progressively revealed letters. */
  "word-hint": (hint: string) => void;
  /** Sent to a player who joins mid-game so they can see existing canvas state. */
  "stroke-history": (strokes: Stroke[]) => void;
  /** Notifies clients who the current drawer is. */
  "current-drawer": (drawerId: string) => void;
}

export interface ClientToServerEvents {
  "create-room": (
    username: string,
    callback: (roomId: string) => void,
  ) => void;
  "join-room": (roomId: string, username: string) => void;
  "draw-stroke": (stroke: Stroke) => void;
  "start-game": () => void;
  "select-word": (word: string) => void;
  "send-chat": (msg: string) => void;
  "join-quick-game": (username: string) => void;
  "get-room-id": (callback: (roomId: string | null) => void) => void;
  "clear-canvas": () => void;
  "undo-stroke": () => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  name: string;
  roomId: string;
}
