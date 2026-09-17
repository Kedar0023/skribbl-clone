import type { Server } from "socket.io";
import type { User, Stroke } from "@repo/types/socket";
import { GameState } from "@repo/types/socket";
import { WORDS } from "./words";

// ─── Constants ───────────────────────────────────────────────────────────────

/** How many seconds the "game starting" countdown lasts. */
const COUNTDOWN_SECONDS = 3;

/** How many seconds the drawer gets to pick a word. */
const CHOOSE_TIME_SECONDS = 15;

/** How many seconds the drawer gets to draw. */
const DRAW_TIME_SECONDS = 60;

/** How many seconds to show the round-end screen. */
const ROUND_END_SECONDS = 5;

/** How many word choices the drawer sees. */
const WORD_CHOICES = 3;

/** How often (in seconds) to reveal an extra hint letter. */
const HINT_INTERVAL_SECONDS = 15;

/** Base score multiplier per second of remaining time. */
const SCORE_PER_SECOND = 10;

// ─── Room ────────────────────────────────────────────────────────────────────

export class Room {
  readonly id: string;
  readonly maxPlayers: number = 8;

  // Player state
  users: User[] = [];
  hostId: string | null = null;

  // Drawing state
  strokes: Stroke[] = [];

  // Game state machine
  gameState: GameState = GameState.LOBBY;
  currentDrawerId: string | null = null;
  currentWord: string | null = null;
  round: number = 1;
  totalRounds: number = 2;

  // Round tracking
  private correctGuesses: Set<string> = new Set();
  private revealedIndices: Set<number> = new Set();

  // Timer
  private timer: ReturnType<typeof setInterval> | null = null;
  private timeLeft: number = 0;

  /** Socket.IO server instance for emitting events. */
  private readonly io: Server;

  constructor(id: string, io: Server) {
    this.id = id;
    this.io = io;
  }

  // ─── Player Management ───────────────────────────────────────────────────

  addUser(user: User): boolean {
    if (
      this.users.length >= this.maxPlayers ||
      this.gameState !== GameState.LOBBY
    ) {
      return false;
    }

    this.users.push(user);

    // First player to join becomes the host
    if (this.users.length === 1) {
      this.hostId = user.id;
    }

    return true;
  }

  removeUser(userId: string): User | undefined {
    const index = this.users.findIndex((u) => u.id === userId);
    if (index === -1) return undefined;

    const [user] = this.users.splice(index, 1);

    // Clean up from correct guesses
    this.correctGuesses.delete(userId);

    // Transfer host to next player if the host left
    if (this.hostId === userId) {
      this.hostId = this.users[0]?.id ?? null;
      // TODO: emit a "host-changed" event when the client supports it
    }

    // Not enough players to continue → end game
    if (
      this.users.length < 2 &&
      this.gameState !== GameState.LOBBY &&
      this.gameState !== GameState.GAME_END
    ) {
      this.endGame();
      return user;
    }

    // If the drawer left, end the round immediately
    if (this.currentDrawerId === userId) {
      this.endRound();
    } else if (this.gameState === GameState.DRAWING) {
      // Check if all remaining guessers have already guessed correctly
      this.checkAllGuessed();
    }

    return user;
  }

  isEmpty(): boolean {
    return this.users.length === 0;
  }

  isHost(userId: string): boolean {
    return this.hostId === userId;
  }

  // ─── Game Lifecycle ──────────────────────────────────────────────────────

  startGame(): void {
    if (this.users.length < 2) return;

    this.gameState = GameState.STARTING;
    this.round = 1;
    this.broadcastState();

    this.startTimer(COUNTDOWN_SECONDS, () => {
      this.startRound();
    });
  }

  private startRound(): void {
    // BUG-2 fix: check before starting — avoids the unnecessary 5-second
    // round-end timer when the game is actually over.
    if (this.round > this.totalRounds) {
      this.endGame();
      return;
    }

    this.gameState = GameState.CHOOSING;
    this.strokes = [];
    this.correctGuesses.clear();
    this.revealedIndices.clear();
    this.currentWord = null;
    this.broadcastState();
    this.io.to(this.id).emit("clear-canvas");

    this.pickRandomDrawer();

    const words = this.pickRandomWords(WORD_CHOICES);

    // Notify the drawer — only they receive the word choices
    if (this.currentDrawerId) {
      this.io
        .to(this.currentDrawerId)
        .emit("your-turn-to-choose", words);
      this.io.to(this.id).emit("current-drawer", this.currentDrawerId);
    }

    // Auto-select the first word if the drawer doesn't pick in time
    this.startTimer(CHOOSE_TIME_SECONDS, () => {
      if (words[0]) {
        this.startDrawing(words[0]);
      }
    });
  }

  startDrawing(word: string): void {
    this.gameState = GameState.DRAWING;
    this.currentWord = word;
    this.correctGuesses.clear();
    this.revealedIndices.clear();
    this.broadcastState();
    this.io.to(this.id).emit("clear-canvas");

    // BUG-4 fix: send the full word ONLY to the drawer, send word length to
    // guessers. The drawer's socket gets the actual word; everyone else gets
    // an underscored hint.
    if (this.currentDrawerId) {
      this.io.to(this.currentDrawerId).emit("word-selected", word);
    }

    // Send initial blank hint to guessers
    const blankHint = this.generateHint(word);
    this.io.to(this.id).emit("word-hint", blankHint);

    this.startTimer(DRAW_TIME_SECONDS, () => {
      this.endRound();
    });
  }

  private endRound(): void {
    this.gameState = GameState.ROUND_END;

    // Reveal the word to everyone at round end
    if (this.currentWord) {
      this.io.to(this.id).emit("word-selected", this.currentWord);
    }

    this.broadcastState();
    this.round++;

    // BUG-2 fix: if this was the last round, go directly to game-end
    // instead of showing a pointless 5-second countdown.
    if (this.round > this.totalRounds) {
      this.startTimer(ROUND_END_SECONDS, () => {
        this.endGame();
      });
    } else {
      this.startTimer(ROUND_END_SECONDS, () => {
        this.startRound();
      });
    }
  }

  private endGame(): void {
    this.gameState = GameState.GAME_END;
    this.broadcastState();
    this.stopTimer();
  }

  // ─── Chat & Guessing ────────────────────────────────────────────────────

  handleGuess(userId: string, guess: string): void {
    const user = this.users.find((u) => u.id === userId);
    if (!user) return;

    // BUG-5 fix: the drawer cannot guess their own word
    if (userId === this.currentDrawerId) return;

    // If we're not in drawing state or no word is set, treat as regular chat
    if (this.gameState !== GameState.DRAWING || !this.currentWord) {
      this.broadcastChatMessage(user.name, guess);
      return;
    }

    // BUG-7 fix: players who already guessed correctly are silenced
    if (this.correctGuesses.has(userId)) return;

    // Check if the guess is correct
    if (guess.toLowerCase().trim() === this.currentWord.toLowerCase()) {
      user.score += Math.ceil(this.timeLeft * SCORE_PER_SECOND);

      this.correctGuesses.add(userId);

      this.io.to(this.id).emit("correct-guess", userId);
      // Dedicated score-update event instead of abusing "room-joined"
      this.io.to(this.id).emit("score-update", this.users);

      this.checkAllGuessed();
    } else {
      this.broadcastChatMessage(user.name, guess);
    }
  }

  /** Broadcast a structured chat message to the room. */
  private broadcastChatMessage(sender: string, message: string): void {
    // Still using the string format for backward compat with the client.
    // The client splits on ": " — avoid breakage by keeping the format.
    this.io.to(this.id).emit("chat-msg", `${sender}: ${message}`);
  }

  /** End the round early if all guessers have guessed correctly. */
  private checkAllGuessed(): void {
    const totalGuessers = this.users.length - 1;
    if (totalGuessers > 0 && this.correctGuesses.size >= totalGuessers) {
      this.endRound();
    }
  }

  // ─── Undo ────────────────────────────────────────────────────────────────

  /** BUG-1 fix: handle undo from the drawer and broadcast to all clients. */
  handleUndoStroke(): void {
    if (this.strokes.length > 0) {
      this.strokes.pop();
    }
    this.io.to(this.id).emit("undo-stroke");
  }

  // ─── Stroke Storage ──────────────────────────────────────────────────────

  /** Store a stroke for late-join replay. */
  addStroke(stroke: Stroke): void {
    this.strokes.push(stroke);
  }

  // ─── Word Hints ──────────────────────────────────────────────────────────

  /**
   * Generate a hint string for the current word.
   * Revealed indices show their letter; everything else is "_".
   * Spaces and hyphens are always shown.
   */
  private generateHint(word: string): string {
    return word
      .split("")
      .map((ch, i) => {
        if (ch === " " || ch === "-") return ch;
        if (this.revealedIndices.has(i)) return ch;
        return "_";
      })
      .join(" ");
  }

  /**
   * Reveal one more letter in the hint and broadcast it.
   * Called periodically by the timer.
   */
  revealHintLetter(): void {
    if (!this.currentWord) return;

    // Collect indices that haven't been revealed yet (skip spaces/hyphens)
    const hiddenIndices = this.currentWord
      .split("")
      .map((ch, i) => ({ ch, i }))
      .filter(
        ({ ch, i }) =>
          ch !== " " && ch !== "-" && !this.revealedIndices.has(i),
      )
      .map(({ i }) => i);

    if (hiddenIndices.length <= 1) return; // keep at least 1 hidden

    const randomIdx =
      hiddenIndices[Math.floor(Math.random() * hiddenIndices.length)]!;
    this.revealedIndices.add(randomIdx);

    const hint = this.generateHint(this.currentWord);
    this.io.to(this.id).emit("word-hint", hint);
  }

  // ─── Random Selection Helpers ────────────────────────────────────────────

  /** Pick a random drawer, avoiding the current one when possible. */
  private pickRandomDrawer(): void {
    const { users, currentDrawerId } = this;
    const count = users.length;

    if (count === 0) return;

    let idx: number;
    do {
      idx = Math.floor(Math.random() * count);
    } while (count > 1 && users[idx]?.id === currentDrawerId);

    this.currentDrawerId = users[idx]?.id ?? null;
  }

  /** Pick N unique random words from the word list. */
  private pickRandomWords(count: number): string[] {
    const words = new Set<string>();

    while (words.size < count && words.size < WORDS.length) {
      const word = WORDS[Math.floor(Math.random() * WORDS.length)];
      if (word) words.add(word);
    }

    return Array.from(words);
  }

  // ─── Timer ───────────────────────────────────────────────────────────────

  private broadcastState(): void {
    this.io.to(this.id).emit("game-state-change", this.gameState);
    this.io.to(this.id).emit("round-sync", this.round, this.totalRounds);
  }

  private startTimer(seconds: number, callback: () => void): void {
    this.stopTimer();
    this.timeLeft = seconds;
    this.io.to(this.id).emit("timer-tick", this.timeLeft);

    // Track elapsed seconds for hint reveals during drawing phase
    let elapsed = 0;

    this.timer = setInterval(() => {
      this.timeLeft--;
      elapsed++;
      this.io.to(this.id).emit("timer-tick", this.timeLeft);

      // Progressively reveal hint letters during drawing
      if (
        this.gameState === GameState.DRAWING &&
        elapsed % HINT_INTERVAL_SECONDS === 0
      ) {
        this.revealHintLetter();
      }

      if (this.timeLeft <= 0) {
        this.stopTimer();
        callback();
      }
    }, 1000);
  }

  private stopTimer(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  // ─── Cleanup ─────────────────────────────────────────────────────────────

  /** Stop all timers. Call when deleting a room. */
  destroy(): void {
    this.stopTimer();
  }
}
