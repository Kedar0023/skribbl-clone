import useGameStore from "@/store/gameStore";
import { useEffect, useState } from "react";

//---------------------------------------------------------------------------------------
const Navbar = () => {
	const {round , totalRounds,wordToGuess,timeInSec} = useGameStore();
	//---------------------------------------------------------------------------------------

	const [countdown, setCountdown] = useState<number>(timeInSec);
	useEffect(() => {
		const countdown = setInterval(() => {
			setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
		}, 1000);
		return () => clearInterval(countdown);
	}, []);

	const convertTimeIntoMinSec = (time: number) => {
		const min = Math.floor(time / 60);
		const sec = time % 60;
		return `${min}:${sec < 10 ? "0" : ""}${sec}`;
	};
	//---------------------------------------------------------------------------------------
	const [word, setWord] = useState<string>("");
	const interval = 30000; // 30sec

	useEffect(() => {
		const wordArr = wordToGuess.split("");
		let displayArr = new Array(wordArr.length).fill("_");

		const initialRevealCount = wordArr.length > 3 ? 2 : 1;
		const indices = wordArr.map((_, idx) => idx);

		// Randomly reveal some letters initially
		for (let i = 0; i < initialRevealCount; i++) {
			const randIdx = Math.floor(Math.random() * indices.length);
			const revealIdx = indices[randIdx];
			displayArr[revealIdx] = wordArr[revealIdx];
			indices.splice(randIdx, 1);
		}

		setWord(displayArr.join(""));
		const remainingIndices = [...indices];

		const timer = setInterval(() => {
			if (remainingIndices.length === 0) {
				clearInterval(timer);
				return;
			}

			// Pick a random index from remaining unrevealed letters
			const randomIdx = Math.floor(Math.random() * remainingIndices.length);
			const revealIdx = remainingIndices[randomIdx];

			displayArr[revealIdx] = wordArr[revealIdx];
			setWord(displayArr.join(""));

			remainingIndices.splice(randomIdx, 1);
		}, interval);

		return () => clearInterval(timer);
	}, [wordToGuess, interval]);
	//---------------------------------------------------------------------------------------

	return (
		<header className="flex justify-between items-center p-4 bg-gray-800 border-b border-gray-700 relative z-10">
			<div className="flex items-center space-x-2 text-xl font-bold">
				<span className="text-gray-400">Round  </span>
				<span>{round}</span>
				<span className="text-gray-400"> / </span>
				<span>{totalRounds}</span>
			</div>
			<div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
				<span className="text-sm text-gray-400 uppercase tracking-widest">
					Guess This word
				</span>
				<div className="text-4xl mt-1 flex gap-3">
					{word.split("").map((c, i) => {
						return <span key={i}>{c}</span>;
					})}
				</div>
			</div>
			<div className="flex items-center space-x-4">
                <span className="text-gray-400">Time Left : </span>
				<span className="text-3xl font-bold text-yellow-400">
					{convertTimeIntoMinSec(countdown)}
				</span>
			</div>
		</header>
	);
};

export default Navbar;
