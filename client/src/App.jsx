import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Toaster, toast } from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import Lobby from './components/Lobby';
import GameRoom from './components/GameRoom';

// Connect to backend
const SERVER_URL = import.meta.env.VITE_SERVER_URL || (window.location.hostname === 'localhost' ? 'http://localhost:3001' : '/');

// Session ID logic
const getSessionId = () => {
  let id = localStorage.getItem('sessionId');
  if (!id) {
    id = Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem('sessionId', id);
  }
  return id;
};
const sessionId = getSessionId();

const socket = io(SERVER_URL, {
  auth: { sessionId }
});

function App() {
  const [gameState, setGameState] = useState('LOBBY'); // LOBBY, WAITING, PLAYING
  const [roomId, setRoomId] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [roomData, setRoomData] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
      // We don't reset to LOBBY here anymore because we might be reconnecting to a session
    });

    socket.on('reconnect_success', ({ roomId, roomData }) => {
      console.log('Session restored:', roomId);
      setIsConnected(true);
      setRoomId(roomId);
      setRoomData(roomData);
      setPlayerName(roomData.players[sessionId]); // Restore my name
      // Map server status to app state
      if (roomData.status === 'waiting') {
        setGameState('WAITING');
      } else {
        setGameState('PLAYING');
      }
      toast.success('Reconnected to game!', { icon: '🔄' });
    });

    socket.on('disconnect', () => {
      console.log('Disconnected');
      setIsConnected(false);
    });

    socket.on('rooms_update', (updatedRooms) => {
      setRooms(updatedRooms);
    });

    socket.on('joined_room', ({ roomId, role }) => {
      setRoomId(roomId);
      setGameState('WAITING');
      toast.success('Room joined! Waiting for opponent...');
    });

    socket.on('game_start', (data) => {
      setRoomData(data);
      setRoomId(data.roomId);
      setGameState('PLAYING');
      toast.success('Game Started!');
    });

    socket.on('player_left', () => {
      toast.error('Opponent left the game.');
      setGameState('LOBBY');
      setRoomId(null);
      setRoomData(null);
    });

    return () => {
      socket.off('connect');
      socket.off('reconnect_success');
      socket.off('rooms_update');
      socket.off('joined_room');
      socket.off('game_start');
      socket.off('player_left');
    };
  }, []);

  const createRoom = (name, category) => {
    setPlayerName(name);
    socket.emit('create_room', { name, category });
  };

  const joinRoom = (name, roomId) => {
    setPlayerName(name);
    socket.emit('join_room', { name, roomId });
  };

  // Legacy/Quick Match
  const joinGame = (name, category) => {
    setPlayerName(name);
    socket.emit('join_game', { name, category });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 overflow-hidden relative">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>

      <Toaster position="top-center" toastOptions={{
        style: {
          background: '#1e293b',
          color: '#fff',
        }
      }} />

      {/* Connection Status Indicator */}
      {!isConnected && (
        <div className="fixed top-0 left-0 w-full bg-red-600/90 text-white text-center text-xs py-1 z-50 font-bold">
          🔌 DISCONNECTED - Trying to reconnect...
        </div>
      )}

      <div className="w-full max-w-7xl relative z-10">
        <AnimatePresence mode='wait'>
          {gameState === 'LOBBY' && (
            <motion.div
              key="lobby"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Lobby
                rooms={rooms}
                onCreate={createRoom}
                onJoinRoom={joinRoom}
              />
            </motion.div>
          )}

          {gameState === 'WAITING' && (
            <motion.div
              key="waiting"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="text-center bg-white/10 backdrop-blur-lg p-12 rounded-3xl border border-white/10 shadow-2xl"
            >
              <div className="animate-spin text-4xl mb-4">⏳</div>
              <h2 className="text-2xl font-bold mb-2">Waiting for Opponent...</h2>
              <p className="text-slate-300">Room ID: <span className="font-mono bg-white/10 px-2 py-1 rounded">{roomId}</span></p>
            </motion.div>
          )}

          {gameState === 'PLAYING' && roomData && (
            <motion.div
              key="game"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full"
            >
              <GameRoom
                socket={socket}
                roomId={roomId}
                playerName={playerName}
                sessionId={sessionId}
                initialData={roomData}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;
