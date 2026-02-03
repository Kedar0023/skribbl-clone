import Canvas from "@/components/Canvas";
import ChatBox from "@/components/chatBox";
import Navbar from "@/components/Navbar";
import Players from "@/components/Players";
import { createFileRoute } from "@tanstack/react-router";
import useGameStore from "@/store/gameStore";
import Leaderboard from "@/components/Leaderboard";
import { GameState } from "@repo/types/socket";

export const Route = createFileRoute("/game")({
	component: RouteComponent,
});

function RouteComponent() {
	const {
        users,
        currentUser,
        gameState,
        isDrawer,
        availableWords,
        actions: { selectWord, startGame }
    } = useGameStore();
    

    console.log(isDrawer);

	return (
		<div className="flex flex-col h-screen w-screen bg-gray-900 text-white  overflow-hidden">
			<Navbar/>
			<div className="flex grow overflow-hidden">
				<Players players={users.map(u => ({...u, isSelf: u.id === currentUser?.id}))} currentDrawerId={"001"} />
				
                <div className="flex-grow relative bg-white">
                    {/* Game State Overlays */}
                    {gameState === "LOBBY" && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20">
                            <h2 className="text-4xl font-bold mb-4">Waiting for players...</h2>
                            <button 
                                onClick={startGame}
                                className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-bold"
                            >
                                Start Game
                            </button>
                        </div>
                    )}
                    
                    {gameState === "CHOOSING" && isDrawer && (
                         <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20">
                            <h2 className="text-3xl font-bold mb-6">Choose a word!</h2>
                            <div className="flex gap-4">
                                {availableWords.map(word => (
                                    <button 
                                        key={word}
                                        onClick={() => selectWord(word)}
                                        className="px-6 py-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-bold text-xl capitalize"
                                    >
                                        {word}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
				    <Canvas/>
                </div>
                
                
                <ChatBox />
                {gameState === GameState.GAME_END && <Leaderboard/>}
			</div>
		</div>
	);
}
