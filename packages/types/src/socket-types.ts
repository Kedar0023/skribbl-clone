type Stroke = {
	color: string;
	width: number;
	points: { x: number; y: number }[];
	tool: "pen" | "eraser";
};
interface ServerToClientEvents {
	all_users: (users: string[]) => void;
	"chat-msg": (msg: string) => void;
	"draw-stroke": (stroke: Stroke) => void;
}

interface ClientToServerEvents {
	"draw-stroke": (stroke: Stroke) => void;
}

interface InterServerEvents {
	ping: () => void;
}

interface SocketData {
	name: string;
	age: number;
}
export type {
	ServerToClientEvents,
	ClientToServerEvents,
	InterServerEvents,
	SocketData,
	Stroke
};
