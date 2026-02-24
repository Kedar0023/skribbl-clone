import type { User, Stroke } from "@repo/types/socket";
import { GameState } from "@repo/types/socket";
import { WORDS } from "./words";
import { Server } from "socket.io";
//------------------------------------------------------------------------------

export class Room {
  id: string;
  users: User[] = [];
  maxPlayers: number = 8;
  strokes: Stroke[] = [];
  correctGuesses: string[] = [];

  gameState: GameState = GameState.LOBBY;
  currentDrawerId: string | null = null;
  currentWord: string | null = null;
  timer: ReturnType<typeof setInterval> | null = null;
  timeLeft: number = 0;
  round: number = 1;
  totalRounds: number = 2;
  //------------------------------------------------------------------------------

  // Server instance to emit events directly from room
  private io: Server;

  constructor(id: string, io: Server) {
    this.id = id;
    this.io = io;
  }

  private broadcastState() {
    this.io.to(this.id).emit("game-state-change", this.gameState);
    this.io.to(this.id).emit("round-sync", this.round, this.totalRounds);
  }
  //------------------------------------------------------------------------------
  addUser(user: User): boolean {
    if (
      this.users.length >= this.maxPlayers ||
      this.gameState !== GameState.LOBBY
    ) {
      return false;
    }
    this.users.push(user);
    return true;
  }

  removeUser(userId: string): User | undefined {
    const index = this.users.findIndex((u) => u.id === userId);
    if (index !== -1) {
      const user = this.users.splice(index, 1)[0];

      // Clean up left user from correct guesses
      this.correctGuesses = this.correctGuesses.filter((id) => id !== userId);

      // If not enough players to continue, end the game
      if (
        this.users.length < 2 &&
        this.gameState !== GameState.LOBBY &&
        this.gameState !== GameState.GAME_END
      ) {
        this.endGame();
        return user;
      }

      // Handle if drawer leaves
      if (this.currentDrawerId === userId) {
        this.endRound();
      } else if (this.gameState === GameState.DRAWING) {
        // Check if all remaining guessers have already correctly guessed
        const totalGuessers = this.users.length - 1;
        if (totalGuessers > 0 && this.correctGuesses.length >= totalGuessers) {
          this.endRound();
        }
      }
        return user;
    }
    return undefined;
  }

  isEmpty(): boolean {
    return this.users.length === 0;
  }
  //------------------------------------------------------------------------------

  startGame() {
    if (this.users.length < 2) return; // Need atleast II
    this.gameState = GameState.STARTING;
    this.broadcastState();

    let startCount = 3;
    this.startTimer(startCount, () => {
      this.startRound();
    });
  }
  //------------------------------------------------------------------------------

  // PickRandomUserToDraw() {
  //     if (this.users.length < 1) return;

  //     const availableUsers = this.users.filter(u => u.id !== this.currentDrawerId);
  //     const pool = availableUsers.length > 0 ? availableUsers : this.users;

  //     const randomIdx = Math.floor(Math.random() * pool.length);
  //     this.currentDrawerId = pool[randomIdx]?.id ?? null;
  // }
  PickRandomUserToDraw(): void {
    const { users, currentDrawerId } = this;
    const count = users.length;

    if (count === 0) return;

    let idx: number;

    do {
      idx = Math.floor(Math.random() * count);
    } while (count > 1 && users[idx]?.id === currentDrawerId);

    this.currentDrawerId = users[idx]?.id ?? null;
  }

  PickRandomWords(): string[] {
    const wordsToChooseFrom = new Set<string>();

    while (wordsToChooseFrom.size < 3) {
      let word = WORDS[Math.floor(Math.random() * WORDS.length)];
      if (word) wordsToChooseFrom.add(word);
    }
    return Array.from(wordsToChooseFrom);
  }
  //------------------------------------------------------------------------------

  startRound() {
    if (this.round > this.totalRounds) {
      this.endGame();
      return;
    }

    this.gameState = GameState.CHOOSING;
    this.strokes = [];
    this.broadcastState();
    this.io.to(this.id).emit("clear-canvas");

    this.PickRandomUserToDraw();

    const words = this.PickRandomWords();

    // Notify drawer
    if (this.currentDrawerId) {
      this.io.to(this.currentDrawerId).emit("your-turn-to-choose", words);
    }

    // 15 sec to choose
    this.startTimer(15, () => {
      // Auto-select if no choice
      if (words[0]) {
        this.startDrawing(words[0]);
      }
    });
  }
  //------------------------------------------------------------------------------

  startDrawing(word: string) {
    this.gameState = GameState.DRAWING;
    this.currentWord = word;
    this.correctGuesses = [];
    this.broadcastState();
    this.io.to(this.id).emit("clear-canvas");

    this.io.to(this.id).emit("word-selected", word);

    // 60 sec to draw
    this.startTimer(60, () => {
      this.endRound();
    });
  }

  endRound() {
    this.gameState = GameState.ROUND_END;
    this.broadcastState();

    this.round++;

    this.startTimer(5, () => {
      this.startRound();
    });
  }

  endGame() {
    this.gameState = GameState.GAME_END;
    this.broadcastState();
    this.stopTimer();
  }
  //------------------------------------------------------------------------------

  handleGuess(userId: string, guess: string) {
    if (this.gameState !== GameState.DRAWING || !this.currentWord) {
      this.io
        .to(this.id)
        .emit(
          "chat-msg",
          `${this.users.find((u) => u.id === userId)?.name}: ${guess}`,
        );
      return;
    }

    if (guess.toLowerCase() === this.currentWord.toLowerCase()) {
      const user = this.users.find((u) => u.id === userId);
      if (user) {
        user.score += Math.ceil(this.timeLeft * 10); // Simple scoring

        if (!this.correctGuesses.includes(userId)) {
          this.correctGuesses.push(userId);
        }

        this.io.to(this.id).emit("correct-guess", userId);
        this.io.to(this.id).emit("room-joined", this.id, this.users); // Update scores

        // Check if everyone (except drawer) guessed
        const totalGuessers = this.users.length - 1;
        if (this.correctGuesses.length >= totalGuessers) {
          this.endRound();
        }
      }
    } else {
      this.io
        .to(this.id)
        .emit(
          "chat-msg",
          `${this.users.find((u) => u.id === userId)?.name}: ${guess}`,
        );
    }
  }
  //------------------------------------------------------------------------------

  private startTimer(seconds: number, callback: () => void) {
    this.stopTimer();
    this.timeLeft = seconds;
    this.io.to(this.id).emit("timer-tick", this.timeLeft);

    this.timer = setInterval(() => {
      this.timeLeft--;
      this.io.to(this.id).emit("timer-tick", this.timeLeft);

      if (this.timeLeft <= 0) {
        this.stopTimer();
        callback();
      }
    }, 1000);
  }

  private stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
  //------------------------------------------------------------------------------
}
