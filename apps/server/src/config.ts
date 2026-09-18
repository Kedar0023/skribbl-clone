import { z } from "zod";

// ─── Environment Schema ───────────────────────────────────────────────────────

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("❌ Invalid environment variables:", parsedEnv.error.format());
  process.exit(1);
}

export const env = parsedEnv.data;

// ─── Game Constants ──────────────────────────────────────────────────────────

export const GAME_CONFIG = {
  /** How many seconds the "game starting" countdown lasts. */
  COUNTDOWN_SECONDS: 3,

  /** How many seconds the drawer gets to pick a word. */
  CHOOSE_TIME_SECONDS: 15,

  /** How many seconds the drawer gets to draw. */
  DRAW_TIME_SECONDS: 60,

  /** How many seconds to show the round-end screen. */
  ROUND_END_SECONDS: 5,

  /** How many word choices the drawer sees. */
  WORD_CHOICES: 3,

  /** How often (in seconds) to reveal an extra hint letter. */
  HINT_INTERVAL_SECONDS: 15,

  /** Base score multiplier per second of remaining time for guessers. */
  SCORE_PER_SECOND: 10,

  /** Bonus points awarded to the drawer per correct guesser. */
  DRAWER_BONUS_PER_GUESS: 25,

  /** Maximum players allowed in a room. */
  MAX_PLAYERS: 8,

  /** Minimum players needed to start a game. */
  MIN_PLAYERS: 2,

  /** Default total rounds per game. */
  TOTAL_ROUNDS: 2,

  /** Username constraints. */
  MIN_USERNAME_LENGTH: 1,
  MAX_USERNAME_LENGTH: 20,

  /** Chat message constraints. */
  MIN_CHAT_LENGTH: 1,
  MAX_CHAT_LENGTH: 200,

  /** Room ID constraints. */
  ROOM_ID_LENGTH: 8,
  MAX_ROOM_ID_LENGTH: 16,
  MAX_ID_RETRIES: 100,

  /** Stroke payload limits. */
  MAX_STROKE_POINTS: 5000,
  MIN_STROKE_WIDTH: 1,
  MAX_STROKE_WIDTH: 100,
  MAX_COORD_VALUE: 10000,
  MIN_COORD_VALUE: -10000,
} as const;
