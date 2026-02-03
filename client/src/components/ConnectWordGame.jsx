import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { toast } from 'react-hot-toast';

function HeartIcon({ filled }) {
    return (
        <svg className={clsx("w-6 h-6 transition-colors duration-300", filled ? "text-red-500 fill-red-500" : "text-slate-800 fill-slate-800")} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={filled ? 0 : 2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
    );
}

export default function ConnectWordGame({ socket, roomId, playerName, sessionId, initialData }) {
    const [word, setWord] = useState('');
    const [currentTurn, setCurrentTurn] = useState(initialData.currentTurn);
    const [timerDeadline, setTimerDeadline] = useState(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const [lastWord, setLastWord] = useState(initialData.lastWord);
    const [history, setHistory] = useState(initialData.history || []);
    const [scores, setScores] = useState(initialData.scores || { [sessionId]: 0 });
    const [lives, setLives] = useState(initialData.lives || {}); // Lives State
    const [gameStatus, setGameStatus] = useState(initialData.status || 'playing');
    const [result, setResult] = useState(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [shake, setShake] = useState(false); // For damage effect

    const inputRef = useRef(null);
    const timerRef = useRef(null);

    const isMyTurn = currentTurn === sessionId;

    // Timer Logic
    useEffect(() => {
        if (!timerDeadline) return;

        const updateTimer = () => {
            const now = Date.now();
            const left = Math.max(0, Math.ceil((timerDeadline - now) / 1000));
            setTimeLeft(left);

            if (left <= 0) {
                clearInterval(timerRef.current);
            }
        };

        updateTimer(); // Run immediately
        timerRef.current = setInterval(updateTimer, 1000);

        return () => clearInterval(timerRef.current);
    }, [timerDeadline]);

    useEffect(() => {
        // SOCKET LISTENERS

        socket.on('turn_update', ({ currentTurn, deadline }) => {
            setCurrentTurn(currentTurn);
            setTimerDeadline(deadline);
            setIsSubmitting(false); // Reset submitting state on new turn

            if (currentTurn === sessionId) {
                toast('YOUR TURN!', { icon: '🫵', id: 'turn-toast' });
                setTimeout(() => inputRef.current?.focus(), 100);
            }
        });

        socket.on('word_accepted', ({ word, player, history, scores, pointsAdded }) => {
            setLastWord(word);
            setHistory(history);
            setScores(scores); // Sync scores
            setWord('');
            setIsSubmitting(false);

            if (player === sessionId) {
                toast.success(`+${pointsAdded} Pts!`);
            }
        });

        socket.on('damage_taken', ({ player, lives, reason }) => {
            setLives(lives);
            if (player === sessionId) {
                setShake(true);
                setTimeout(() => setShake(false), 500);
                toast.error(`💔 Ouch! ${reason}`);
            }
        });

        socket.on('validation_fail', ({ reason }) => {
            toast.error(reason);
            setIsSubmitting(false);
        });

        socket.on('round_over_lanjut', (data) => {
            setResult(data);
            setGameStatus('finished');
            setScores(data.scores);
            setTimerDeadline(null);
            setIsSubmitting(false);
        });

        socket.on('game_start_lanjut', (data) => {
            setResult(null);
            setGameStatus('playing');
            setCurrentTurn(data.currentTurn);
            setTimerDeadline(null);
            setLastWord(data.lastWord);
            setHistory([]);
            setLives(data.lives); // Sync lives
            setIsSubmitting(false);
        });

        return () => {
            socket.off('turn_update');
            socket.off('word_accepted');
            socket.off('damage_taken');
            socket.off('validation_fail');
            socket.off('round_over_lanjut');
            socket.off('game_start_lanjut');
        };
    }, [socket, sessionId]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!isMyTurn || isSubmitting) return; // Prevent spam
        if (!word.trim()) return;

        setIsSubmitting(true); // Lock input
        socket.emit('submit_word_lanjut', { word });
    };

    const handleNextRound = () => {
        socket.emit('request_next_round');
    };

    const myScore = scores[sessionId] || 0;
    const myLives = lives[sessionId] !== undefined ? lives[sessionId] : 3;
    const opponentId = Object.keys(scores).find(id => id !== sessionId);
    const opponentScore = opponentId ? scores[opponentId] : 0;
    const opponentLives = opponentId && lives[opponentId] !== undefined ? lives[opponentId] : 3;
    const opponentName = Object.values(initialData.players).find(n => n !== playerName);

    // Required Start Letter
    const requiredStartChar = lastWord ? lastWord.slice(-1).toUpperCase() : null;

    // Timer Progress
    // Logic: We have timeLeft (seconds). Assuming turnDuration is 10s (default).
    // We should ideally get turnDuration from props/initialData to calculate percentage.
    // Fallback to 10 if missing.
    const maxTime = initialData.turnDuration || 10;
    const timeProgress = (timeLeft / maxTime) * 100;

    return (
        <div className={clsx("w-full max-w-4xl mx-auto transition-transform", shake ? "translate-x-2" : "")}>
            {/* Scores & Stats */}
            <div className="flex justify-between items-center bg-white/5 backdrop-blur-md p-4 rounded-xl mb-6 border border-white/5 shadow-lg">
                {/* Me */}
                <div className="flex flex-col items-start gap-1">
                    <span className="text-xs text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        You
                        <div className="flex">
                            {[...Array(3)].map((_, i) => <HeartIcon key={i} filled={i < myLives} />)}
                        </div>
                    </span>
                    <span className="text-xl font-bold text-white">{playerName}</span>
                    <span className="text-2xl font-black text-indigo-400 drop-shadow-lg">{myScore} pts</span>
                </div>

                {/* Timer Bar */}
                <div className="flex-1 mx-8">
                    <div className="text-xs text-slate-400 uppercase text-center mb-2 tracking-widest">{timeLeft}s remaining</div>
                    <div className="h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-700 relative">
                        <motion.div
                            className={clsx("h-full absolute top-0 left-0",
                                timeLeft <= 3 ? "bg-red-500" : timeLeft <= 6 ? "bg-amber-400" : "bg-emerald-500"
                            )}
                            initial={{ width: "100%" }}
                            animate={{ width: `${timeProgress}%` }}
                            transition={{ ease: "linear", duration: 0.5 }}
                        />
                    </div>
                </div>

                {/* Opponent */}
                <div className="flex flex-col items-end gap-1">
                    <span className="text-xs text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <div className="flex">
                            {[...Array(3)].map((_, i) => <HeartIcon key={i} filled={i < opponentLives} />)}
                        </div>
                        Opponent
                    </span>
                    <span className="text-xl font-bold text-white">{opponentName}</span>
                    <span className="text-2xl font-black text-slate-400">{opponentScore} pts</span>
                </div>
            </div>

            <AnimatePresence mode='wait'>
                {gameStatus === 'playing' && (
                    <motion.div
                        key="playing"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="bg-slate-800/50 p-8 rounded-3xl border border-slate-700 backdrop-blur-sm text-center relative overflow-hidden"
                    >
                        {/* Background Turn Indicator */}
                        <div className={clsx("absolute inset-0 opacity-10 transition-colors duration-500 pointer-events-none", isMyTurn ? "bg-green-500" : "bg-red-500")}></div>

                        <div className="relative z-10">
                            <h2 className="text-slate-400 text-lg mb-8 font-light uppercase tracking-widest">
                                {isMyTurn ? "It's Your Turn!" : `${opponentName} is thinking...`}
                            </h2>

                            <div className="mb-12">
                                {lastWord ? (
                                    <>
                                        <div className="text-sm text-slate-500 uppercase mb-2">Previous Word</div>
                                        <div className="text-5xl md:text-7xl font-black text-white tracking-tight">
                                            {lastWord.slice(0, -1)}
                                            <span className="text-amber-400">{lastWord.slice(-1)}</span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-4xl font-bold text-slate-500 opacity-50">
                                        start the game!
                                    </div>
                                )}
                            </div>

                            <form onSubmit={handleSubmit} className="max-w-md mx-auto relative">
                                {requiredStartChar && (
                                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-3xl font-bold text-amber-400 border-r border-slate-600 pr-4">
                                        {requiredStartChar}
                                    </div>
                                )}
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={word}
                                    onChange={(e) => setWord(e.target.value.toUpperCase())}
                                    disabled={!isMyTurn || isSubmitting}
                                    className={clsx("w-full bg-slate-900/80 border-2 rounded-2xl py-6 px-6 text-3xl font-bold text-white focus:outline-none focus:shadow-[0_0_30px_rgba(99,102,241,0.3)] transition-all uppercase placeholder:text-slate-700",
                                        requiredStartChar ? "pl-20" : "text-center",
                                        isMyTurn ? "border-indigo-500" : "border-slate-700 opacity-50",
                                        isSubmitting && "opacity-50 cursor-wait"
                                    )}
                                    placeholder={
                                        isMyTurn
                                            ? (isSubmitting ? "Checking..." : (requiredStartChar ? "..." : "Type any word..."))
                                            : "Wait..."
                                    }
                                    autoFocus
                                />
                                <button
                                    type="submit"
                                    disabled={!isMyTurn || !word || isSubmitting}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-indigo-600 p-3 rounded-xl disabled:opacity-0 transition-all hover:bg-indigo-500 hover:scale-105 active:scale-95"
                                >
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}

                {/* GAME OVER PHASE */}
                {gameStatus === 'finished' && result && (
                    <motion.div
                        key="finished"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center bg-slate-800/80 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl"
                    >
                        <div className="text-6xl mb-4">
                            {result.winner === playerName ? "🏆" : "💀"}
                        </div>
                        <h2 className="text-4xl font-black mb-2 uppercase">
                            {result.winner === playerName ? 'You Won!' : 'You Lost!'}
                        </h2>
                        <div className="bg-slate-900/50 p-4 rounded-xl mb-8">
                            <p className="text-slate-400 text-sm mb-1">{result.reason}</p>
                        </div>

                        <button
                            onClick={handleNextRound}
                            className="bg-white text-slate-900 font-bold py-3 px-8 rounded-full hover:scale-105 active:scale-95 transition-transform shadow-lg hover:shadow-white/20"
                        >
                            Play Again ➡️
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* HISTORY LOG */}
            {history.length > 0 && (
                <div className="mt-8 border-t border-slate-700/50 pt-6">
                    <h3 className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-4">Round History</h3>
                    <div className="flex flex-wrap gap-2 justify-center">
                        {history.slice().reverse().map((entry, idx) => (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                key={idx}
                                className="bg-slate-800/80 px-4 py-2 rounded-lg border border-slate-700 flex items-center gap-2"
                            >
                                <span className={clsx("text-xs font-bold px-1.5 py-0.5 rounded uppercase tracking-wider",
                                    entry.player === playerName ? "bg-indigo-500/20 text-indigo-300" : "bg-slate-600 text-slate-300"
                                )}>
                                    {entry.player === playerName ? 'YOU' : entry.player}
                                </span>
                                <span className="font-mono font-bold text-white tracking-wide">{entry.word}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
