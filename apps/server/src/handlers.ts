import type { Server, Socket } from "socket.io";
import type {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
  User,
} from "@repo/types/socket";
import { GameState } from "@repo/types/socket";
import type { RoomManager } from "./RoomManager";
import type { Room } from "./Room";
import {
  usernameSchema,
  roomIdSchema,
  chatMessageSchema,
  strokeSchema,
  selectWordSchema,
  validateSafe,
} from "./middleware";
import { logger } from "./utils";

export type AppSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

/**
 * Shared logic for adding a user to a room and notifying peers.
 * Also synchronizes canvas and game state for mid-game late joiners.
 */
function joinRoom(socket: AppSocket, room: Room, username: string): boolean {
  const user: User = { id: socket.id, name: username, score: 0 };

  if (!room.addUser(user)) {
    socket.emit("room-error", "Room is full or game has already started");
    return false;
  }

  socket.data.roomId = room.id;
  socket.data.name = username;
  socket.join(room.id);

  // Send initial room state to the joining user
  socket.emit("room-joined", room.id, room.users);

  // Notify other players in the room
  socket.to(room.id).emit("user-joined", user);

  // Late-join canvas & game synchronization
  if (room.gameState === GameState.DRAWING) {
    if (room.strokes.length > 0) {
      socket.emit("stroke-history", room.strokes);
    }
    if (room.currentDrawerId) {
      socket.emit("current-drawer", room.currentDrawerId);
    }
    if (room.currentHint) {
      socket.emit("word-hint", room.currentHint);
    }
    socket.emit("game-state-change", room.gameState);
    socket.emit("round-sync", room.round, room.totalRounds);
  }

  logger.info("Socket", `"${username}" (${socket.id}) joined room ${room.id}`);
  return true;
}

/**
 * Helper to retrieve the active room for a given socket.
 */
function getRoomForSocket(
  socket: AppSocket,
  roomManager: RoomManager,
): Room | undefined {
  const roomId = socket.data.roomId;
  if (!roomId) return undefined;
  return roomManager.getRoom(roomId);
}

/**
 * Registers all Socket.IO event handlers for a connected client.
 */
export function registerSocketHandlers(
  io: Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >,
  socket: AppSocket,
  roomManager: RoomManager,
): void {
  logger.info("Socket", `Connected: ${socket.id}`);

  // ─── Room Creation ─────────────────────────────────────────────────────────

  socket.on("create-room", (rawUsername, callback) => {
    const username = validateSafe(usernameSchema, rawUsername);
    if (!username) {
      socket.emit("room-error", "Invalid username (1-20 characters required)");
      return;
    }

    const room = roomManager.createRoom();
    const joined = joinRoom(socket, room, username);

    if (joined && typeof callback === "function") {
      callback(room.id);
    }
  });

  // ─── Room Joining ──────────────────────────────────────────────────────────

  socket.on("join-room", (rawRoomId, rawUsername) => {
    const username = validateSafe(usernameSchema, rawUsername);
    const roomId = validateSafe(roomIdSchema, rawRoomId);

    if (!username || !roomId) {
      socket.emit("room-error", "Invalid username or room ID");
      return;
    }

    const room = roomManager.getRoom(roomId);
    if (!room) {
      socket.emit("room-error", "Room not found");
      return;
    }

    joinRoom(socket, room, username);
  });

  socket.on("join-quick-game", (rawUsername) => {
    const username = validateSafe(usernameSchema, rawUsername);
    if (!username) {
      socket.emit("room-error", "Invalid username");
      return;
    }

    let room = roomManager.findAvailableRoom();
    if (!room) {
      room = roomManager.createRoom();
    }

    joinRoom(socket, room, username);
  });

  // ─── Game Flow ─────────────────────────────────────────────────────────────

  socket.on("start-game", () => {
    const room = getRoomForSocket(socket, roomManager);
    if (!room) return;

    if (!room.isHost(socket.id)) {
      socket.emit("room-error", "Only the host can start the game");
      return;
    }

    const started = room.startGame(socket.id);
    if (!started) {
      socket.emit(
        "room-error",
        `Need at least ${room.minPlayers} players to start`,
      );
    }
  });

  socket.on("select-word", (rawWord) => {
    const word = validateSafe(selectWordSchema, rawWord);
    if (!word) return;

    const room = getRoomForSocket(socket, roomManager);
    if (!room) return;

    room.selectWord(socket.id, word);
  });

  socket.on("play-again", () => {
    const room = getRoomForSocket(socket, roomManager);
    if (!room) return;

    if (!room.isHost(socket.id)) {
      socket.emit("room-error", "Only the host can restart the game");
      return;
    }

    room.playAgain(socket.id);
  });

  // ─── Drawing ───────────────────────────────────────────────────────────────

  socket.on("draw-stroke", (rawStroke) => {
    const stroke = validateSafe(strokeSchema, rawStroke);
    if (!stroke) return;

    const room = getRoomForSocket(socket, roomManager);
    if (!room) return;

    const success = room.drawStroke(socket.id, stroke);
    if (success) {
      socket.to(room.id).emit("get-stroke", stroke);
    }
  });

  socket.on("clear-canvas", () => {
    const room = getRoomForSocket(socket, roomManager);
    if (!room) return;

    const success = room.clearCanvas(socket.id);
    if (success) {
      socket.to(room.id).emit("clear-canvas");
    }
  });

  socket.on("undo-stroke", () => {
    const room = getRoomForSocket(socket, roomManager);
    if (!room) return;

    const success = room.undoStroke(socket.id);
    if (success) {
      io.to(room.id).emit("undo-stroke");
    }
  });

  // ─── Chat & Guessing ───────────────────────────────────────────────────────

  socket.on("send-chat", (rawMsg) => {
    const msg = validateSafe(chatMessageSchema, rawMsg);
    if (!msg) return;

    const room = getRoomForSocket(socket, roomManager);
    if (!room) return;

    room.handleGuess(socket.id, msg);
  });

  // ─── Query ─────────────────────────────────────────────────────────────────

  socket.on("get-room-id", (callback) => {
    if (typeof callback === "function") {
      callback(socket.data.roomId ?? null);
    }
  });

  // ─── Disconnection ─────────────────────────────────────────────────────────

  socket.on("disconnect", () => {
    const roomId = socket.data.roomId;
    if (roomId) {
      const room = roomManager.getRoom(roomId);
      if (room) {
        const user = room.removeUser(socket.id);
        if (user) {
          io.to(roomId).emit("user-left", user.id);
          logger.info("Socket", `"${user.name}" left room ${roomId}`);
        }

        if (room.isEmpty()) {
          roomManager.deleteRoom(roomId);
        }
      }
    }
    logger.info("Socket", `Disconnected: ${socket.id}`);
  });
}
