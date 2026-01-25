import { io ,Socket} from "socket.io-client";
import type{ServerToClientEvents,ClientToServerEvents} from "@repo/types/socket"

const socket:Socket<ServerToClientEvents, ClientToServerEvents> = io("http://localhost:5000");

export default socket;