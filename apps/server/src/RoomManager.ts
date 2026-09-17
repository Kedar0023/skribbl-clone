import type { Server } from "socket.io";
import { GameState } from "@repo/types/socket";
import { Room } from "./Room";

// ─── Constants ───────────────────────────────────────────────────────────────

/** Length of generated room IDs. */
const ROOM_ID_LENGTH = 8;

/** Maximum retries when generating a unique room ID (safety valve). */
const MAX_ID_RETRIES = 100;

// ─── RoomManager ─────────────────────────────────────────────────────────────

/**
 * Singleton registry for all active rooms.
 *
 * Use `RoomManager.getInstance(io)` on first call (passes the Socket.IO server),
 * then `RoomManager.getInstance()` everywhere else.
 */
export class RoomManager {
  private static instance: RoomManager;
  private readonly rooms: Map<string, Room> = new Map();
  private readonly io: Server;

  private constructor(io: Server) {
    this.io = io;
  }

  static getInstance(io?: Server): RoomManager {
    if (!RoomManager.instance) {
      if (!io) {
        throw new Error(
          "RoomManager needs an io instance for first initialization",
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
    return room;
  }

  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  deleteRoom(roomId: string): void {
    const room = this.rooms.get(roomId);
    if (room) {
      room.destroy(); // clean up timers
      this.rooms.delete(roomId);
    }
  }

  // ─── Quick-Join ────────────────────────────────────────────────────────

  /** Find the first room that is still in the lobby and has space. */
  findAvailableRoom(): Room | undefined {
    for (const room of this.rooms.values()) {
      // BUG-fix: use enum instead of string comparison
      if (
        room.gameState === GameState.LOBBY &&
        room.users.length < room.maxPlayers
      ) {
        return room;
      }
    }
    return undefined;
  }

  // ─── Helpers ───────────────────────────────────────────────────────────

  /**
   * Generate a collision-free room ID.
   *
   * Uses `crypto.randomUUID` for better randomness than `Math.random`,
   * truncated to ROOM_ID_LENGTH uppercase alphanumeric characters.
   * Retries if a collision is detected (BUG-8 fix).
   */
  private generateUniqueRoomId(): string {
    for (let i = 0; i < MAX_ID_RETRIES; i++) {
      const id = crypto
        .randomUUID()
        .replace(/-/g, "")
        .substring(0, ROOM_ID_LENGTH)
        .toUpperCase();

      if (!this.rooms.has(id)) {
        return id;
      }
    }

    // Extremely unlikely — fall back to timestamp-based ID
    return Date.now().toString(36).toUpperCase().substring(0, ROOM_ID_LENGTH);
  }

  // ─── Stats (useful for debugging / health checks) ─────────────────────

  get roomCount(): number {
    return this.rooms.size;
  }
}
