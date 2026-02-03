import { Room } from "./Room";
import { Server } from "socket.io";

export class RoomManager {
    //  static instance ==>  ensuring only one manager exists.
    static instance: RoomManager;
    rooms: Map<string, Room> = new Map();
    io: Server;

    private constructor(io: Server) {
        this.io = io;
    }

    static getInstance(io?: Server): RoomManager {
        if (!RoomManager.instance) {
            if (!io) throw new Error("RoomManager needs io instance for first initialization");
            RoomManager.instance = new RoomManager(io);
        }
        return RoomManager.instance;
    }

    createRoom(): Room {
        const roomId = this.generateRoomId();
        const room = new Room(roomId, this.io);
        this.rooms.set(roomId, room);
        return room;
    }

    getRoom(roomId: string): Room | undefined {
        return this.rooms.get(roomId);
    }

    deleteRoom(roomId: string) {
        this.rooms.delete(roomId);
    }

    findAvailableRoom(): Room | undefined {
        // Return first room that is in LOBBY state and not full
        for (const room of this.rooms.values()) {
            if (room.gameState === "LOBBY" && room.users.length < room.maxPlayers) {
                return room;
            }
        }
        return undefined;
    }

    private generateRoomId(): string {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    }
}
