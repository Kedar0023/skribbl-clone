Skribbl Clone - Project Status Report
Current State Analysis
The project is currently a UI Prototype with a basic WebSocket skeleton. It has a modern frontend stack (React, Vite, Tailwind v4) and a minimal backend (Express, Socket.IO).

Implemented Features
Frontend:

 Tech Stack: React 19, Vite, Tailwind CSS 4, Zustand, TanStack Router.
 Pages:
Landing Page (/): UI for name entry and "Create Room" button.
Create Room (/create-room): UI for setting player count (logic disconnected).
Game Page (/game): Main game layout with Canvas (drawing), Chat (mocked), and Players list (mocked).
 State: Basic Zustand store (
gameStore.ts
) for strokes and game settings.
 Canvas: Basic drawing capability using react-canvas-draw and broadcasting strokes via socket.
Backend:

 Tech Stack: Node.js/Bun, Express, Socket.IO.
 Connectivity: Handles client connections and disconnections.
 Broadcasting: Relays draw-stroke events to other connected clients.
Missing Features (To Do List)
The following core features are completely missing and need to be implemented for a playable game.

1. Server-Side Game Logic (The "Brain")
 Room Management: logic to create, join, and leave private rooms (Room ID generation).
 Game Loop: A state machine handling: Lobby -> Starting -> Choosing Word -> Drawing -> Round End -> Game End.
 Player Management: Tracking active players, scores, and "Drawer" status.
 Timer System: Server-authoritative countdowns for rounds.
 Word Selection: Logic to pick random words for the drawer to choose from.
2. Client-Server Integration
 Lobby System: UI and Logic for waiting for players before starting.
 Real-time Synchronization:
Syncing Player Lists (who is in the room).
Syncing Game State (current round, current word length, whose turn it is).
Syncing Timer.
 Chat & Guessing:
Sending messages.
Server: Logic to check if a message matches the secret word.
Client: Visual feedback for correct guesses (green text) vs normal chat.
3. Polish & Meta
 Game Over Screen: Leaderboard showing final scores and a "Play Again" button.
 Disconnect Handling: Managing what happens when the Drawer disconnects.
Suggested Improvements
Architecture
Modular Server Code: Move logic out of 
index.ts
. Create a GameManager and 
Room
 class structure to handle multiple concurrent games cleanly.
Shared Types: Expand packages/types to include all game events (game-start, round-start, tick, new-word, correct-guess) to ensure type safety between client and server.
UX/UI
Toast Notifications: Add notifications for "Player joined", "Game starting", etc.
Sound Effects: Add simple sounds for correct guess, turn start/end, and chat ticks (crucial for game feel).
Avatars: customized avatars (Skribbl style) instead of just names.
Recommended Next Steps
I recommend resolving them in this order:

Architecture: Refactor server to support Room classes.
Lobby: Implement Create/Join functionality and Player List syncing.
Game Loop: Implement the core flow (Start Game -> Pick Word -> Draw).