import { create } from "zustand";
import{ type Stroke, type User, GameState as GameStateEnum } from "@repo/types/socket"
import socket from "../socket";

interface GameState {
	round: number;
	totalRounds: number;
	wordToGuess: string;
	timeInSec: number;
	gameState: GameStateEnum;
	//-------- stroke action
	strokes: Stroke[];
	setStrokes: (stroke: Stroke) => void;
	addStroke: (stroke: Stroke) => void;
	undoStroke: () => void;
	clearCanvas: () => void;
    //-------- Room & User State
    currentUser: User | null;
    roomId: string | null;
    users: User[];
    chatMessages: Array<{ id: string; sender: string; message: string; isCorrectGuess?: boolean }>;
    availableWords: string[];
    isDrawer: boolean;

    actions: {
        createRoom: (name: string, callback?: (roomId: string) => void) => void;
        joinRoom: (roomId: string, name: string) => void;
        setRoomId: (roomId: string) => void;
        startGame: () => void;
        selectWord: (word: string) => void;
        sendChat: (msg: string) => void;
    }
}

const useGameStore = create<GameState>()((set, get) => ({
	round: 1,
	totalRounds: 3,
	wordToGuess: "",
	timeInSec: 0,
	strokes: [],
    currentUser: null,
    roomId: null,
    users: [],
	gameState: GameStateEnum.LOBBY,
    chatMessages: [],
    availableWords: [],
    isDrawer: false,

	addStroke: (stroke) =>
		set((state) => ({ strokes: [...state.strokes, stroke] })),
	setStrokes: (stroke) => set({ strokes: [stroke] }),

	undoStroke: () => set((state) => ({ strokes: state.strokes.slice(0, -1) })),
	clearCanvas: () => set(() => ({ strokes: [] })),

    actions: {
        createRoom: (name, callback) => {
            socket.emit("create-room", name, (roomId) => {
                set({ roomId, currentUser: { id: socket.id || "", name, score: 0 } });
                if (callback) callback(roomId);
            });
        },
        joinRoom: (roomId, name) => {
            socket.emit("join-room", roomId, name);
        },
        setRoomId: (roomId) => set({ roomId }),
        startGame: () => {
            socket.emit("start-game");
        },
        selectWord: (word) => {
             socket.emit("select-word", word);
        },
        sendChat: (msg) => {
            socket.emit("send-chat", msg);
        }
    }
}));

// Setup Socket Listeners
socket.on("room-joined", (roomId, users) => {
    useGameStore.setState({ roomId, users });
    const currentSocketId = socket.id;
    if(currentSocketId) {
         const me = users.find(u => u.id === currentSocketId);
         if(me) useGameStore.setState({ currentUser: me });
    }
});

socket.on("user-joined", (user) => {
    useGameStore.setState((state) => ({ users: [...state.users, user] }));
});

socket.on("user-left", (userId) => {
    useGameStore.setState((state) => ({ users: state.users.filter(u => u.id !== userId) }));
});

socket.on("room-error", (msg) => {
    alert(msg);
});

socket.on("game-state-change", (gameState) => {
    useGameStore.setState({ gameState });
});

socket.on("timer-tick", (timeInSec) => {
    useGameStore.setState({ timeInSec });
});

socket.on("your-turn-to-choose", (words) => {
    useGameStore.setState({ availableWords: words, isDrawer: true });
});

socket.on("word-selected", (word) => {
    useGameStore.setState({ wordToGuess: word, availableWords: [], isDrawer: false });
});

socket.on("chat-msg", (msgStr) => {
    // msgStr format: "Name: message"
    const [sender, ...rest] = msgStr.split(":");
    const message = rest.join(":").trim();
    
    useGameStore.setState((state) => ({
        chatMessages: [
            ...state.chatMessages,
            { id: Math.random().toString(), sender: sender, message: message, isCorrectGuess: false }
        ]
    }));
});

socket.on("correct-guess", (userId) => {
    const users = useGameStore.getState().users;
    const user = users.find(u => u.id === userId);
    if(user) {
         useGameStore.setState((state) => ({
            chatMessages: [
                ...state.chatMessages,
                { id: Math.random().toString(), sender: "System", message: `${user.name} guessed the word!`, isCorrectGuess: true }
            ]
        }));
    }
});

export default useGameStore;
