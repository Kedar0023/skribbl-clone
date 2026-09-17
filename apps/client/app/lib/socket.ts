import { io, type Socket } from "socket.io-client";
import type {
  ServerToClientEvents,
  ClientToServerEvents,
} from "@repo/types/socket";

const socketUrl =
  typeof window !== "undefined" && window.location.hostname !== "localhost"
    ? `http://${window.location.hostname}:5000`
    : "http://localhost:5000";

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(socketUrl, {
  autoConnect: true,
  transports: ["websocket", "polling"],
});

export default socket;
