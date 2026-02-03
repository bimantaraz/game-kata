import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { toast } from 'react-hot-toast';

export default function Lobby({ rooms = [], gameMode, onCreate, onJoinRoom, onBack }) {
    const [name, setName] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('General');
    const [turnDuration, setTurnDuration] = useState(10);
    const [keepHistory, setKeepHistory] = useState(false); // Added State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [joiningRoomId, setJoiningRoomId] = useState(null);

    const CATEGORIES = ["General", "Noun (Kata Benda)", "Verb (Kata Kerja)", "Adjective (Sifat)", "Animal (Hewan)", "Food (Makanan)", "Country (Negara)"];

    const handleCreate = (e) => {
        e.preventDefault();
        if (!name.trim()) return toast.error('Name is required!');
        onCreate(name, selectedCategory, turnDuration, keepHistory);
    };

    const handleJoin = (e) => {
        e.preventDefault();
        console.log("Join clicked", name, joiningRoomId);
        if (!name.trim()) return toast.error('Name is required!');
        onJoinRoom(name, joiningRoomId);
    };

    return (
        <div className="w-full max-w-5xl mx-auto p-4">
            {/* Header & Create Button */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0 mb-8 bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/5 shadow-2xl text-center md:text-left relative">
                <button
                    onClick={onBack}
                    className="absolute top-4 left-4 md:static md:mr-6 text-slate-400 hover:text-white transition-colors flex items-center gap-1"
                >
                    ← Back
                </button>

                <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="flex-1"
                >
                    <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400 uppercase">
                        {gameMode === 'race' ? 'Tebak Kata' : 'Lanjut Kata'}
                    </h1>
                    <p className="text-slate-400">{gameMode === 'race' ? 'Race against time!' : 'Chain reaction duel!'}</p>
                </motion.div>

                <motion.button
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsCreateModalOpen(true)}
                    className="w-full md:w-auto bg-indigo-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-indigo-500/30 hover:bg-indigo-500 transition-all flex items-center justify-center gap-2"
                >
                    <span className="text-xl">+</span> CREATE ROOM
                </motion.button>
            </div>

            {/* Room List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rooms.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="col-span-full text-center py-20 text-slate-500 border-2 border-dashed border-slate-700 rounded-3xl"
                    >
                        <div className="text-6xl mb-4">💤</div>
                        <p className="text-xl">No rooms available for {gameMode}.</p>
                        <p className="text-sm">Be the first to create one!</p>
                    </motion.div>
                ) : (
                    rooms.map((room, i) => (
                        <motion.div
                            key={room.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 p-6 rounded-2xl hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/10 transition-all group"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="bg-indigo-500/20 text-indigo-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                                    {room.category}
                                </div>
                                <div className="text-slate-500 text-xs font-mono">#{room.id}</div>
                            </div>

                            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">
                                {room.host}'s Room
                            </h3>

                            {gameMode === 'lanjut' && room.turnDuration && (
                                <div className="text-xs text-slate-400 mb-4 bg-slate-900/50 inline-block px-2 py-1 rounded">
                                    ⏱️ {room.turnDuration}s Turn
                                </div>
                            )}

                            <div className="flex justify-between items-center mt-6">
                                <span className="text-slate-400 text-sm flex items-center gap-1">
                                    👤 {room.players}/2
                                </span>
                                <button
                                    onClick={() => setJoiningRoomId(room.id)}
                                    className="bg-white text-slate-900 font-bold py-2 px-6 rounded-lg hover:bg-indigo-50 transition-colors"
                                >
                                    JOIN
                                </button>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Create Room Modal */}
            <AnimatePresence>
                {isCreateModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
                            onClick={() => setIsCreateModalOpen(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-slate-800 border border-slate-700 p-8 rounded-3xl w-full max-w-md relative z-10 shadow-2xl"
                        >
                            <h2 className="text-3xl font-bold mb-6 text-center">Create {gameMode === 'race' ? 'Race' : 'Duel'} Room</h2>
                            <form onSubmit={handleCreate} className="space-y-4">
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1">Your Name</label>
                                    <input
                                        autoFocus
                                        type="text"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        maxLength={12}
                                        className="w-full bg-slate-900 border border-slate-600 rounded-xl p-3 focus:outline-none focus:border-indigo-500"
                                        placeholder="Enter your name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1">Category</label>
                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                            className="w-full bg-slate-900 border border-slate-600 rounded-xl p-3 flex justify-between items-center text-left focus:outline-none focus:border-indigo-500 transition-colors"
                                        >
                                            <span className={clsx(!selectedCategory && "text-slate-400")}>
                                                {selectedCategory}
                                            </span>
                                            <span className="text-slate-400 text-xs">▼</span>
                                        </button>

                                        <AnimatePresence>
                                            {isDropdownOpen && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    className="absolute z-50 w-full mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-xl max-h-60 overflow-y-auto overflow-x-hidden custom-scrollbar"
                                                >
                                                    {CATEGORIES.map((cat) => (
                                                        <button
                                                            key={cat}
                                                            type="button"
                                                            onClick={() => {
                                                                setSelectedCategory(cat);
                                                                setIsDropdownOpen(false);
                                                            }}
                                                            className="w-full text-left px-4 py-3 hover:bg-slate-700 text-sm border-b border-slate-700/50 last:border-0 transition-colors flex items-center gap-2"
                                                        >
                                                            {cat === selectedCategory && <span className="text-indigo-400">✓</span>}
                                                            <span className={clsx(cat === selectedCategory ? "text-white font-bold" : "text-slate-300")}>
                                                                {cat}
                                                            </span>
                                                        </button>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                {gameMode === 'lanjut' && (
                                    <div className="space-y-3">
                                        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                                            <label className="block text-sm text-slate-400 mb-2 flex justify-between">
                                                <span>Turn Timer</span>
                                                <span className="font-bold text-white">{turnDuration}s</span>
                                            </label>
                                            <input
                                                type="range"
                                                min="5"
                                                max="60"
                                                step="5"
                                                value={turnDuration}
                                                onChange={(e) => setTurnDuration(parseInt(e.target.value))}
                                                className="w-full accent-indigo-500"
                                            />
                                            <div className="flex justify-between text-xs text-slate-500 mt-1">
                                                <span>5s</span>
                                                <span>60s</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                                            <input
                                                type="checkbox"
                                                id="keepHistory"
                                                checked={keepHistory}
                                                onChange={(e) => setKeepHistory(e.target.checked)}
                                                className="w-5 h-5 accent-indigo-500 rounded focus:ring-indigo-500 focus:ring-2 bg-slate-700 border-slate-600"
                                            />
                                            <label htmlFor="keepHistory" className="text-sm text-slate-300 cursor-pointer select-none">
                                                Keep History on Rematch
                                                <div className="text-xs text-slate-500 mt-0.5">Don't reset used words in new rounds</div>
                                            </label>
                                        </div>
                                    </div>
                                )}

                                <button
                                    disabled={!name.trim()}
                                    type="submit"
                                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl mt-4 transition-colors disabled:opacity-50"
                                >
                                    CREATE & START
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Join Room Modal */}
            <AnimatePresence>
                {joiningRoomId && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
                            onClick={() => setJoiningRoomId(null)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-slate-800 border border-slate-700 p-8 rounded-3xl w-full max-w-md relative z-10 shadow-2xl"
                        >
                            <h2 className="text-3xl font-bold mb-2 text-center">Join Room</h2>
                            <p className="text-center text-slate-400 mb-6 font-mono text-xs">ID: {joiningRoomId}</p>

                            <form onSubmit={handleJoin} className="space-y-4">
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1">Your Name</label>
                                    <input
                                        autoFocus
                                        type="text"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        maxLength={12}
                                        className="w-full bg-slate-900 border border-slate-600 rounded-xl p-3 focus:outline-none focus:border-indigo-500"
                                        placeholder="Enter your name"
                                    />
                                </div>
                                <button
                                    disabled={!name.trim()}
                                    type="submit"
                                    className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl mt-4 transition-colors disabled:opacity-50"
                                >
                                    ENTER GAME
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
