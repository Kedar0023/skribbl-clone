import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import type {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from "@repo/types/socket";
import { env } from "./config";
import { RoomManager } from "./RoomManager";
import { registerSocketHandlers } from "./handlers";
import { createHealthRouter } from "./health";
import { logger } from "./utils";

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
    origin: env.CORS_ORIGIN,
    methods: ["GET", "POST"],
  },
});

const roomManager = RoomManager.getInstance(io);

// ─── HTTP Middleware & Routes ────────────────────────────────────────────────

app.use(express.json());
app.use(createHealthRouter(roomManager));

// ─── Socket Event Wiring ─────────────────────────────────────────────────────

io.on("connection", (socket) => {
  registerSocketHandlers(io, socket, roomManager);
});

// ─── Graceful Shutdown ───────────────────────────────────────────────────────

function shutdown(signal: string) {
  logger.info("Server", `Received ${signal}. Starting graceful shutdown...`);

  // Close active rooms and timers
  roomManager.destroyAll();

  // Close socket connections
  io.close(() => {
    logger.info("Server", "Socket.IO server closed.");
  });

  // Close HTTP server
  server.close(() => {
    logger.info("Server", "HTTP server closed.");
    process.exit(0);
  });

  // Force exit after 5 seconds if graceful cleanup hangs
  setTimeout(() => {
    logger.error("Server", "Forced shutdown after timeout");
    process.exit(1);
  }, 5000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

// ─── Start Server ────────────────────────────────────────────────────────────

server.listen(env.PORT, () => {
  logger.info(
    "Server",
    ` Server listening on http://localhost:${env.PORT} (CORS: ${env.CORS_ORIGIN})`,
  );
});
