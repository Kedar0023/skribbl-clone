import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {  useEffect, useState } from "react";
import useGameStore from "@/store/gameStore";
export const Route = createFileRoute("/")({
	component: App,
});

function App() {
	const [playerName, setPlayerName] = useState<string>("");
    const [joinCode, setJoinCode] = useState<string>("");
    const [showJoinInput, setShowJoinInput] = useState<boolean>(false);
	const navigate = useNavigate();
    const { createRoom, joinRoom } = useGameStore((state) => state.actions);

    // const roomId = useGameStore((state) => state.roomId); 
    const {roomId} = useGameStore()
    
    // If we have a roomId, we should be in game. 
    // BUT this might trigger if we just have it in store.
    // Let's rely on explicit action success for now or simple check.
    
    /* 
       Problem: separate useEffect for navigation might trigger prematurely or loop.
       Let's stick to callbacks or direct navigation if possible, but joinRoom is async via socket.
       We set up a listener in store. Let's add a useEffect here.
    */
    
    const hasJoined = useGameStore(state => !!state.roomId);
    
    if (hasJoined) {
        // Warning: this causes render loop if we don't navigate away.
        // useNavigate inside render is bad. Use useEffect.
    }
    
    // Simple way:
    const handleNavigation = () => {
        navigate({ to: "/game" });
    }

	const handlePlayClick = () => {
        if(!playerName.trim()) return alert("Enter name!");
        useGameStore.getState().actions.joinQuickGame(playerName);
        // Navigation is handled by the useEffect watching `roomId`
	};

	const handleCreateRoomClick = () => {
        if (!playerName.trim()) {
			alert("Please enter a name!");
            return;
		}
		createRoom(playerName, () => {
            handleNavigation();
        });
	};
    
    const handleJoinViaCodeClick = () => {
         if (!playerName.trim()) {
			alert("Please enter a name!");
            return;
		}
        setShowJoinInput(true);
    };
    
    const submitJoinCode = () => {
        if(joinCode.trim()) {
            joinRoom(joinCode.trim(), playerName);
            // wait for success? 
            // We need a way to know if it failed.
            // gameStore handles alert on error.
            // gameStore updates roomId on success.
        }
    }
    
    // Watch for roomId to navigate
    useEffect(() => {
        if (roomId) {
            navigate({ to: "/game" });
        }
    }, [roomId, navigate]);

	return (
		<div className="flex flex-col items-center justify-center
         h-screen w-screen text-white p-4 bg-blue-950">
			<h1
				className="text-6xl md:text-8xl font-extrabold text-white mb-12 schoolbell"
				style={{
					textShadow: "4px 4px 0px rgba(0,0,0,0.5)",
				}}
			>
				NotSkribbl.io
			</h1>

			{/* Main Content Box */}
			<div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl shadow-lg w-full max-w-md flex flex-col items-center space-y-6">
				{/* Name Input and Play Button */}
				<div className="flex items-stretch w-full">
					<input
						type="text"
						placeholder="Enter your name"
						value={playerName}
						onChange={(e) => setPlayerName(e.target.value)}
						className="flex-grow p-3 rounded-l-md text-lg text-gray-800 bg-gray-100 border-2 border-transparent focus:outline-none focus:ring-4 focus:ring-green-400 focus:border-green-500 transition-all"
					/>
					<button
						onClick={handlePlayClick}
						className="bg-green-400 text-white font-bold text-lg px-6 rounded-r-md hover:bg-green-600 focus:outline-none focus:ring-4 focus:ring-green-400 transition-colors duration-300"
					>
						Play
					</button>
				</div>
                
                {showJoinInput && (
                    <div className="flex items-stretch w-full animate-in fade-in slide-in-from-top-2">
                        <input
                            type="text"
                            placeholder="Enter Room Code"
                            value={joinCode}
                            onChange={(e) => setJoinCode(e.target.value)}
                            className="flex-grow p-3 rounded-l-md text-lg text-gray-800 bg-gray-100 border-2 border-transparent focus:outline-none focus:ring-4 focus:ring-blue-400 focus:border-blue-500 transition-all"
                        />
                        <button
                            onClick={submitJoinCode}
                            className="bg-blue-500 text-white font-bold text-lg px-6 rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-400 transition-colors duration-300"
                        >
                            Join
                        </button>
                    </div>
                )}

				{/* 'Or' Divider */}
				<div className="flex items-center w-full">
					<div className="flex-grow h-px bg-white/80"></div>
					<span className="px-4 text-sm font-light text-white">OR</span>
					<div className="flex-grow h-px bg-white/80"></div>
				</div>

				<div className="flex flex-col w-full gap-2">
					<button 
                        onClick={handleCreateRoomClick}
                        className="w-full bg-gray-200 text-gray-800 font-bold py-3 px-6 rounded-md text-lg hover:bg-gray-300 focus:outline-none focus:ring-4 focus:ring-gray-400 transition-colors duration-300"
                    >
						Create Private Room
					</button>
					<button 
                        onClick={handleJoinViaCodeClick}
                        className="w-full bg-blue-200 text-blue-900 font-bold py-3 px-6 rounded-md text-lg hover:bg-blue-300 focus:outline-none focus:ring-4 focus:ring-blue-400 transition-colors duration-300"
                    >
						Join via Room Code
					</button>
				</div>
			</div>

			{/* Footer text */}
			<footer className="absolute bottom-4 text-center text-sm text-white">
				<p>Made with ❤️ by Kedar0023_</p>
			</footer>
		</div>
	);
}
