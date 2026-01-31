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

const TrophyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 48 48" className="inline-block drop-shadow-xl">
        <radialGradient id="grad1" cx="23.943" cy="18.921" r="22.765" gradientUnits="userSpaceOnUse"><stop offset=".655" stopColor="#871233"></stop><stop offset=".718" stopColor="#8e1336"></stop><stop offset=".812" stopColor="#a3163e"></stop><stop offset=".9" stopColor="#bc1948"></stop></radialGradient><path fill="url(#grad1)" d="M34,27.765H14v18.234c0,0.777,0.848,1.257,1.514,0.857L24,41.765l8.486,5.091	c0.667,0.4,1.514-0.08,1.514-0.857V27.765z"></path><linearGradient id="grad2" x1="14.849" x2="33.078" y1="3.094" y2="34.778" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#ffda1c"></stop><stop offset="1" stopColor="#feb705"></stop></linearGradient><path fill="url(#grad2)" d="M41.035,17.294l-1.258-0.756c-0.536-0.322-0.898-0.851-1.062-1.454	c-0.004-0.011-0.005-0.022-0.009-0.034c-0.167-0.608-0.117-1.256,0.189-1.807l0.713-1.283c0.729-1.312-0.203-2.929-1.705-2.954	L36.422,8.98c-0.628-0.011-1.21-0.29-1.652-0.733c-0.005-0.005-0.009-0.009-0.014-0.014C34.31,7.79,34.033,7.207,34.022,6.58	l-0.025-1.481c-0.025-1.501-1.642-2.434-2.954-1.705L29.76,4.107c-0.553,0.306-1.199,0.356-1.807,0.189	c-0.011-0.004-0.022-0.005-0.034-0.009c-0.603-0.164-1.132-0.526-1.454-1.062l-0.756-1.258c-0.772-1.287-2.639-1.287-3.411,0	L21.546,3.22c-0.324,0.54-0.859,0.905-1.465,1.071c-0.007,0.002-0.013,0.004-0.02,0.005c-0.614,0.169-1.265,0.119-1.822-0.191	l-1.278-0.709c-1.312-0.729-2.929,0.203-2.954,1.705L13.98,6.58c-0.011,0.626-0.29,1.21-0.733,1.652	c-0.005,0.004-0.011,0.009-0.014,0.014c-0.443,0.445-1.026,0.722-1.652,0.733l-1.481,0.025c-1.501,0.025-2.434,1.64-1.705,2.954	l0.713,1.283c0.306,0.553,0.356,1.199,0.189,1.807c-0.005,0.011-0.007,0.023-0.011,0.034c-0.164,0.603-0.527,1.132-1.062,1.454	l-1.258,0.756c-1.287,0.772-1.287,2.639,0,3.411l1.258,0.756c0.536,0.322,0.898,0.851,1.062,1.454	c0.004,0.011,0.005,0.022,0.009,0.034c0.167,0.608,0.117,1.256-0.189,1.807l-0.713,1.283c-0.729,1.312,0.203,2.929,1.705,2.954	l1.481,0.025c0.628,0.011,1.21,0.29,1.652,0.733c0.005,0.005,0.009,0.009,0.014,0.014c0.445,0.443,0.722,1.026,0.733,1.652	l0.025,1.481c0.025,1.501,1.642,2.434,2.954,1.705l1.283-0.713c0.553-0.306,1.199-0.356,1.807-0.189	c0.011,0.004,0.023,0.005,0.034,0.009c0.603,0.164,1.132,0.526,1.454,1.062l0.756,1.258c0.772,1.287,2.639,1.287,3.411,0	l0.756-1.258c0.322-0.536,0.851-0.898,1.454-1.062c0.011-0.004,0.023-0.005,0.034-0.009c0.608-0.167,1.256-0.117,1.807,0.189	l1.283,0.713c1.312,0.729,2.929-0.203,2.954-1.705l0.025-1.481c0.011-0.628,0.29-1.21,0.733-1.652	c0.005-0.005,0.009-0.009,0.014-0.014c0.443-0.445,1.026-0.722,1.652-0.733l1.481-0.025c1.501-0.025,2.434-1.642,1.705-2.954	l-0.713-1.283c-0.306-0.553-0.356-1.199-0.189-1.807c0.004-0.011,0.005-0.022,0.009-0.034c0.164-0.603,0.526-1.132,1.062-1.454	l1.258-0.756C42.322,19.932,42.322,18.067,41.035,17.294z"></path><circle cx="24" cy="19" r="10" fill="none" stroke="#ffdf26" strokeMiterlimit="10" strokeWidth="2"></circle>
    </svg>
);

const SkullIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 48 48" className="inline-block drop-shadow-xl">
        <path fill="#e28b21" d="M37.5,13h-8c-3.033,0-5.5-2.468-5.5-5.5C24,6.121,25.122,5,26.5,5h14C41.878,5,43,6.121,43,7.5	C43,10.532,40.533,13,37.5,13z M26.5,7C26.224,7,26,7.225,26,7.5c0,1.93,1.57,3.5,3.5,3.5h8c1.93,0,3.5-1.57,3.5-3.5	C41,7.225,40.776,7,40.5,7H26.5z"></path><rect width="3" height="5.405" x="32" y="14.73" fill="#e28b21"></rect><path fill="#e89f25" d="M36.466,18.773L35,18h-3l-1.466,0.773C30.205,18.946,30,19.286,30,19.657v1.559h7v-1.559	C37,19.286,36.794,18.946,36.466,18.773z"></path><path fill="#e89f25" d="M33.452,15.811h0.095c3.011,0,5.452-2.441,5.452-5.452V3H28v7.358	C28,13.37,30.441,15.811,33.452,15.811z"></path><path fill="#95a2ac" d="M42,24.459v-2.23c0-1.233-0.952-2.23-2.125-2.23h-12.75C25.952,20,25,20.997,25,22.23v2.23L42,24.459	L42,24.459z"></path><path fill="#95a2ac" d="M10,33l1,4.27h14.784v-4.324L10,33z"></path><polygon fill="#d0d7db" points="42,23 42,44 11,44 11,36 25,36 25,23"></polygon><polygon fill="#f9ea4f" points="35.117,9.362 35.82,11.96 33.527,10.542 31.273,12 31.909,9.402 29.828,7.705 32.506,7.506 33.473,5 34.494,7.479 37.172,7.625"></polygon><circle cx="10" cy="12.5" r="4" fill="#ffb74d"></circle><path fill="#607d8b" d="M22.905,28.132l-2-9c-0.479-2.157-2.619-3.518-4.772-3.036c-2.157,0.479-3.516,2.615-3.037,4.772	L14.68,28H9.5c-1.012,0-1.465,0.583-2.104,1.272c-0.238,0.256-0.898,0.397-1.051,0.715C6.124,30.446,6,30.959,6,31.5v10	C6,42.881,7.119,44,8.5,44s2.5-1.119,2.5-2.5V33h8.5c0.65,0,1.237-0.254,1.682-0.661C22.535,31.454,23.276,29.804,22.905,28.132z"></path><path fill="#37474f" d="M19.96,19.39l-0.1,6.63c-0.03,1.76-1.14,3.4-2.84,3.85c-0.15,0.04-0.3,0.07-0.46,0.09l-7,1	C9.34,30.99,9.16,31,9,31c-0.56,0-1.08-0.11-1.56-0.32c-0.41-0.17-0.77-0.4-1.09-0.69c0.29-0.62,0.77-1.14,1.35-1.48l7.214-3.444	L19.96,19.39z"></path><path fill="#607d8b" d="M20,18.99V19c0,0.05,0,0.11-0.01,0.16c0,0.07-0.02,0.15-0.03,0.23c-0.01,0.05-0.03,0.1-0.04,0.16	l-2,7c-0.21,0.76-0.86,1.32-1.64,1.43l-7,1C9.19,28.99,9.09,29,9,29c-0.27,0-0.53-0.05-0.76-0.16c-0.2-0.08-0.38-0.19-0.54-0.33	c-0.36-0.29-0.61-0.73-0.68-1.23c-0.16-1.09,0.6-2.1,1.7-2.26l5.14-0.74l0.57-0.08l0.23-0.8l1.42-4.95c0.3-1.06,1.41-1.68,2.47-1.37	C19.42,17.33,20,18.13,20,18.99z"></path>
    </svg>
);

export default function GameRoom({ socket, roomId, playerName, sessionId, initialData }) {
    const [gameStatus, setGameStatus] = useState(initialData.status || 'picking'); // Support status from reconnect
    const [letters, setLetters] = useState(initialData.curLetters || { start: null, end: null });
    const [pickerRoles, setPickerRoles] = useState(initialData.pickerRoles);
    const [word, setWord] = useState('');
    const [result, setResult] = useState(null); // { winner: name, word: string }
    const [opponentTyping, setOpponentTyping] = useState(false);
    // Track if opponent has picked their letter (blind pick)
    const [opponentPicked, setOpponentPicked] = useState({ start: false, end: false });
    const [skipData, setSkipData] = useState({ votes: 0, myVote: false });
    const [scores, setScores] = useState(initialData.scores || { [sessionId]: 0 });
    const [streaks, setStreaks] = useState(initialData.streaks || { [sessionId]: 0 });
    const [history, setHistory] = useState(initialData.history || []);
    const [myRole, setMyRole] = useState(null); // 'start_picker' | 'end_picker'
    const [opponentOnline, setOpponentOnline] = useState(true);

    useEffect(() => {
        // Sync state from initialData (useful for reconnects)
        if (initialData.status) setGameStatus(initialData.status);
        if (initialData.curLetters) setLetters(initialData.curLetters);
        if (initialData.scores) setScores(initialData.scores);
        if (initialData.streaks) setStreaks(initialData.streaks);
        if (initialData.history) setHistory(initialData.history);

        // Determine my role based on sessionId
        if (sessionId === initialData.pickerRoles.start) setMyRole('start_picker');
        else if (sessionId === initialData.pickerRoles.end) setMyRole('end_picker');
    }, [initialData, sessionId]);

    useEffect(() => {
        // Update picker roles if they change
        if (pickerRoles) {
            if (sessionId === pickerRoles.start) setMyRole('start_picker');
            else if (sessionId === pickerRoles.end) setMyRole('end_picker');
        }
    }, [pickerRoles, sessionId]);

    useEffect(() => {
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

            setScores(data.scores);
            setStreaks(data.streaks);

            if (data.history) setHistory(data.history);

            if (data.winnerSessionId === sessionId) {
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

            toast.success('Next Round Started!');
        });

        socket.on('skip_update', ({ votes, voter }) => {
            const isMe = voter === sessionId;
            setSkipData(prev => ({
                votes,
                myVote: isMe ? true : prev.myVote
            }));
            if (voter !== sessionId) toast('Opponent voted to skip!', { icon: '⏭️' });
        });

        socket.on('round_skipped', (data) => {
            setResult(null);
            setWord('');
            setLetters({ start: null, end: null });
            setGameStatus('picking');
            setSkipData({ votes: 0, myVote: false });
            setOpponentPicked({ start: false, end: false });
            setPickerRoles(data.pickerRoles);

            toast.success('Round SKIPPED! New letters.');
        });

        socket.on('opponent_status', ({ online }) => {
            setOpponentOnline(online);
            if (!online) toast('Opponent disconnected...', { icon: '🔌' });
            else toast('Opponent reconnected!', { icon: '⚡' });
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
            socket.off('opponent_status');
        };
    }, [socket, sessionId]); // removed pickerRoles from deps to avoid double-triggers, logic moved to separate effect

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

    const myScore = scores[sessionId] || 0;
    const myStreak = streaks[sessionId] || 0;
    const opponentId = Object.keys(scores).find(id => id !== sessionId);
    const opponentScore = opponentId ? scores[opponentId] : 0;
    const opponentStreak = opponentId ? streaks[opponentId] : 0;
    const opponentName = Object.values(initialData.players).find(n => n !== playerName);

    return (
        <div className="w-full max-w-4xl mx-auto">
            {/* Category Header */}
            <div className="text-center mb-4">
                <span className="inline-block px-4 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/50 text-indigo-300 text-sm font-bold tracking-wider">
                    CATEGORY: {initialData.category || "General"}
                </span>
                {!opponentOnline && (
                    <div className="mt-2 text-red-400 font-bold animate-pulse text-sm border border-red-500/50 bg-red-500/10 rounded px-2 py-1 inline-block ml-2">
                        ⚠️ OPPONENT OFFLINE
                    </div>
                )}
            </div>

            {/* Top Bar: Players */}
            <div className="flex justify-between items-center bg-white/5 backdrop-blur-md p-4 rounded-xl mb-6 border border-white/5">
                <div className="flex flex-col items-start">
                    <span className="text-xs text-slate-400 uppercase tracking-widest">You</span>
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-white">{playerName}</span>
                        {myStreak > 1 && <span className="text-orange-500 font-black animate-pulse">🔥{myStreak}x</span>}
                    </div>
                    <span className="text-sm font-bold text-indigo-400">{myScore} Poin</span>
                </div>
                <div className="text-2xl font-mono text-slate-500">VS</div>
                <div className="flex flex-col items-end">
                    <span className="text-xs text-slate-400 uppercase tracking-widest">
                        {opponentTyping ? 'Typing...' : (opponentOnline ? 'Opponent' : 'Offline')}
                    </span>
                    <div className="flex items-center gap-2">
                        {opponentStreak > 1 && <span className="text-orange-500 font-black animate-pulse">🔥{opponentStreak}x</span>}
                        <span className={clsx("text-xl font-bold", opponentOnline ? "text-indigo-300" : "text-slate-500")}>
                            {opponentName}
                        </span>
                    </div>
                    <span className="text-sm font-bold text-slate-400">{opponentScore} Poin</span>
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
                                            disabled={!isMyTurn || isSelected || !opponentOnline}
                                            onClick={() => handlePick(char)}
                                            className={clsx("aspect-square rounded-lg font-bold text-lg md:text-xl transition-all touch-manipulation",
                                                isSelected ? "bg-white text-slate-900 scale-110 shadow-[0_0_15px_rgba(255,255,255,0.5)]" :
                                                    (isMyTurn && opponentOnline) ? "bg-slate-700 hover:bg-indigo-600 text-white active:scale-95" : "bg-slate-800 text-slate-600 cursor-not-allowed"
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
                                disabled={!opponentOnline}
                                className="w-full bg-slate-800/80 border-2 border-indigo-500/50 rounded-2xl py-4 sm:py-6 px-4 sm:px-8 text-center text-2xl sm:text-3xl md:text-5xl font-bold tracking-wider focus:outline-none focus:border-indigo-400 focus:shadow-[0_0_30px_rgba(99,102,241,0.3)] transition-all uppercase disabled:opacity-50"
                                placeholder={`${letters.start}...${letters.end}`}
                            />
                            <button
                                type="submit"
                                disabled={!opponentOnline}
                                className="absolute right-4 top-1/2 -translate-y-1/2 bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-500 transition-colors disabled:opacity-50"
                            >
                                <PaperPlaneIcon />
                            </button>
                        </form>

                        <div className="mt-6 flex justify-center">
                            <button
                                onClick={handleSkip}
                                disabled={skipData.myVote || !opponentOnline}
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
                            {result.winner === playerName ? <TrophyIcon /> : <SkullIcon />}
                        </div>
                        <h2 className="text-4xl font-black mb-2 uppercase">
                            {result.winner === playerName ? 'Menang!' : 'Kalah!'}
                        </h2>
                        <div className="bg-slate-900/50 p-4 rounded-xl mb-8">
                            <p className="text-slate-400 text-sm mb-1">{result.winner === playerName ? 'Anda' : 'Lawan'} Benar</p>
                            <p className="text-3xl font-bold text-green-400 tracking-wider">
                                {result.word}
                            </p>
                            <p className="text-xs text-slate-500 mt-2 italic border-t border-slate-800 pt-2">
                                {result.reason}
                            </p>
                        </div>

                        <button
                            onClick={handleNextRound}
                            disabled={!opponentOnline}
                            className="bg-white text-slate-900 font-bold py-3 px-8 rounded-full hover:scale-105 active:scale-95 transition-transform shadow-lg hover:shadow-white/20 disabled:opacity-50 disabled:scale-100"
                        >
                            Last Round? Next! ➡️
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
                            <div key={idx} className="bg-slate-800/80 px-4 py-2 rounded-lg border border-slate-700 flex items-center gap-2">
                                <span className="text-slate-500 text-xs font-mono">#{history.length - idx}</span>
                                <span className={clsx("text-xs font-bold px-1.5 py-0.5 rounded",
                                    entry.winner === playerName ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                                )}>
                                    {entry.winner === playerName ? 'YOU' : entry.winner}
                                </span>
                                <span className="font-mono font-bold text-white">{entry.word}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
