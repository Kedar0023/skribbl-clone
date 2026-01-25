
import type { User, Stroke } from "@repo/types/socket";
import { GameState } from "@repo/types/socket";
import { WORDS } from "./words";
import { Server } from "socket.io";

export class Room {
    id: string;
    users: User[] = [];
    maxPlayers: number = 8;
    strokes: Stroke[] = [];

    gameState: GameState = GameState.LOBBY;
    currentDrawerId: string | null = null;
    currentWord: string | null = null;
    timer: ReturnType<typeof setInterval> | null = null;
    timeLeft: number = 0;
    round: number = 1;
    totalRounds: number = 3;
    //-----------------------------------------------------------------------

    // Server instance to emit events directly from room
    private io: Server;

    constructor(id: string, io: Server) {
        this.id = id;
        this.io = io;
    }

    addUser(user: User): boolean {
        if (this.users.length >= this.maxPlayers || this.gameState !== GameState.LOBBY) {
            return false;
        }
        this.users.push(user);
        return true;
    }

    removeUser(userId: string): User | undefined {
        const index = this.users.findIndex((u) => u.id === userId);
        if (index !== -1) {
            const user = this.users.splice(index, 1)[0];
            // Handle if drawer leaves
            if (this.currentDrawerId === userId) {
                this.endRound();
            }
            return user;
        }
        return undefined;
    }

    isEmpty(): boolean {
        return this.users.length === 0;
    }

    startGame() {
        if (this.users.length < 2) return; // Need at least 2 players
        this.gameState = GameState.STARTING;
        this.broadcastState();

        let startCount = 5;
        this.startTimer(startCount, () => {
            this.startRound();
        });
    }

    startRound() {
        if (this.round > this.totalRounds) {
            this.endGame();
            return;
        }

        this.gameState = GameState.CHOOSING;
        this.strokes = [];
        this.broadcastState();

        // Pick random drawer
        const drawerIndex = Math.floor(Math.random() * this.users.length);
        const drawer = this.users[drawerIndex];
        if (!drawer) return;
        this.currentDrawerId = drawer.id;

        // Pick 3 random words
        const words: string[] = [];
        for (let i = 0; i < 3; i++) {
            const word = WORDS[Math.floor(Math.random() * WORDS.length)];
            if (word) words.push(word);
        }

        // Notify drawer
        if (this.currentDrawerId) {
            this.io.to(this.currentDrawerId).emit("your-turn-to-choose", words);
        }

        // 15 seconds to choose
        this.startTimer(15, () => {
            // Auto-select if no choice
            if (words[0]) {
                this.startDrawing(words[0]);
            }
        });
    }

    startDrawing(word: string) {
        this.gameState = GameState.DRAWING;
        this.currentWord = word;
        this.broadcastState();

        this.io.to(this.id).emit("word-selected", word);

        // 60 seconds to draw
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

    handleGuess(userId: string, guess: string) {
        if (this.gameState !== GameState.DRAWING || !this.currentWord) return;

        if (guess.toLowerCase() === this.currentWord.toLowerCase()) {
            const user = this.users.find(u => u.id === userId);
            if (user) {
                user.score += Math.ceil(this.timeLeft * 10); // Simple scoring
                this.io.to(this.id).emit("correct-guess", userId);
                this.io.to(this.id).emit("room-joined", this.id, this.users); // Update scores
            }
        } else {
            this.io.to(this.id).emit("chat-msg", `${this.users.find(u => u.id === userId)?.name}: ${guess}`);
        }
    }

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

    private broadcastState() {
        this.io.to(this.id).emit("game-state-change", this.gameState);
    }
}
