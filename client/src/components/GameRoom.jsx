import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { toast } from 'react-hot-toast';

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');

const LockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24" className="inline-block drop-shadow-lg">
        <linearGradient id="gr1" x1="4.568" x2="19.432" y1="5.947" y2="20.811" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#fff" stopOpacity=".6"></stop><stop offset="1" stopColor="#fff" stopOpacity=".3"></stop></linearGradient><path fill="url(#gr1)" d="M18,7c0-3.314-2.686-6-6-6S6,3.686,6,7c-1.657,0-3,1.343-3,3v8c0,1.657,1.343,3,3,3h12 c1.657,0,3-1.343,3-3v-8C21,8.343,19.657,7,18,7z M8,7c0-2.209,1.791-4,4-4s4,1.791,4,4H8z"></path><linearGradient id="gr2" x1="4.568" x2="19.432" y1="5.947" y2="20.811" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#fff" stopOpacity=".6"></stop><stop offset=".493" stopColor="#fff" stopOpacity="0"></stop><stop offset=".997" stopColor="#fff" stopOpacity=".3"></stop></linearGradient><path fill="url(#gr2)" d="M12,1.5c3.033,0,5.5,2.467,5.5,5.5v0.5H18 c1.378,0,2.5,1.121,2.5,2.5v8c0,1.379-1.122,2.5-2.5,2.5H6c-1.378,0-2.5-1.121-2.5-2.5v-8c0-1.379,1.122-2.5,2.5-2.5h0.5V7 C6.5,3.967,8.967,1.5,12,1.5 M7.5,7.5H8h8h0.5V7c0-2.481-2.019-4.5-4.5-4.5S7.5,4.519,7.5,7V7.5 M12,1C8.686,1,6,3.686,6,7 c-1.657,0-3,1.343-3,3v8c0,1.657,1.343,3,3,3h12c1.657,0,3-1.343,3-3v-8c0-1.657-1.343-3-3-3C18,3.686,15.314,1,12,1L12,1z M8,7 c0-2.209,1.791-4,4-4s4,1.791,4,4H8L8,7z"></path><linearGradient id="gr3" x1="8.252" x2="15.75" y1="2.263" y2="9.761" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#fff" stopOpacity=".7"></stop><stop offset=".519" stopColor="#fff" stopOpacity=".45"></stop><stop offset="1" stopColor="#fff" stopOpacity=".55"></stop></linearGradient><path fill="url(#gr3)" d="M8,7c0-2.209,1.791-4,4-4s4,1.791,4,4	v0.506l2,0.005V7c0-3.314-2.686-6-6-6S6,3.686,6,7v0.506l2,0.005V7z"></path><linearGradient id="gr4" x1="10.586" x2="13.414" y1="12.586" y2="15.414" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#fff" stopOpacity=".7"></stop><stop offset=".519" stopColor="#fff" stopOpacity=".45"></stop><stop offset="1" stopColor="#fff" stopOpacity=".55"></stop></linearGradient><path fill="url(#gr4)" d="M12,12c-1.105,0-2,0.895-2,2s0.895,2,2,2	s2-0.895,2-2S13.105,12,12,12z"></path>
    </svg>
);

const PaperPlaneIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256">
        <g fill="#ffffff" fillRule="nonzero" stroke="none" strokeWidth="1" strokeLinecap="butt" strokeLinejoin="miter" strokeMiterlimit="10" strokeDasharray="" strokeDashoffset="0" fontFamily="none" fontWeight="none" fontSize="none" textAnchor="none" style={{ mixBlendMode: 'normal' }}>
            <g transform="scale(5.12,5.12)">
                <path d="M48.90625,0c-0.13281,0.01563 -0.25781,0.05859 -0.375,0.125l-48,26c-0.34766,0.1875 -0.55078,0.5625 -0.51953,0.95703c0.03516,0.39453 0.30078,0.73047 0.67578,0.85547l13.625,4.46875l-1.3125,13.5c-0.05469,0.4375 0.1875,0.85938 0.59375,1.03516c0.40625,0.17578 0.87891,0.05859 1.15625,-0.28516l8.59375,-9.71875l12.96875,12.78125c0.25391,0.25 0.62109,0.34375 0.96484,0.24609c0.34375,-0.09766 0.60547,-0.36719 0.69141,-0.71484l12,-48c0.08984,-0.31641 0.01172,-0.65625 -0.19922,-0.90625c-0.21484,-0.25 -0.53516,-0.37891 -0.86328,-0.34375zM47.46875,2.9375l-11.03125,44.125l-11.84375,-11.6875l17.21875,-23.78125c0.37891,-0.39844 0.36719,-1.02734 -0.03125,-1.40625c-0.39844,-0.37891 -1.02734,-0.36719 -1.40625,0.03125l-25.15625,20.375l-11.71875,-3.8125zM35.78125,16.5l-13.125,18.21875c-0.03516,0.03906 -0.06641,0.08203 -0.09375,0.125l-0.0625,0.0625c-0.02344,0.03125 -0.04297,0.0625 -0.0625,0.09375l-7.15625,8.03125l1.0625,-10.8125z"></path>
            </g>
        </g>
    </svg>
);

export default function GameRoom({ socket, roomId, playerName, initialData }) {
    const [gameStatus, setGameStatus] = useState('picking'); // picking, playing, finished
    const [letters, setLetters] = useState({ start: null, end: null });
    const [pickerRoles, setPickerRoles] = useState(initialData.pickerRoles);
    const [word, setWord] = useState('');
    const [result, setResult] = useState(null); // { winner: name, word: string }
    const [opponentTyping, setOpponentTyping] = useState(false);
    // Track if opponent has picked their letter (blind pick)
    const [opponentPicked, setOpponentPicked] = useState({ start: false, end: false });
    const [skipData, setSkipData] = useState({ votes: 0, myVote: false });
    const [scores, setScores] = useState({ me: 0, opponent: 0 });
    const [streaks, setStreaks] = useState({ me: 0, opponent: 0 });
    const [myRole, setMyRole] = useState(null); // 'start_picker' | 'end_picker'

    useEffect(() => {
        // Determine my role based on socket.id
        if (socket.id === pickerRoles.start) setMyRole('start_picker');
        else if (socket.id === pickerRoles.end) setMyRole('end_picker');

        // Listeners
        socket.on('letter_picked', ({ type, letter }) => {
            // My pick (revealed to me)
            setLetters(prev => ({ ...prev, [type]: letter }));
        });

        socket.on('opponent_picked', ({ type }) => {
            // Opponent pick (hidden, show indicator)
            setOpponentPicked(prev => ({ ...prev, [type]: true }));
        });

        socket.on('race_start', ({ start, end }) => {
            setLetters({ start, end });
            // Reset hidden flags (not strictly necessary as we switched to playing mode, but good for cleanup)
            setOpponentPicked({ start: true, end: true });
            setGameStatus('playing');
            setWord(start); // Pre-fill start letter
            // Focus input logic handled by autoFocus
        });

        socket.on('opponent_typing', ({ isTyping }) => {
            setOpponentTyping(isTyping);
        });

        socket.on('round_over', (data) => {
            setResult(data);
            setGameStatus('finished');

            // Update local scores/streaks
            const myScore = data.scores[socket.id] || 0;
            const opScore = Object.entries(data.scores).find(([id]) => id !== socket.id)?.[1] || 0;
            setScores({ me: myScore, opponent: opScore });

            const myStreak = data.streaks[socket.id] || 0;
            const opStreak = Object.entries(data.streaks).find(([id]) => id !== socket.id)?.[1] || 0;
            setStreaks({ me: myStreak, opponent: opStreak });

            if (data.winner === playerName) {
                toast.success(`🎉 YOU WON! (+${data.pointsEarned})`);
            } else {
                toast.error('💀 You lost!');
            }
        });

        socket.on('validation_fail', ({ reason }) => {
            toast.error(reason || 'Invalid word!');
            // Shake animation logic could be added here
        });

        socket.on('next_round_started', (data) => {
            setResult(null);
            setWord('');
            setLetters({ start: null, end: null });
            setGameStatus('picking');
            setSkipData({ votes: 0, myVote: false });
            setOpponentPicked({ start: false, end: false });
            setPickerRoles(data.pickerRoles);

            // Update role
            if (socket.id === data.pickerRoles.start) setMyRole('start_picker');
            else if (socket.id === data.pickerRoles.end) setMyRole('end_picker');

            toast.success('Next Round Started!');
        });

        socket.on('skip_update', ({ votes, voter }) => {
            const isMe = voter === socket.id;
            setSkipData(prev => ({
                votes,
                myVote: isMe ? true : prev.myVote
            }));
            if (voter !== socket.id) toast('Opponent voted to skip!', { icon: '⏭️' });
        });

        socket.on('round_skipped', (data) => {
            setResult(null);
            setWord('');
            setLetters({ start: null, end: null });
            setGameStatus('picking');
            setSkipData({ votes: 0, myVote: false });
            setOpponentPicked({ start: false, end: false });
            setPickerRoles(data.pickerRoles);

            // Sync role
            if (socket.id === data.pickerRoles.start) setMyRole('start_picker');
            else if (socket.id === data.pickerRoles.end) setMyRole('end_picker');

            toast.success('Round SKIPPED! New letters.');
        });

        return () => {
            socket.off('letter_picked');
            socket.off('race_start');
            socket.off('opponent_typing');
            socket.off('round_over');
            socket.off('validation_fail');
            socket.off('next_round_started');
            socket.off('skip_update');
            socket.off('round_skipped');
        };
    }, [socket, pickerRoles, playerName]);

    // Typing emitter
    const handleTyping = (e) => {
        const val = e.target.value.toUpperCase();

        // Enforce start letter
        if (gameStatus === 'playing' && letters.start && !val.startsWith(letters.start)) {
            return; // Prevent deleting start letter
        }

        setWord(val);
        socket.emit('typing_status', { isTyping: val.length > 1 });
    };

    const handleSkip = () => {
        if (!skipData.myVote) {
            socket.emit('vote_skip');
            setSkipData(prev => ({ ...prev, myVote: true }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (gameStatus !== 'playing') return;
        socket.emit('submit_word', { word });
    };

    const handlePick = (letter) => {
        if (myRole === 'start_picker' && !letters.start) {
            socket.emit('pick_letter', { type: 'start', letter });
        } else if (myRole === 'end_picker' && !letters.end) {
            socket.emit('pick_letter', { type: 'end', letter });
        }
    };

    const handleNextRound = () => {
        socket.emit('request_next_round');
    };

    return (
        <div className="w-full max-w-4xl mx-auto">
            {/* Category Header */}
            <div className="text-center mb-4">
                <span className="inline-block px-4 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/50 text-indigo-300 text-sm font-bold tracking-wider">
                    CATEGORY: {initialData.category || "General"}
                </span>
            </div>

            {/* Top Bar: Players */}
            <div className="flex justify-between items-center bg-white/5 backdrop-blur-md p-4 rounded-xl mb-6 border border-white/5">
                <div className="flex flex-col items-start">
                    <span className="text-xs text-slate-400 uppercase tracking-widest">You</span>
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-white">{playerName}</span>
                        {streaks.me > 1 && <span className="text-orange-500 font-black animate-pulse">🔥{streaks.me}x</span>}
                    </div>
                    <span className="text-sm font-bold text-indigo-400">{scores.me} pts</span>
                </div>
                <div className="text-2xl font-mono text-slate-500">VS</div>
                <div className="flex flex-col items-end">
                    <span className="text-xs text-slate-400 uppercase tracking-widest">
                        {opponentTyping ? 'Typing...' : 'Opponent'}
                    </span>
                    <div className="flex items-center gap-2">
                        {streaks.opponent > 1 && <span className="text-orange-500 font-black animate-pulse">🔥{streaks.opponent}x</span>}
                        <span className="text-xl font-bold text-indigo-300">
                            {Object.values(initialData.players).find(n => n !== playerName)}
                        </span>
                    </div>
                    <span className="text-sm font-bold text-slate-400">{scores.opponent} pts</span>
                </div>
            </div>

            <AnimatePresence mode='wait'>
                {/* PICKING PHASE */}
                {gameStatus === 'picking' && (
                    <motion.div
                        key="picking"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        className="bg-slate-800/50 p-6 md:p-8 rounded-2xl border border-slate-700 backdrop-blur-sm"
                    >
                        <h2 className="text-center text-2xl font-bold mb-6 md:mb-8">
                            {(myRole === 'start_picker' && !letters.start) ? 'Choose START Letter' :
                                (myRole === 'end_picker' && !letters.end) ? 'Choose END Letter' :
                                    'Waiting for opponent...'}
                        </h2>

                        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
                            {/* Left: Status Boxes */}
                            <div className="flex md:flex-col gap-6 md:gap-8 justify-center w-full md:w-auto shrink-0">
                                <div className={clsx("p-4 rounded-xl border-2 text-center w-24 md:w-32 transition-all mx-auto",
                                    letters.start ? "border-green-500 bg-green-500/20" :
                                        opponentPicked.start ? "border-gray-500 bg-gray-500/10 animate-pulse" : "border-indigo-500/30 bg-indigo-500/10")}>
                                    <div className="text-xs text-slate-400 mb-1">START</div>
                                    <div className="text-4xl md:text-5xl font-black">
                                        {letters.start || (opponentPicked.start ? <LockIcon /> : '?')}
                                    </div>
                                </div>
                                <div className={clsx("p-4 rounded-xl border-2 text-center w-24 md:w-32 transition-all mx-auto",
                                    letters.end ? "border-green-500 bg-green-500/20" :
                                        opponentPicked.end ? "border-greyy-500 bg-greyy-500/10 animate-pulse" : "border-pink-500/30 bg-pink-500/10")}>
                                    <div className="text-xs text-slate-400 mb-1">END</div>
                                    <div className="text-4xl md:text-5xl font-black">
                                        {letters.end || (opponentPicked.end ? <LockIcon /> : '?')}
                                    </div>
                                </div>
                            </div>

                            {/* Right: Alphabet Grid */}
                            <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-7 lg:grid-cols-8 gap-2 sm:gap-3 w-full">
                                {ALPHABET.map(char => {
                                    const isMyTurn = (myRole === 'start_picker' && !letters.start) || (myRole === 'end_picker' && !letters.end);
                                    const isSelected = char === letters.start || char === letters.end;

                                    return (
                                        <button
                                            key={char}
                                            disabled={!isMyTurn || isSelected}
                                            onClick={() => handlePick(char)}
                                            className={clsx("aspect-square rounded-lg font-bold text-lg md:text-xl transition-all touch-manipulation",
                                                isSelected ? "bg-white text-slate-900 scale-110 shadow-[0_0_15px_rgba(255,255,255,0.5)]" :
                                                    isMyTurn ? "bg-slate-700 hover:bg-indigo-600 text-white active:scale-95" : "bg-slate-800 text-slate-600 cursor-not-allowed"
                                            )}
                                        >
                                            {char}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* PLAYING PHASE */}
                {gameStatus === 'playing' && (
                    <motion.div
                        key="playing"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center"
                    >
                        <div className="mb-6 sm:mb-8 flex justify-center items-center gap-2 sm:gap-4">
                            <div className="text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400">
                                {letters.start}
                            </div>
                            <div className="w-16 sm:w-full h-1 bg-slate-700 rounded-full max-w-[50px] sm:max-w-[100px] relative overflow-hidden">
                                <div className="absolute inset-0 bg-indigo-500/50 animate-pulse"></div>
                            </div>
                            <div className="text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400">
                                {letters.end}
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="relative max-w-lg mx-auto">
                            <input
                                autoFocus
                                type="text"
                                value={word}
                                onChange={handleTyping}
                                className="w-full bg-slate-800/80 border-2 border-indigo-500/50 rounded-2xl py-4 sm:py-6 px-4 sm:px-8 text-center text-2xl sm:text-3xl md:text-5xl font-bold tracking-wider focus:outline-none focus:border-indigo-400 focus:shadow-[0_0_30px_rgba(99,102,241,0.3)] transition-all uppercase"
                                placeholder={`${letters.start}...${letters.end}`}
                            />
                            <button
                                type="submit"
                                className="absolute right-4 top-1/2 -translate-y-1/2 bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-500 transition-colors"
                            >
                                <PaperPlaneIcon />
                            </button>
                        </form>

                        <div className="mt-6 flex justify-center">
                            <button
                                onClick={handleSkip}
                                disabled={skipData.myVote}
                                className={clsx(
                                    "text-sm font-bold py-2 px-4 rounded-full border transition-all flex items-center gap-2",
                                    skipData.myVote
                                        ? "bg-slate-700 text-slate-400 border-slate-600"
                                        : "bg-slate-800/50 text-slate-300 border-slate-600 hover:bg-white/10 hover:border-white/30"
                                )}
                            >
                                {skipData.myVote ? 'Wait for Opponent...' : '🏳️ Give Up / Skip Round'}
                                {skipData.votes > 0 && <span className="bg-white/20 px-2 rounded text-xs">{skipData.votes}/2</span>}
                            </button>
                        </div>

                        <p className="mt-4 text-slate-400 animate-pulse">Type a word starting with {letters.start} and ending with {letters.end}!</p>
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
                            {result.winner === playerName ? '🏆' : '💀'}
                        </div>
                        <h2 className="text-4xl font-black mb-2 uppercase">
                            {result.winner === playerName ? 'Menang!' : 'Kalah!'}
                        </h2>
                        <div className="bg-slate-900/50 p-4 rounded-xl mb-8">
                            <p className="text-slate-400 text-sm mb-1">Kata Benar</p>
                            <p className="text-3xl font-bold text-green-400 tracking-wider">
                                {result.word}
                            </p>
                            <p className="text-xs text-slate-500 mt-2 italic border-t border-slate-800 pt-2">
                                {result.reason}
                            </p>
                        </div>

                        <button
                            onClick={handleNextRound}
                            className="bg-white text-slate-900 font-bold py-3 px-8 rounded-full hover:scale-105 active:scale-95 transition-transform shadow-lg hover:shadow-white/20"
                        >
                            Last Round? Next! ➡️
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
