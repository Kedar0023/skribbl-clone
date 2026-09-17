import { create } from "zustand";
import {
  type Stroke,
  type User,
  GameState as GameStateEnum,
} from "@repo/types/socket";
import socket from "../lib/socket";

export interface ChatItem {
  id: string;
  sender: string;
  message: string;
  isCorrectGuess?: boolean;
  isSystem?: boolean;
}

interface GameStoreState {
  // Game & Round status
  round: number;
  totalRounds: number;
  wordToGuess: string;
  wordHint: string;
  timeInSec: number;
  gameState: GameStateEnum;
  currentDrawerId: string | null;

  // Strokes & Drawing
  strokes: Stroke[];
  activeStroke: Stroke | null;

  // Room & User State
  currentUser: User | null;
  roomId: string | null;
  users: User[];
  chatMessages: ChatItem[];
  availableWords: string[];
  isDrawer: boolean;

  // Actions
  addStroke: (stroke: Stroke) => void;
  setActiveStroke: (stroke: Stroke | null) => void;
  setStrokes: (strokes: Stroke[]) => void;
  undoStroke: () => void;
  clearCanvas: () => void;

  actions: {
    createRoom: (name: string, callback?: (roomId: string) => void) => void;
    joinRoom: (roomId: string, name: string) => void;
    joinQuickGame: (name: string) => void;
    setRoomId: (roomId: string) => void;
    startGame: () => void;
    selectWord: (word: string) => void;
    sendChat: (msg: string) => void;
    drawStroke: (stroke: Stroke) => void;
    undoStroke: () => void;
    clearCanvas: () => void;
    leaveRoom: () => void;
  };
}

const useGameStore = create<GameStoreState>()((set, get) => ({
  round: 1,
  totalRounds: 3,
  wordToGuess: "",
  wordHint: "",
  timeInSec: 0,
  strokes: [],
  activeStroke: null,
  currentUser: null,
  currentDrawerId: null,
  roomId: null,
  users: [],
  gameState: GameStateEnum.LOBBY,
  chatMessages: [],
  availableWords: [],
  isDrawer: false,

  addStroke: (stroke) =>
    set((state) => ({ strokes: [...state.strokes, stroke] })),

  setActiveStroke: (activeStroke) => set({ activeStroke }),

  setStrokes: (strokes) => set({ strokes }),

  undoStroke: () =>
    set((state) => ({ strokes: state.strokes.slice(0, -1) })),

  clearCanvas: () => set({ strokes: [], activeStroke: null }),

  actions: {
    createRoom: (name, callback) => {
      socket.emit("create-room", name, (roomId) => {
        set({
          roomId,
          currentUser: { id: socket.id || "", name, score: 0 },
        });
        if (callback) callback(roomId);
      });
    },

    joinRoom: (roomId, name) => {
      socket.emit("join-room", roomId, name);
    },

    joinQuickGame: (name: string) => {
      socket.emit("join-quick-game", name);
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
    },

    drawStroke: (stroke: Stroke) => {
      set((state) => ({ strokes: [...state.strokes, stroke] }));
      socket.emit("draw-stroke", stroke);
    },

    undoStroke: () => {
      set((state) => ({ strokes: state.strokes.slice(0, -1) }));
      socket.emit("undo-stroke");
    },

    clearCanvas: () => {
      set({ strokes: [], activeStroke: null });
      socket.emit("clear-canvas");
    },

    leaveRoom: () => {
      set({
        roomId: null,
        users: [],
        strokes: [],
        activeStroke: null,
        chatMessages: [],
        gameState: GameStateEnum.LOBBY,
        wordToGuess: "",
        wordHint: "",
        isDrawer: false,
        currentDrawerId: null,
      });
    },
  },
}));

// Setup Socket.IO Event Listeners
if (typeof window !== "undefined") {
  socket.on("room-joined", (roomId, users) => {
    const currentSocketId = socket.id;
    const me = users.find((u) => u.id === currentSocketId) || null;
    useGameStore.setState({
      roomId,
      users,
      currentUser: me,
    });
  });

  socket.on("user-joined", (user) => {
    useGameStore.setState((state) => {
      if (state.users.some((u) => u.id === user.id)) return state;
      return { users: [...state.users, user] };
    });
  });

  socket.on("user-left", (userId) => {
    useGameStore.setState((state) => ({
      users: state.users.filter((u) => u.id !== userId),
    }));
  });

  socket.on("score-update", (users) => {
    useGameStore.setState({ users });
  });

  socket.on("current-drawer", (drawerId) => {
    const isDrawer = socket.id === drawerId;
    useGameStore.setState({
      currentDrawerId: drawerId,
      isDrawer,
    });
  });

  socket.on("room-error", (msg) => {
    alert(msg);
  });

  socket.on("game-state-change", (gameState) => {
    useGameStore.setState({ gameState });
    if (
      gameState === GameStateEnum.CHOOSING ||
      gameState === GameStateEnum.ROUND_END ||
      gameState === GameStateEnum.GAME_END
    ) {
      if (gameState !== GameStateEnum.CHOOSING) {
        useGameStore.setState({ isDrawer: false });
      }
    }
  });

  socket.on("timer-tick", (timeInSec) => {
    useGameStore.setState({ timeInSec });
  });

  socket.on("your-turn-to-choose", (words) => {
    useGameStore.setState({ availableWords: words, isDrawer: true });
  });

  socket.on("word-selected", (word) => {
    useGameStore.setState({ wordToGuess: word, availableWords: [] });
  });

  socket.on("word-hint", (hint) => {
    useGameStore.setState({ wordHint: hint });
  });

  socket.on("get-stroke", (stroke) => {
    useGameStore.getState().addStroke(stroke);
  });

  socket.on("stroke-history", (strokes) => {
    useGameStore.setState({ strokes });
  });

  socket.on("undo-stroke", () => {
    useGameStore.getState().undoStroke();
  });

  socket.on("clear-canvas", () => {
    useGameStore.setState({ strokes: [], activeStroke: null });
  });

  socket.on("chat-msg", (msgStr) => {
    const colonIndex = msgStr.indexOf(":");
    let sender = "Player";
    let message = msgStr;
    if (colonIndex !== -1) {
      sender = msgStr.slice(0, colonIndex).trim();
      message = msgStr.slice(colonIndex + 1).trim();
    }

    useGameStore.setState((state) => ({
      chatMessages: [
        ...state.chatMessages,
        {
          id: Math.random().toString(36).slice(2, 9),
          sender,
          message,
          isCorrectGuess: false,
        },
      ],
    }));
  });

  socket.on("correct-guess", (userId) => {
    const users = useGameStore.getState().users;
    const user = users.find((u) => u.id === userId);
    if (user) {
      useGameStore.setState((state) => ({
        chatMessages: [
          ...state.chatMessages,
          {
            id: Math.random().toString(36).slice(2, 9),
            sender: "System",
            message: `🎉 ${user.name} guessed the word!`,
            isCorrectGuess: true,
            isSystem: true,
          },
        ],
      }));
    }
  });

  socket.on("round-sync", (round, totalRounds) => {
    useGameStore.setState({ round, totalRounds });
  });
}

export default useGameStore;
