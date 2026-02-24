import express from "express";
import type { Request, Response } from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import type {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
  User,
} from "@repo/types/socket";
import { RoomManager } from "./RoomManager";

const app = express();
const server = createServer(app);
const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const roomManager = RoomManager.getInstance(io);

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("create-room", (username, callback) => {
    const room = roomManager.createRoom();
    const user: User = { id: socket.id, name: username, score: 0 };
    room.addUser(user);

    socket.data.roomId = room.id;
    socket.data.name = username;

    socket.join(room.id);
    callback(room.id);

    console.log(`Room created: ${room.id} by ${username}`);
  });

  const joinRoomLogic = (roomId: string, username: string) => {
    const room = roomManager.getRoom(roomId);
    if (!room) {
      socket.emit("room-error", "Room not found");
      return;
    }

    const user: User = { id: socket.id, name: username, score: 0 };
    if (room.addUser(user)) {
      socket.data.roomId = roomId;
      socket.data.name = username;

      socket.join(roomId);

      // Notify user they joined and send current users
      socket.emit("room-joined", roomId, room.users);

      // Notify others
      socket.to(roomId).emit("user-joined", user);

      console.log(`User ${username} joined room ${roomId}`);
    } else {
      socket.emit("room-error", "Room is full or game started");
    }
  };

  socket.on("join-quick-game", (username) => {
    const room = roomManager.findAvailableRoom();
    if (room) {
      joinRoomLogic(room.id, username);
    } else {
      // Create new room if none found
      const newRoom = roomManager.createRoom();
      const user: User = { id: socket.id, name: username, score: 0 };
      newRoom.addUser(user);

      socket.data.roomId = newRoom.id;
      socket.data.name = username;

      socket.join(newRoom.id);
      socket.emit("room-joined", newRoom.id, newRoom.users); // Notify creator

      console.log(`Quick Join: Room created: ${newRoom.id} by ${username}`);
    }
  });

  socket.on("join-room", (roomId, username) => {
    joinRoomLogic(roomId, username);
  });

  socket.on("draw-stroke", (stroke) => {
    const roomId = socket.data.roomId;
    if (roomId) {
      const room = roomManager.getRoom(roomId);
      if (room && room.currentDrawerId === socket.id) {
        socket.to(roomId).emit("get-stroke", stroke);
      }
    }
  });

  socket.on("clear-canvas", () => {
    const roomId = socket.data.roomId;
    if (roomId) {
      const room = roomManager.getRoom(roomId);
      if (room && room.currentDrawerId === socket.id) {
        socket.to(roomId).emit("clear-canvas");
      }
    }
  });

  socket.on("start-game", () => {
    const roomId = socket.data.roomId;
    if (roomId) {
      const room = roomManager.getRoom(roomId);
      if (room) {
        room.startGame();
      }
    }
  });

  socket.on("select-word", (word) => {
    const roomId = socket.data.roomId;
    if (roomId) {
      const room = roomManager.getRoom(roomId);
      if (room && room.currentDrawerId === socket.id) {
        room.startDrawing(word);
      }
    }
  });

  socket.on("send-chat", (msg) => {
    const roomId = socket.data.roomId;
    if (roomId) {
      const room = roomManager.getRoom(roomId);
      if (room) {
        room.handleGuess(socket.id, msg);
      }
    }
  });

  socket.on("disconnect", () => {
    const roomId = socket.data.roomId;
    if (roomId) {
      const room = roomManager.getRoom(roomId);
      if (room) {
        const user = room.removeUser(socket.id);
        if (user) {
          io.to(roomId).emit("user-left", user.id);
          console.log(`User ${user.name} left room ${roomId}`);
        }

        if (room.isEmpty()) {
          roomManager.deleteRoom(roomId);
          console.log(`Room ${roomId} deleted (empty)`);
        }
      }
    }
    console.log(`User disconnected: ${socket.id}`);
  });

  socket.on("get-room-id", () => {
    return socket.data.roomId;
  });
});

server.listen(5000, () => {
  console.log("server is running on http://localhost:5000");
});
