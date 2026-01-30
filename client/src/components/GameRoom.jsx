import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { toast } from 'react-hot-toast';

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');

export default function GameRoom({ socket, roomId, playerName, initialData }) {
    const [gameStatus, setGameStatus] = useState('picking'); // picking, playing, finished
    const [letters, setLetters] = useState({ start: null, end: null });
    const [pickerRoles, setPickerRoles] = useState(initialData.pickerRoles);
    const [word, setWord] = useState('');
    const [result, setResult] = useState(null); // { winner: name, word: string }
    const [opponentTyping, setOpponentTyping] = useState(false);
    const [myRole, setMyRole] = useState(null); // 'start_picker' | 'end_picker'

    useEffect(() => {
        // Determine my role based on socket.id
        if (socket.id === pickerRoles.start) setMyRole('start_picker');
        else if (socket.id === pickerRoles.end) setMyRole('end_picker');

        // Listeners
        socket.on('letter_picked', ({ type, letter }) => {
            setLetters(prev => ({ ...prev, [type]: letter }));
        });

        socket.on('race_start', ({ start, end }) => {
            setLetters({ start, end });
            setGameStatus('playing');
            setWord(start); // Pre-fill start letter
            // Focus input logic handled by autoFocus
        });

        socket.on('opponent_typing', ({ isTyping }) => {
            setOpponentTyping(isTyping);
        });

        socket.on('game_over', (data) => {
            setResult(data);
            setGameStatus('finished');
            if (data.winner === playerName) {
                toast.success('🎉 YOU WON!');
            } else {
                toast.error('💀 You lost!');
            }
        });

        socket.on('validation_fail', ({ reason }) => {
            toast.error(reason || 'Invalid word!');
            // Shake animation logic could be added here
        });

        socket.on('rematch_started', (data) => {
            setResult(null);
            setWord('');
            setLetters({ start: null, end: null });
            setGameStatus('picking');
            setPickerRoles(data.pickerRoles);

            // Update role
            if (socket.id === data.pickerRoles.start) setMyRole('start_picker');
            else if (socket.id === data.pickerRoles.end) setMyRole('end_picker');

            toast.success('Rematch started! Roles swapped.');
        });

        return () => {
            socket.off('letter_picked');
            socket.off('race_start');
            socket.off('opponent_typing');
            socket.off('game_over');
            socket.off('validation_fail');
            socket.off('rematch_started');
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

    const handleRematch = () => {
        socket.emit('request_rematch');
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
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
                    <span className="text-xl font-bold text-white">{playerName}</span>
                </div>
                <div className="text-2xl font-mono text-slate-500">VS</div>
                <div className="flex flex-col items-end">
                    <span className="text-xs text-slate-400 uppercase tracking-widest">
                        {opponentTyping ? 'Typing...' : 'Opponent'}
                    </span>
                    <span className="text-xl font-bold text-indigo-300">
                        {Object.values(initialData.players).find(n => n !== playerName)}
                    </span>
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
                        className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 backdrop-blur-sm"
                    >
                        <h2 className="text-center text-2xl font-bold mb-6">
                            {(myRole === 'start_picker' && !letters.start) ? 'Choose START Letter' :
                                (myRole === 'end_picker' && !letters.end) ? 'Choose END Letter' :
                                    'Waiting for opponent...'}
                        </h2>

                        <div className="flex justify-center gap-8 mb-8">
                            <div className={clsx("p-4 rounded-xl border-2 text-center w-24 transition-all",
                                letters.start ? "border-green-500 bg-green-500/20" : "border-indigo-500/30 bg-indigo-500/10")}>
                                <div className="text-xs text-slate-400 mb-1">START</div>
                                <div className="text-4xl font-black">{letters.start || '?'}</div>
                            </div>
                            <div className={clsx("p-4 rounded-xl border-2 text-center w-24 transition-all",
                                letters.end ? "border-green-500 bg-green-500/20" : "border-pink-500/30 bg-pink-500/10")}>
                                <div className="text-xs text-slate-400 mb-1">END</div>
                                <div className="text-4xl font-black">{letters.end || '?'}</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-5 sm:grid-cols-6 gap-2 sm:gap-3">
                            {ALPHABET.map(char => {
                                const isMyTurn = (myRole === 'start_picker' && !letters.start) || (myRole === 'end_picker' && !letters.end);
                                const isSelected = char === letters.start || char === letters.end;

                                return (
                                    <button
                                        key={char}
                                        disabled={!isMyTurn || isSelected}
                                        onClick={() => handlePick(char)}
                                        className={clsx("aspect-square rounded-lg font-bold text-lg transition-all touch-manipulation",
                                            isSelected ? "bg-white text-slate-900 scale-110 shadow-[0_0_15px_rgba(255,255,255,0.5)]" :
                                                isMyTurn ? "bg-slate-700 hover:bg-indigo-600 text-white active:scale-95" : "bg-slate-800 text-slate-600 cursor-not-allowed"
                                        )}
                                    >
                                        {char}
                                    </button>
                                );
                            })}
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
                                🚀
                            </button>
                        </form>
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
                            {result.winner === playerName ? 'VICTORY!' : 'DEFEAT'}
                        </h2>
                        <div className="bg-slate-900/50 p-4 rounded-xl mb-8">
                            <p className="text-slate-400 text-sm mb-1">Winning Word</p>
                            <p className="text-3xl font-bold text-green-400 tracking-wider">
                                {result.word}
                            </p>
                            <p className="text-xs text-slate-500 mt-2 italic border-t border-slate-800 pt-2">
                                {result.reason}
                            </p>
                        </div>

                        <button
                            onClick={handleRematch}
                            className="bg-white text-slate-900 font-bold py-3 px-8 rounded-full hover:scale-105 active:scale-95 transition-transform shadow-lg hover:shadow-white/20"
                        >
                            Rematch 🔄
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
