import type { Server } from "socket.io";
import type { User, Stroke } from "@repo/types/socket";
import { GameState } from "@repo/types/socket";
import { GAME_CONFIG } from "./config";
import { pickRandomWords } from "./words";
import {
  calculateGuesserScore,
  calculateDrawerReward,
  generateHint,
  logger,
} from "./utils";

export class Room {
  readonly id: string;
  readonly maxPlayers: number = GAME_CONFIG.MAX_PLAYERS;
  readonly minPlayers: number = GAME_CONFIG.MIN_PLAYERS;

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
  totalRounds: number = GAME_CONFIG.TOTAL_ROUNDS;

  // Turn management (Fair drawer rotation)
  private drawerQueue: string[] = [];

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

    // Clean up tracking sets and queue
    this.correctGuesses.delete(userId);
    this.drawerQueue = this.drawerQueue.filter((id) => id !== userId);

    // Transfer host to next player if the host left
    if (this.hostId === userId) {
      this.hostId = this.users[0]?.id ?? null;
      if (this.hostId) {
        this.io.to(this.id).emit("host-changed", this.hostId);
        logger.info("Room", `Room ${this.id}: New host assigned to ${this.hostId}`);
      }
    }

    // Not enough players to continue → end game
    if (
      this.users.length < this.minPlayers &&
      this.gameState !== GameState.LOBBY &&
      this.gameState !== GameState.GAME_END
    ) {
      this.endGame();
      return user;
    }

    // If current drawer left during CHOOSING or DRAWING, advance turn immediately
    if (this.currentDrawerId === userId) {
      this.stopTimer();
      logger.info(
        "Room",
        `Room ${this.id}: Drawer disconnected in state ${this.gameState}. Advancing turn.`,
      );
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

  get currentHint(): string {
    if (!this.currentWord) return "";
    return generateHint(this.currentWord, this.revealedIndices);
  }

  // ─── Game Lifecycle ──────────────────────────────────────────────────────

  startGame(userId?: string): boolean {
    if (userId && !this.isHost(userId)) {
      return false;
    }

    if (this.users.length < this.minPlayers) {
      return false;
    }

    this.gameState = GameState.STARTING;
    this.round = 1;
    this.drawerQueue = [];
    this.broadcastState();

    this.startTimer(GAME_CONFIG.COUNTDOWN_SECONDS, () => {
      this.startNextTurn();
    });

    return true;
  }

  /**
   * Starts the next player's drawing turn using fair round-robin queue.
   */
  private startNextTurn(): void {
    // If the drawer queue is empty, repopulate for a new round
    if (this.drawerQueue.length === 0) {
      if (this.round > this.totalRounds) {
        this.endGame();
        return;
      }
      this.populateDrawerQueue();
    }

    // Pick next drawer from queue
    const nextDrawerId = this.drawerQueue.shift();
    if (!nextDrawerId || !this.users.some((u) => u.id === nextDrawerId)) {
      // If player disconnected, recurse to get next valid drawer or end
      if (this.drawerQueue.length > 0) {
        this.startNextTurn();
      } else if (this.round < this.totalRounds) {
        this.round++;
        this.startNextTurn();
      } else {
        this.endGame();
      }
      return;
    }

    this.currentDrawerId = nextDrawerId;
    this.gameState = GameState.CHOOSING;
    this.strokes = [];
    this.correctGuesses.clear();
    this.revealedIndices.clear();
    this.currentWord = null;

    this.broadcastState();
    this.io.to(this.id).emit("clear-canvas");
    this.io.to(this.id).emit("current-drawer", this.currentDrawerId);

    const words = pickRandomWords(GAME_CONFIG.WORD_CHOICES);

    // Notify the drawer with word choices
    this.io.to(this.currentDrawerId).emit("your-turn-to-choose", words);

    // Auto-select the first word if the drawer doesn't pick in time
    this.startTimer(GAME_CONFIG.CHOOSE_TIME_SECONDS, () => {
      if (words[0]) {
        this.startDrawing(words[0]);
      }
    });
  }

  /**
   * Initializes the drawer queue with all currently connected player IDs.
   */
  private populateDrawerQueue(): void {
    this.drawerQueue = this.users.map((u) => u.id);
  }

  selectWord(userId: string, word: string): boolean {
    if (this.gameState !== GameState.CHOOSING || this.currentDrawerId !== userId) {
      return false;
    }
    if (!word || word.trim().length === 0) {
      return false;
    }
    this.startDrawing(word.trim());
    return true;
  }

  startDrawing(word: string): void {
    this.stopTimer();
    this.gameState = GameState.DRAWING;
    this.currentWord = word;
    this.correctGuesses.clear();
    this.revealedIndices.clear();

    this.broadcastState();
    this.io.to(this.id).emit("clear-canvas");

    // Full word sent ONLY to drawer
    if (this.currentDrawerId) {
      this.io.to(this.currentDrawerId).emit("word-selected", word);
    }

    // Initial blank hint sent to everyone else
    const blankHint = this.currentHint;
    this.io.to(this.id).emit("word-hint", blankHint);

    this.startTimer(GAME_CONFIG.DRAW_TIME_SECONDS, () => {
      this.endRound();
    });
  }

  private endRound(): void {
    this.stopTimer();
    this.gameState = GameState.ROUND_END;

    // Reveal word to everyone at turn/round end
    if (this.currentWord) {
      this.io.to(this.id).emit("word-selected", this.currentWord);
    }

    this.broadcastState();

    // Check if the round cycle has completed
    if (this.drawerQueue.length === 0) {
      this.round++;
    }

    if (this.round > this.totalRounds) {
      this.startTimer(GAME_CONFIG.ROUND_END_SECONDS, () => {
        this.endGame();
      });
    } else {
      this.startTimer(GAME_CONFIG.ROUND_END_SECONDS, () => {
        this.startNextTurn();
      });
    }
  }

  private endGame(): void {
    this.stopTimer();
    this.gameState = GameState.GAME_END;
    this.currentDrawerId = null;
    this.currentWord = null;
    this.drawerQueue = [];
    this.broadcastState();
  }

  playAgain(userId: string): boolean {
    if (!this.isHost(userId)) {
      return false;
    }

    if (this.gameState !== GameState.GAME_END) {
      return false;
    }

    // Reset scores
    for (const user of this.users) {
      user.score = 0;
    }

    this.round = 1;
    this.strokes = [];
    this.correctGuesses.clear();
    this.revealedIndices.clear();
    this.currentWord = null;
    this.currentDrawerId = null;
    this.drawerQueue = [];

    this.io.to(this.id).emit("score-update", this.users);
    this.io.to(this.id).emit("clear-canvas");

    return this.startGame(userId);
  }

  // ─── Chat & Guessing ────────────────────────────────────────────────────

  handleGuess(userId: string, guess: string): void {
    const user = this.users.find((u) => u.id === userId);
    if (!user) return;

    // Drawer cannot guess their own word
    if (userId === this.currentDrawerId) return;

    // If not drawing or no word set, broadcast regular chat
    if (this.gameState !== GameState.DRAWING || !this.currentWord) {
      this.broadcastChatMessage(user.name, guess);
      return;
    }

    // Players who already guessed correctly are silenced for this turn
    if (this.correctGuesses.has(userId)) return;

    // Check if guess matches the word
    if (guess.toLowerCase().trim() === this.currentWord.toLowerCase()) {
      const points = calculateGuesserScore(this.timeLeft);
      user.score += points;
      this.correctGuesses.add(userId);

      // Award bonus reward to the drawer
      if (this.currentDrawerId) {
        const drawer = this.users.find((u) => u.id === this.currentDrawerId);
        if (drawer) {
          drawer.score += calculateDrawerReward();
        }
      }

      this.io.to(this.id).emit("correct-guess", userId);
      this.io.to(this.id).emit("score-update", this.users);

      this.checkAllGuessed();
    } else {
      this.broadcastChatMessage(user.name, guess);
    }
  }

  private broadcastChatMessage(sender: string, message: string): void {
    this.io.to(this.id).emit("chat-msg", `${sender}: ${message}`);
  }

  /** End turn early if all guessers have successfully guessed. */
  private checkAllGuessed(): void {
    const totalGuessers = this.users.length - 1;
    if (totalGuessers > 0 && this.correctGuesses.size >= totalGuessers) {
      this.endRound();
    }
  }

  // ─── Drawing Actions ─────────────────────────────────────────────────────

  drawStroke(userId: string, stroke: Stroke): boolean {
    if (this.gameState !== GameState.DRAWING || this.currentDrawerId !== userId) {
      return false;
    }
    this.strokes.push(stroke);
    return true;
  }

  clearCanvas(userId: string): boolean {
    if (this.gameState !== GameState.DRAWING || this.currentDrawerId !== userId) {
      return false;
    }
    this.strokes = [];
    return true;
  }

  undoStroke(userId: string): boolean {
    if (this.gameState !== GameState.DRAWING || this.currentDrawerId !== userId) {
      return false;
    }
    if (this.strokes.length > 0) {
      this.strokes.pop();
    }
    return true;
  }

  // ─── Word Hints ──────────────────────────────────────────────────────────

  revealHintLetter(): void {
    if (!this.currentWord) return;

    const hiddenIndices = this.currentWord
      .split("")
      .map((ch, i) => ({ ch, i }))
      .filter(
        ({ ch, i }) =>
          ch !== " " && ch !== "-" && !this.revealedIndices.has(i),
      )
      .map(({ i }) => i);

    if (hiddenIndices.length <= 1) return; // Keep at least 1 letter hidden

    const randomIdx =
      hiddenIndices[Math.floor(Math.random() * hiddenIndices.length)]!;
    this.revealedIndices.add(randomIdx);

    const hint = this.currentHint;
    this.io.to(this.id).emit("word-hint", hint);
  }

  // ─── Timer & State Sync ──────────────────────────────────────────────────

  private broadcastState(): void {
    this.io.to(this.id).emit("game-state-change", this.gameState);
    this.io.to(this.id).emit("round-sync", this.round, this.totalRounds);
  }

  private startTimer(seconds: number, callback: () => void): void {
    this.stopTimer();
    this.timeLeft = seconds;
    this.io.to(this.id).emit("timer-tick", this.timeLeft);

    let elapsed = 0;

    this.timer = setInterval(() => {
      this.timeLeft--;
      elapsed++;
      this.io.to(this.id).emit("timer-tick", this.timeLeft);

      // Progressively reveal hints during DRAWING
      if (
        this.gameState === GameState.DRAWING &&
        elapsed % GAME_CONFIG.HINT_INTERVAL_SECONDS === 0
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

  destroy(): void {
    this.stopTimer();
    this.strokes = [];
    this.correctGuesses.clear();
    this.revealedIndices.clear();
    this.drawerQueue = [];
  }
}
