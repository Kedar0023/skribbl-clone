import { useEffect } from "react";
import { useNavigate } from "react-router";
import { GameState } from "@repo/types/socket";
import useGameStore from "../store/gameStore";
import Navbar from "../components/Navbar";
import Players from "../components/Players";
import ChatBox from "../components/ChatBox";
import Canvas from "../components/Canvas";
import Leaderboard from "../components/Leaderboard";
import { PaperButton } from "../components/Button";
export function meta() {
    return [{ title: "Playing Skribbl Doodle" }];
}
function Overlay({ children }: { children: React.ReactNode }) {
    return (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-paper-black/70 p-4">
            <section className="paper-surface paper-enter flex w-full max-w-md flex-col items-center gap-4 p-7 text-center">
                {children}
            </section>
        </div>
    );
}
export default function Game() {
    const navigate = useNavigate();
    const {
        roomId,
        users,
        currentDrawerId,
        gameState,
        isHost,
        isDrawer,
        timeInSec,
        availableWords,
        wordToGuess,
        actions: { selectWord, startGame },
    } = useGameStore();

    useEffect(() => {
        if (!roomId) navigate("/");
    }, [roomId, navigate]);
    
    if (!roomId) return null;
    return (
        <div className="paper-page flex h-screen w-screen flex-col overflow-hidden text-paper-black">
            <Navbar />
            <div className="relative flex flex-1 overflow-hidden">
                <Players players={users} currentDrawerId={currentDrawerId} />
                <main className="relative flex min-w-0 flex-1 overflow-hidden bg-paper-grey50">
                    <Canvas />
                    {gameState === GameState.LOBBY && (
                        <Overlay>
                            <span className="rounded-full border-2 border-paper-black bg-paper-lilac px-4 py-1 font-hand text-xl">
                                Game lobby
                            </span>
                            <h2 className="font-hand text-4xl">Waiting for players…</h2>
                            <p className="font-body font-bold text-paper-grey">
                                {users.length} player{users.length === 1 ? "" : "s"} in the
                                room. {users.length < 2 && "Invite one more to start."}
                            </p>
                            {isHost ? (
                                <PaperButton disabled={users.length < 2} onClick={startGame}>
                                    Start game
                                </PaperButton>
                            ) : (
                                <p className="font-body text-sm font-bold">
                                    The host will start the game.
                                </p>
                            )}
                        </Overlay>
                    )}
                    {gameState === GameState.STARTING && (
                        <Overlay>
                            <span className="rounded-full border-2 border-paper-black bg-paper-blue px-4 py-1 font-hand text-xl">
                                Get ready!
                            </span>
                            <p className="font-hand text-4xl">Game starts in</p>
                            <strong className="font-hand text-7xl text-paper-pink">
                                {timeInSec}
                            </strong>
                        </Overlay>
                    )}
                    {gameState === GameState.CHOOSING && isDrawer && (
                        <Overlay>
                            <span className="rounded-full border-2 border-paper-black bg-paper-pink px-4 py-1 font-hand text-xl">
                                Your turn to draw
                            </span>
                            <h2 className="font-hand text-4xl">Choose a word</h2>
                            <div className="flex flex-wrap justify-center gap-3">
                                {availableWords.map((word) => (
                                    <PaperButton
                                        key={word}
                                        variant="blue"
                                        onClick={() => selectWord(word)}
                                    >
                                        {word}
                                    </PaperButton>
                                ))}
                            </div>
                            <p className="font-body text-sm font-bold">
                                Pick within {timeInSec}s
                            </p>
                        </Overlay>
                    )}
                    {gameState === GameState.CHOOSING && !isDrawer && (
                        <Overlay>
                            <h2 className="font-hand text-4xl">The artist is choosing…</h2>
                            <p className="font-body font-bold text-paper-grey">
                                Get ready to guess fast.
                            </p>
                        </Overlay>
                    )}
                    {gameState === GameState.ROUND_END && (
                        <Overlay>
                            <span className="rounded-full border-2 border-paper-black bg-paper-lilac px-4 py-1 font-hand text-xl">
                                Round over
                            </span>
                            <p className="font-body font-bold">The word was</p>
                            <strong className="font-hand text-5xl capitalize">
                                {wordToGuess || "…"}
                            </strong>
                        </Overlay>
                    )}
                </main>
                <ChatBox />
            </div>
            {gameState === GameState.GAME_END && <Leaderboard />}
        </div>
    );
}
