# 🏛️ Architecture & Code Design Overview — `apps/server` (V2)

> **Application**: Skribbl Clone Backend Server (V2)  
> **Location**: [`apps/server`](file:///home/kedar/me/Projects_/skribble-clone/apps/server)  
> **Runtime**: [Bun](https://bun.sh) with TypeScript  
> **Networking**: [Socket.IO](https://socket.io/) (v4.8+) over Node HTTP / Express (v5.1+)  
> **Validation**: [Zod](https://zod.dev)  
> **Type Definitions**: [`@repo/types`](file:///home/kedar/me/Projects_/skribble-clone/packages/types/src/socket-types.ts)  
> **Architecture Pattern**: Small Modular Monolith  

---

## 1. Executive Summary

`apps/server` (V2) is an in-memory, event-driven real-time multiplayer backend for a Skribbl.io clone. It coordinates game lobbies, fair turn-taking drawer queues, word selection, canvas vector stroke synchronization, guess verification with drawer incentives, progressive word hints, and graceful lifecycle transitions.

The V2 architecture follows a **small modular monolith** pattern designed for clarity and reliability:
- **`Room.ts` owns the game rules** and state machine.
- **`handlers.ts` provides thin Socket.IO dispatching**.
- **`middleware.ts` enforces boundary validation via Zod schemas**.
- **`config.ts` consolidates environment and game constants**.
- **`health.ts` exposes HTTP health checks (`/healthz`)**.
- **`utils.ts` and `words.ts` provide pure calculation and helper functions**.

```text
                     ┌──────────────────┐
                     │ Client (Browser) │
                     └────────▲─────────┘
                              │ Socket.IO (WebSocket)
                              ▼
                     ┌──────────────────┐
                     │   handlers.ts    │
                     └────────┬─────────┘
                              │
                    validate via middleware.ts
                              │
                              ▼
                     ┌──────────────────┐
                     │     Room.ts      │
                     │  (Game Domain)   │
                     └────────┬─────────┘
                              │
               ┌──────────────┼──────────────┐
               ▼              ▼              ▼
           words.ts        utils.ts       config.ts
```

---

## 2. Directory & Source Structure

```text
apps/server/
├── package.json              # Bun scripts, Express, Socket.IO, Zod, @repo/types
├── tsconfig.json             # TypeScript configuration targeting Bun
├── biome.json                # Biome linter/formatter rules
├── current_state.md          # Architecture & state documentation
├── README.md                 # Setup instructions
└── src/
    ├── index.ts              # Entry point: Express/HTTP/Socket.IO bootstrap, graceful shutdown
    ├── config.ts             # Environment variables (Zod-validated) & game constants
    ├── Room.ts               # Core game lifecycle, turn queue, scoring, timers
    ├── RoomManager.ts        # Singleton room registry, ID generator, matchmaking
    ├── words.ts              # Word dictionary & randomized sampling
    ├── handlers.ts           # Thin Socket.IO event handlers
    ├── middleware.ts         # Zod boundary validation schemas & helpers
    ├── utils.ts              # Scoring calculations, word hint masks, logging
    └── health.ts             # Express health check endpoints (/healthz, /health)
```

---

## 3. Core Component Responsibilities

### 3.1. `src/index.ts`
- Creates Express application and HTTP server.
- Mounts `/healthz` and `/health` endpoints.
- Initializes Socket.IO with CORS configuration.
- Registers Socket.IO connection routing via `registerSocketHandlers()`.
- Implements graceful shutdown listeners (`SIGTERM`, `SIGINT`) cleaning up active room timers and open connections.

### 3.2. `src/config.ts`
- Validates environment variables (`PORT`, `CORS_ORIGIN`, `NODE_ENV`) with Zod.
- Defines `GAME_CONFIG` constants: countdowns, turn durations, scoring rates, word choices, payload limits.

### 3.3. `src/middleware.ts`
- Boundary validation schemas using Zod:
  - `usernameSchema` (1–20 characters, trimmed).
  - `roomIdSchema` (1–16 characters, trimmed).
  - `chatMessageSchema` (1–200 characters, trimmed).
  - `strokeSchema` (tool, width, color, and capped coordinate points array).
  - `selectWordSchema` (1–50 characters).
- Provides `validateSafe(schema, data)` helper.

### 3.4. `src/handlers.ts`
- Translates network events into calls on `Room` / `RoomManager`.
- Validates all untrusted client payloads before passing to domain methods.
- Handles late-join canvas synchronization: when a player joins during `DRAWING`, immediately transmits `stroke-history`, `current-drawer`, `word-hint`, and `game-state-change`.

### 3.5. `src/Room.ts`
- **Core Game Domain**: Owns player roster, host assignment, current drawer, turn queue, active word, and strokes.
- **Fair Drawer Rotation**: Uses `drawerQueue: string[]` to ensure every player draws once per round cycle.
- **Scoring & Drawer Rewards**: Calls pure functions `calculateGuesserScore(timeLeft)` and `calculateDrawerReward()`.
- **Timer Management**: Single interval owner with guaranteed cleanup on state transitions and room teardown.
- **Host Migration**: Automatically reassigns host on disconnect and emits `host-changed`.
- **Play Again**: Supports host-initiated reset of game state, scores, and round counters via `playAgain()`.

### 3.6. `src/RoomManager.ts`
- Singleton room registry holding an in-memory `Map<string, Room>`.
- Generates collision-free 8-character uppercase room IDs.
- Quick match lookup (`findAvailableRoom()`).
- Room cleanup and `destroyAll()` for graceful server termination.

### 3.7. `src/words.ts`
- Curated ~200 words across 7 categories (Animals, Food, Objects, Characters, Places, Activities, Nature).
- `pickRandomWords(count)` pure selection helper.

### 3.8. `src/utils.ts`
- Pure scoring helpers (`calculateGuesserScore`, `calculateDrawerReward`).
- `generateHint(word, revealedIndices)` mask generator.
- Sanitizers and structured `logger` (`info`, `warn`, `error`, `debug`).

### 3.9. `src/health.ts`
- `GET /healthz`: returns status, ISO timestamp, process uptime, and active room count.
- `GET /health`: simple `{ "status": "ok" }`.

---

## 4. Socket.IO Protocol & Event Matrix

Shared types are declared in [`packages/types/src/socket-types.ts`](file:///home/kedar/me/Projects_/skribble-clone/packages/types/src/socket-types.ts).

### Client → Server Events
- `create-room`: `(username, callback) => void`
- `join-room`: `(roomId, username) => void`
- `join-quick-game`: `(username) => void`
- `start-game`: `() => void`
- `select-word`: `(word) => void`
- `draw-stroke`: `(stroke: Stroke) => void`
- `clear-canvas`: `() => void`
- `undo-stroke`: `() => void`
- `send-chat`: `(msg: string) => void`
- `get-room-id`: `(callback) => void`
- `play-again`: `() => void`

### Server → Client Events
- `room-joined`: `(roomId, users)`
- `room-error`: `(msg)`
- `user-joined`: `(user)`
- `user-left`: `(userId)`
- `chat-msg`: `(msg)`
- `get-stroke`: `(stroke)`
- `undo-stroke`: `()`
- `clear-canvas`: `()`
- `game-state-change`: `(state)`
- `timer-tick`: `(time)`
- `round-sync`: `(round, totalRounds)`
- `current-drawer`: `(drawerId)`
- `your-turn-to-choose`: `(words)`
- `word-selected`: `(word)`
- `word-hint`: `(hint)`
- `correct-guess`: `(userId)`
- `score-update`: `(users)`
- `stroke-history`: `(strokes)`
- `host-changed`: `(hostId)`
