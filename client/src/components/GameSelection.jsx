import { motion } from 'framer-motion';

export default function GameSelection({ onSelectMode }) {
    return (
        <div className="w-full max-w-5xl mx-auto p-4 flex flex-col items-center justify-center min-h-[80vh]">
            <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12"
            >
                <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 mb-4 drop-shadow-2xl">
                    GAME KATA
                </h1>
                <p className="text-slate-400 text-xl font-light tracking-widest uppercase">
                    Choose Your Arena
                </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
                {/* RACE MODE CARD */}
                <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-3xl p-8 hover:border-indigo-500/50 hover:bg-slate-800/80 transition-all cursor-pointer group shadow-2xl relative overflow-hidden"
                    onClick={() => onSelectMode('race')}
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <svg className="w-40 h-40" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M13.5 2c-5.621 0-10.211 4.443-10.475 10h-3.025l5 6.625 5-6.625h-2.975c.257-3.351 3.06-6 6.475-6 3.584 0 6.5 2.916 6.5 6.5s-2.916 6.5-6.5 6.5c-1.863 0-3.542-.793-4.728-2.053l-2.427 3.216c1.877 1.754 4.389 2.837 7.155 2.837 5.79 0 10.5-4.71 10.5-10.5s-4.71-10.5-10.5-10.5z" />
                        </svg>
                    </div>

                    <div className="relative z-10">
                        <div className="inline-block p-4 bg-indigo-500/20 rounded-2xl mb-6 text-indigo-400 group-hover:scale-110 transition-transform duration-300">
                            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <h3 className="text-3xl font-black text-white mb-2 tracking-tight group-hover:text-indigo-400 transition-colors">
                            TEBAK KATA
                        </h3>
                        <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                            Race against time! Find a word that starts with <span className="text-white font-bold">A</span> and ends with <span className="text-white font-bold">B</span>.
                        </p>
                        <button className="w-full py-4 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl font-bold text-white shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/50 transition-all">
                            PLAY RACE
                        </button>
                    </div>
                </motion.div>

                {/* LANJUT KATA CARD */}
                <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-3xl p-8 hover:border-pink-500/50 hover:bg-slate-800/80 transition-all cursor-pointer group shadow-2xl relative overflow-hidden"
                    onClick={() => onSelectMode('lanjut')}
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <svg className="w-40 h-40" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M7 7h10v3l5-5-5-5v3h-12v6h2v-2zm10 10h-10v-3l-5 5 5 5v-3h12v-6h-2v2z" />
                        </svg>
                    </div>

                    <div className="relative z-10">
                        <div className="inline-block p-4 bg-pink-500/20 rounded-2xl mb-6 text-pink-400 group-hover:scale-110 transition-transform duration-300">
                            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                            </svg>
                        </div>
                        <h3 className="text-3xl font-black text-white mb-2 tracking-tight group-hover:text-pink-400 transition-colors">
                            LANJUT KATA
                        </h3>
                        <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                            Turn-based duel! Your word must start with the <span className="text-white font-bold">Last Letter</span> of your opponent's word.
                        </p>
                        <button className="w-full py-4 bg-gradient-to-r from-pink-600 to-rose-600 rounded-xl font-bold text-white shadow-lg shadow-pink-500/25 group-hover:shadow-pink-500/50 transition-all">
                            PLAY DUEL
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
