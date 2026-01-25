import express from "express";
import type { Request, Response } from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import type {
	ClientToServerEvents,
	InterServerEvents,
	ServerToClientEvents,
	SocketData,
	Stroke,
	User
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
		methods: ["GET", "POST"]
	}
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

	socket.on("join-room", (roomId, username) => {
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
			socket.emit("room-error", "Room is full");
		}
	});

	socket.on("draw-stroke", (stroke) => {
		const roomId = socket.data.roomId;
		if (roomId) {
			const room = roomManager.getRoom(roomId);
			if (room && room.currentDrawerId === socket.id) {
				socket.to(roomId).emit("draw-stroke", stroke);
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
});

app.get("/", (req: Request, res: Response) => {
	res.send("one piece !!!");
});
app.get("/app", (req: Request, res: Response) => {
	res.send("socket io !!!");
});

server.listen(5000, () => {
	console.log("server is running on http://localhost:5000");
});
