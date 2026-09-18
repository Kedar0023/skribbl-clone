import { z } from "zod";
import { GAME_CONFIG } from "./config";
import type { Stroke } from "@repo/types/socket";

// ─── Zod Schemas ─────────────────────────────────────────────────────────────

export const usernameSchema = z
  .string()
  .trim()
  .min(GAME_CONFIG.MIN_USERNAME_LENGTH, "Username is too short")
  .max(GAME_CONFIG.MAX_USERNAME_LENGTH, "Username is too long");

export const roomIdSchema = z
  .string()
  .trim()
  .min(1, "Room ID cannot be empty")
  .max(GAME_CONFIG.MAX_ROOM_ID_LENGTH, "Room ID is too long");

export const chatMessageSchema = z
  .string()
  .trim()
  .min(GAME_CONFIG.MIN_CHAT_LENGTH, "Message cannot be empty")
  .max(GAME_CONFIG.MAX_CHAT_LENGTH, "Message is too long");

export const pointSchema = z.object({
  x: z
    .number()
    .min(GAME_CONFIG.MIN_COORD_VALUE)
    .max(GAME_CONFIG.MAX_COORD_VALUE),
  y: z
    .number()
    .min(GAME_CONFIG.MIN_COORD_VALUE)
    .max(GAME_CONFIG.MAX_COORD_VALUE),
});

export const strokeSchema = z.object({
  color: z.string().min(1).max(50),
  width: z
    .number()
    .min(GAME_CONFIG.MIN_STROKE_WIDTH)
    .max(GAME_CONFIG.MAX_STROKE_WIDTH),
  tool: z.enum(["pen", "eraser"]),
  points: z
    .array(pointSchema)
    .min(1, "Stroke must have at least one point")
    .max(GAME_CONFIG.MAX_STROKE_POINTS, "Stroke exceeds maximum points"),
}) satisfies z.ZodType<Stroke>;

export const selectWordSchema = z.string().trim().min(1).max(50);

// ─── Validation Helpers ──────────────────────────────────────────────────────

/**
 * Safely parses and validates input against a Zod schema.
 * Returns parsed value on success, or null on failure.
 */
export function validateSafe<T>(
  schema: z.ZodType<T>,
  data: unknown,
): T | null {
  const result = schema.safeParse(data);
  return result.success ? result.data : null;
}
