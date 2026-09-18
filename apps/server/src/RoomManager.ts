import type { Server } from "socket.io";
import { GameState } from "@repo/types/socket";
import { GAME_CONFIG } from "./config";
import { Room } from "./Room";
import { logger } from "./utils";

/**
 * Singleton registry for all active rooms.
 *
 * Use `RoomManager.getInstance(io)` on first call (passes the Socket.IO server),
 * then `RoomManager.getInstance()` everywhere else.
 */
export class RoomManager {
  private static instance: RoomManager | null = null;
  private readonly rooms: Map<string, Room> = new Map();
  private readonly io: Server;

  private constructor(io: Server) {
    this.io = io;
  }

  static getInstance(io?: Server): RoomManager {
    if (!RoomManager.instance) {
      if (!io) {
        throw new Error(
          "RoomManager needs a Socket.IO instance for initial creation",
        );
      }
      RoomManager.instance = new RoomManager(io);
    }
    return RoomManager.instance;
  }

  // ─── CRUD ──────────────────────────────────────────────────────────────

  createRoom(): Room {
    const roomId = this.generateUniqueRoomId();
    const room = new Room(roomId, this.io);
    this.rooms.set(roomId, room);
    logger.info("RoomManager", `Created room ${roomId} (Total: ${this.rooms.size})`);
    return room;
  }

  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  deleteRoom(roomId: string): void {
    const room = this.rooms.get(roomId);
    if (room) {
      room.destroy();
      this.rooms.delete(roomId);
      logger.info("RoomManager", `Deleted room ${roomId} (Total: ${this.rooms.size})`);
    }
  }

  // ─── Quick-Join ────────────────────────────────────────────────────────

  /**
   * Finds the first available room that is in the LOBBY state and has player slots.
   */
  findAvailableRoom(): Room | undefined {
    for (const room of this.rooms.values()) {
      if (
        room.gameState === GameState.LOBBY &&
        room.users.length < room.maxPlayers
      ) {
        return room;
      }
    }
    return undefined;
  }

  // ─── Room ID Generation ────────────────────────────────────────────────

  private generateUniqueRoomId(): string {
    for (let i = 0; i < GAME_CONFIG.MAX_ID_RETRIES; i++) {
      const id = crypto
        .randomUUID()
        .replace(/-/g, "")
        .substring(0, GAME_CONFIG.ROOM_ID_LENGTH)
        .toUpperCase();

      if (!this.rooms.has(id)) {
        return id;
      }
    }

    // Safety fallback
    return Date.now()
      .toString(36)
      .toUpperCase()
      .substring(0, GAME_CONFIG.ROOM_ID_LENGTH);
  }

  // ─── Stats ─────────────────────────────────────────────────────────────

  get roomCount(): number {
    return this.rooms.size;
  }

  /**
   * Cleans up all rooms and their timers. Useful for server shutdown.
   */
  destroyAll(): void {
    for (const [id, room] of this.rooms.entries()) {
      room.destroy();
      this.rooms.delete(id);
    }
  }
}
