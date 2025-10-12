interface ServerToClientEvents {
	noArg: () => void;
	basicEmit: (a: number, b: string, c: Buffer) => void;
	withAck: (d: string, callback: (e: number) => void) => void;
	all_users: (users: string[]) => void;
	'chat-msg': (msg: string) => void;
}

interface ClientToServerEvents {
	hello: () => void;
	chat: (msg: string) => void;
}

interface InterServerEvents {
	ping: () => void;
}

interface SocketData {
	name: string;
	age: number;
}
export type{ ServerToClientEvents, ClientToServerEvents, InterServerEvents, SocketData };