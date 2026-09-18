import { GAME_CONFIG } from "./config";

// ─── Scoring Functions ────────────────────────────────────────────────────────

/**
 * Calculates score for a correct guesser based on remaining time.
 */
export function calculateGuesserScore(timeLeft: number): number {
  return Math.max(0, Math.ceil(timeLeft * GAME_CONFIG.SCORE_PER_SECOND));
}

/**
 * Calculates reward points for the drawer when a player correctly guesses.
 */
export function calculateDrawerReward(): number {
  return GAME_CONFIG.DRAWER_BONUS_PER_GUESS;
}

// ─── Word Hint Helper ────────────────────────────────────────────────────────

/**
 * Generates an underscored hint string with spaces between letters.
 * Spaces and hyphens in the original word are always visible.
 */
export function generateHint(
  word: string,
  revealedIndices: ReadonlySet<number>,
): string {
  return word
    .split("")
    .map((ch, i) => {
      if (ch === " " || ch === "-") return ch;
      if (revealedIndices.has(i)) return ch;
      return "_";
    })
    .join(" ");
}

// ─── Small Sanitization Helpers ──────────────────────────────────────────────

export function sanitizeUsername(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (
    trimmed.length < GAME_CONFIG.MIN_USERNAME_LENGTH ||
    trimmed.length > GAME_CONFIG.MAX_USERNAME_LENGTH
  ) {
    return null;
  }
  return trimmed;
}

export function sanitizeChatMessage(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (
    trimmed.length < GAME_CONFIG.MIN_CHAT_LENGTH ||
    trimmed.length > GAME_CONFIG.MAX_CHAT_LENGTH
  ) {
    return null;
  }
  return trimmed;
}

export function sanitizeRoomId(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (
    trimmed.length === 0 ||
    trimmed.length > GAME_CONFIG.MAX_ROOM_ID_LENGTH
  ) {
    return null;
  }
  return trimmed;
}

// ─── Logger ───────────────────────────────────────────────────────────────────

export const logger = {
  info: (tag: string, message: string) => {
    console.log(`[${new Date().toISOString()}] [INFO] [${tag}] ${message}`);
  },
  warn: (tag: string, message: string) => {
    console.warn(`[${new Date().toISOString()}] [WARN] [${tag}] ${message}`);
  },
  error: (tag: string, message: string, error?: unknown) => {
    console.error(
      `[${new Date().toISOString()}] [ERROR] [${tag}] ${message}`,
      error ?? "",
    );
  },
  debug: (tag: string, message: string) => {
    if (process.env.NODE_ENV !== "production") {
      console.debug(`[${new Date().toISOString()}] [DEBUG] [${tag}] ${message}`);
    }
  },
};
