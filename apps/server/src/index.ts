import express from "express";
import { createServer } from "http";
import { Server, type Socket } from "socket.io";
import type {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
  User,
} from "@repo/types/socket";
import { RoomManager } from "./RoomManager";

/** Typed socket shorthand for this server's generic configuration. */
type AppSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

// ─── Config ──────────────────────────────────────────────────────────────────

const PORT = parseInt(process.env.PORT ?? "5000", 10);
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? "http://localhost:3000";

/** Maximum length for usernames. */
const MAX_USERNAME_LENGTH = 20;
/** Minimum length for usernames. */
const MIN_USERNAME_LENGTH = 1;
/** Maximum length for chat messages. */
const MAX_CHAT_LENGTH = 200;
/** Maximum length for a room ID. */
const MAX_ROOM_ID_LENGTH = 16;

// ─── Server Setup ────────────────────────────────────────────────────────────

const app = express();
const server = createServer(app);

const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>(server, {
  cors: {
    origin: CORS_ORIGIN,
    methods: ["GET", "POST"],
  },
});

const roomManager = RoomManager.getInstance(io);

// ─── Validation Helpers ──────────────────────────────────────────────────────

function sanitizeUsername(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (
    trimmed.length < MIN_USERNAME_LENGTH ||
    trimmed.length > MAX_USERNAME_LENGTH
  ) {
    return null;
  }
  return trimmed;
}

function sanitizeChatMessage(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (trimmed.length === 0 || trimmed.length > MAX_CHAT_LENGTH) return null;
  return trimmed;
}

function sanitizeRoomId(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (trimmed.length === 0 || trimmed.length > MAX_ROOM_ID_LENGTH) return null;
  return trimmed;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Shared logic for adding a user to a room (used by create-room, join-room,
 * and join-quick-game).
 */
function joinRoomLogic(
  socket: AppSocket,
  room: ReturnType<typeof roomManager.getRoom> & {},
  username: string,
): void {
  const user: User = { id: socket.id, name: username, score: 0 };

  if (!room.addUser(user)) {
    socket.emit("room-error", "Room is full or game already started");
    return;
  }

  socket.data.roomId = room.id;
  socket.data.name = username;
  socket.join(room.id);

  // BUG-9 fix: the joining user (including the creator) gets room-joined
  socket.emit("room-joined", room.id, room.users);

  // Notify others
  socket.to(room.id).emit("user-joined", user);
}

// ─── Socket Handlers ─────────────────────────────────────────────────────────

io.on("connection", (socket) => {
  console.log(`[connect]   ${socket.id}`);

  // ── Room Creation ────────────────────────────────────────────────────────

  socket.on("create-room", (rawUsername, callback) => {
    const username = sanitizeUsername(rawUsername);
    if (!username) {
      socket.emit("room-error", "Invalid username");
      return;
    }

    const room = roomManager.createRoom();

    // BUG-9 fix: use the shared joinRoomLogic so the creator gets
    // "room-joined" with the full user list.
    joinRoomLogic(socket, room, username);

    // Still invoke the callback so the client gets the roomId synchronously.
    callback(room.id);
    console.log(`[create]    Room ${room.id} by "${username}"`);
  });

  // ── Joining ──────────────────────────────────────────────────────────────

  socket.on("join-room", (rawRoomId, rawUsername) => {
    const username = sanitizeUsername(rawUsername);
    const roomId = sanitizeRoomId(rawRoomId);
    if (!username || !roomId) {
      socket.emit("room-error", "Invalid username or room ID");
      return;
    }

    const room = roomManager.getRoom(roomId);
    if (!room) {
      socket.emit("room-error", "Room not found");
      return;
    }

    joinRoomLogic(socket, room, username);
    console.log(`[join]      "${username}" → Room ${roomId}`);
  });

  socket.on("join-quick-game", (rawUsername) => {
    const username = sanitizeUsername(rawUsername);
    if (!username) {
      socket.emit("room-error", "Invalid username");
      return;
    }

    let room = roomManager.findAvailableRoom();
    if (!room) {
      room = roomManager.createRoom();
    }

    joinRoomLogic(socket, room, username);
    console.log(`[quick-join] "${username}" → Room ${room.id}`);
  });

  // ── Game Control ─────────────────────────────────────────────────────────

  socket.on("start-game", () => {
    const room = getRoomForSocket(socket);
    if (!room) return;

    // BUG-3 fix: only the host can start the game
    if (!room.isHost(socket.id)) {
      socket.emit("room-error", "Only the host can start the game");
      return;
    }

    room.startGame();
  });

  socket.on("select-word", (word) => {
    const room = getRoomForSocket(socket);
    if (!room) return;

    if (room.currentDrawerId !== socket.id) return;
    if (typeof word !== "string" || word.trim().length === 0) return;

    room.startDrawing(word);
  });

  // ── Drawing ──────────────────────────────────────────────────────────────

  socket.on("draw-stroke", (stroke) => {
    const room = getRoomForSocket(socket);
    if (!room) return;
    if (room.currentDrawerId !== socket.id) return;

    // Basic validation: a stroke must have at least one point
    if (
      !stroke ||
      !Array.isArray(stroke.points) ||
      stroke.points.length === 0
    ) {
      return;
    }

    room.addStroke(stroke);
    socket.to(room.id).emit("get-stroke", stroke);
  });

  socket.on("clear-canvas", () => {
    const room = getRoomForSocket(socket);
    if (!room) return;
    if (room.currentDrawerId !== socket.id) return;

    room.strokes = [];
    socket.to(room.id).emit("clear-canvas");
  });

  // BUG-1 fix: undo-stroke handler broadcasts to all clients
  socket.on("undo-stroke", () => {
    const room = getRoomForSocket(socket);
    if (!room) return;
    if (room.currentDrawerId !== socket.id) return;

    room.handleUndoStroke();
  });

  // ── Chat ─────────────────────────────────────────────────────────────────

  socket.on("send-chat", (rawMsg) => {
    const msg = sanitizeChatMessage(rawMsg);
    if (!msg) return;

    const room = getRoomForSocket(socket);
    if (!room) return;

    room.handleGuess(socket.id, msg);
  });

  // ── Utility ──────────────────────────────────────────────────────────────

  // BUG-6 fix: use a callback instead of `return`
  socket.on("get-room-id", (callback) => {
    callback(socket.data.roomId ?? null);
  });

  // ── Disconnect ───────────────────────────────────────────────────────────

  socket.on("disconnect", () => {
    const roomId = socket.data.roomId;
    if (roomId) {
      const room = roomManager.getRoom(roomId);
      if (room) {
        const user = room.removeUser(socket.id);
        if (user) {
          io.to(roomId).emit("user-left", user.id);
          console.log(`[leave]     "${user.name}" ← Room ${roomId}`);
        }

        if (room.isEmpty()) {
          roomManager.deleteRoom(roomId);
          console.log(`[delete]    Room ${roomId} (empty)`);
        }
      }
    }
    console.log(`[disconnect] ${socket.id}`);
  });
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Get the room the socket belongs to. Returns undefined (and emits an error)
 *  if the socket isn't in a room. */
function getRoomForSocket(socket: AppSocket) {
  const roomId = socket.data.roomId;
  if (!roomId) return undefined;
  return roomManager.getRoom(roomId);
}

// ─── Start ───────────────────────────────────────────────────────────────────

server.listen(PORT, () => {
  console.log(`\n🎨 NotSkribbl.io server running on http://localhost:${PORT}`);
  console.log(`   CORS origin: ${CORS_ORIGIN}\n`);
});
