const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { validateWord } = require('./groq');
require('dotenv').config();

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all for dev, restrict in prod
        methods: ["GET", "POST"]
    },
    pingTimeout: 60000, // Increase heartbeat timeout to 60s
});

// Session Management
// Session ID -> { roomId, socketId, name, disconnectTimeout }
const sessions = new Map();
// Room ID -> { players: [sessId1, sessId2], playerNames: {sessId: name}, letters: {start: '', end: ''}, status: '...' }
const rooms = new Map();

function createRoomId() {
    return Math.random().toString(36).substring(2, 7).toUpperCase();
}

function broadcastRooms() {
    const roomList = [];
    for (const [id, room] of rooms.entries()) {
        if (room.status === 'waiting') {
            roomList.push({
                id: id,
                host: Object.values(room.playerNames)[0],
                category: room.category,
                gameMode: room.gameMode, // Added
                turnDuration: room.turnDuration, // Added
                players: room.players.length
            });
        }
    }
    io.emit('rooms_update', roomList);
}

// Middleware to extract/verify/create session ID
io.use((socket, next) => {
    const sessionId = socket.handshake.auth.sessionId;
    if (sessionId) {
        socket.sessionId = sessionId;
        return next();
    }
    // If no session ID, client should probably generate one, 
    // but we can reject or treat as transient. 
    // For now, accept but they won't have reconnection capability if they don't store it.
    socket.sessionId = socket.id; // Fallback (not recommended for reconnect)
    next();
});

io.on('connection', (socket) => {
    const sessionId = socket.sessionId;
    console.log(`User connected: ${socket.id} (Session: ${sessionId})`);

    // CHECK RECONNECTION
    if (sessions.has(sessionId)) {
        const session = sessions.get(sessionId);

        // If there was a pending delete timer, cancel it!
        if (session.disconnectTimeout) {
            console.log(`Cancelling disconnect timeout for session ${sessionId}`);
            clearTimeout(session.disconnectTimeout);
            session.disconnectTimeout = null;
        }

        // Update current socket ID
        session.socketId = socket.id;
        session.connected = true;

        // Re-join room if they were in one
        if (session.roomId) {
            const roomId = session.roomId;
            const room = rooms.get(roomId);

            if (room) {
                socket.join(roomId);
                console.log(`Session ${sessionId} restored to room ${roomId}`);

                // Notify user they are back
                // We need to send THEM the full state
                socket.emit('reconnect_success', {
                    roomId: roomId,
                    roomData: {
                        roomId: roomId,
                        players: room.playerNames,
                        category: room.category,
                        pickerRoles: {
                            start: room.players[0], // These are SessIDs now
                            end: room.players[1]
                        },
                        // We might need to send current letters/status if playing
                        curLetters: room.letters,
                        status: room.status,
                        history: room.history,
                        scores: room.scores,
                        streaks: room.streaks
                    }
                });

                // Notify opponent
                socket.to(roomId).emit('opponent_status', { online: true });

                // Also broadcast rooms in case they were host of a waiting room
                broadcastRooms();

                // If the game was paused or opponent was waiting, we just resume
            } else {
                // Room is gone (timed out?)
                session.roomId = null;
            }
        }
    } else {
        // New Session
        sessions.set(sessionId, {
            socketId: socket.id,
            roomId: null,
            name: null,
            connected: true
        });

        // Send current rooms to new connector
        broadcastRooms();
    }

    // HELPER: Get Session
    const getSession = () => sessions.get(socket.sessionId);

    // HELPER: Start Lanjut Kata Round
    const startLanjutRound = (room) => {
        // Stop any existing timer
        if (room.timer) {
            clearTimeout(room.timer);
            room.timer = null;
        }

        // Determine First Player (if new game) or Next Player
        // For simplicity, let's say "start" picker or "winner" goes first, or random.
        // Let's go with: Host starts first game, then Loser starts next? Or just alternate.
        if (!room.currentTurn) {
            room.currentTurn = room.players[0]; // Host starts
        }

        room.status = 'playing';
        room.letters = { start: null, end: null };
        room.usedWords = new Set();
        room.lastWord = null; // Reset for new round
        room.history = []; // Reset history for new round

        // Initial Word? Or first player picks it?
        // Let's say we provide a random starting letter or word?
        // "Player 1 menyebutkan kata 'ular'" -> implies P1 types anything.
        // So P1 has free reign? Or needs to start with a specific letter?
        // Let's allow P1 to start with ANY word for now.

        io.to(room.roomId).emit('game_start_lanjut', {
            roomId: room.roomId,
            players: room.playerNames,
            currentTurn: room.currentTurn,
            turnDuration: room.turnDuration,
            lastWord: null, // First turn has no last word
            scores: room.scores,
            category: room.category,
            gameMode: 'lanjut' // Added
        });

        // Start Timer
        startTurnTimer(room);
    };

    const startTurnTimer = (room) => {
        if (room.timer) clearTimeout(room.timer);

        const turnDurationMs = (room.turnDuration || 10) * 1000;
        const deadline = Date.now() + turnDurationMs;

        io.to(room.roomId).emit('turn_update', {
            currentTurn: room.currentTurn,
            deadline: deadline
        });

        room.timer = setTimeout(() => {
            handleTurnTimeout(room);
        }, turnDurationMs);
    };

    const handleTurnTimeout = (room) => {
        // Current turn player LOST
        const loserId = room.currentTurn;
        const winnerId = room.players.find(id => id !== loserId);

        finishLanjutRound(room, winnerId, "Time's up!");
    };

    const finishLanjutRound = (room, winnerId, reason) => {
        if (room.timer) clearTimeout(room.timer);
        room.status = 'finished';
        room.winner = room.playerNames[winnerId];

        room.scores[winnerId] = (room.scores[winnerId] || 0) + 1;
        // Reset streaks if we care, or maybe just +1 score.

        io.to(room.roomId).emit('round_over_lanjut', {
            winner: room.playerNames[winnerId],
            winnerSessionId: winnerId,
            reason: reason,
            scores: room.scores
        });

        room.currentTurn = null; // Reset for next interaction
        broadcastRooms();
    };


    socket.on('create_room', ({ name, category = "General", gameMode = "race", turnDuration = 10 }) => {
        const session = getSession();
        if (!session) return;

        session.name = name;
        const roomId = createRoomId();

        rooms.set(roomId, {
            roomId: roomId,
            players: [socket.sessionId],
            playerNames: { [socket.sessionId]: name },
            letters: { start: null, end: null }, // For Race
            status: 'waiting',
            winner: null,
            category: category,
            gameMode: gameMode, // 'race' | 'lanjut'
            turnDuration: parseInt(turnDuration), // For Lanjut
            skipVotes: new Set(),
            scores: { [socket.sessionId]: 0 },
            streaks: { [socket.sessionId]: 0 },
            history: [],
            // Lanjut specifics
            currentTurn: null,
            lastWord: null,
            usedWords: new Set()
        });

        session.roomId = roomId;
        socket.join(roomId);

        socket.emit('joined_room', { roomId: roomId, role: 'host', category, gameMode });
        console.log(`${name} (Sess: ${socket.sessionId}) created room ${roomId} [${gameMode}]`);
        broadcastRooms();
    });

    socket.on('join_room', ({ name, roomId }) => {
        const session = getSession();
        if (!session) return;

        session.name = name;
        const room = rooms.get(roomId);

        if (room && room.status === 'waiting' && room.players.length < 2) {
            if (room.players.includes(socket.sessionId)) return;

            room.players.push(socket.sessionId);
            room.playerNames[socket.sessionId] = name;
            room.scores[socket.sessionId] = 0;
            room.streaks[socket.sessionId] = 0;
            room.history = room.history || [];

            session.roomId = roomId;
            socket.join(roomId);

            const p1 = room.players[0];
            const p2 = room.players[1];

            if (room.gameMode === 'race') {
                room.status = 'picking';
                io.to(roomId).emit('game_start', {
                    roomId: roomId,
                    players: room.playerNames,
                    pickerRoles: { start: p1, end: p2 },
                    category: room.category,
                    gameMode: 'race'
                });
            } else if (room.gameMode === 'lanjut') {
                startLanjutRound(room);
            }

            console.log(`${name} joined room ${roomId}`);
            broadcastRooms();
        } else {
            socket.emit('error', { message: 'Room not found or full' });
        }
    });

    socket.on('pick_letter', ({ type, letter }) => {
        const session = getSession();
        if (!session || !session.roomId) return;
        const room = rooms.get(session.roomId);
        if (!room || room.gameMode !== 'race') return; // Gatekeep

        // Save the letter
        room.letters[type] = letter;

        // Tell player who picked
        socket.emit('letter_picked', { type, letter });

        // Tell opponent
        socket.to(session.roomId).emit('opponent_picked', { type });

        // Check ready
        if (room.letters.start && room.letters.end) {
            room.status = 'playing';
            io.to(session.roomId).emit('race_start', {
                start: room.letters.start,
                end: room.letters.end
            });
            broadcastRooms();
        }
    });

    socket.on('typing_status', ({ isTyping }) => {
        const session = getSession();
        if (!session || !session.roomId) return;
        socket.to(session.roomId).emit('opponent_typing', { isTyping });
    });

    // RACE MODE SUBMIT
    socket.on('submit_word', async ({ word }) => {
        const session = getSession();
        if (!session || !session.roomId) return;
        const room = rooms.get(session.roomId);

        if (!room || room.status !== 'playing' || room.gameMode !== 'race') return;

        // Validate
        const validation = await validateWord(word, room.letters.start, room.letters.end, room.category);

        if (room.status !== 'playing') return;

        if (validation.isValid) {
            room.status = 'finished';
            room.winner = room.playerNames[socket.sessionId];

            const winnerId = socket.sessionId;
            const loserId = room.players.find(id => id !== winnerId);

            room.streaks[winnerId] = (room.streaks[winnerId] || 0) + 1;
            room.streaks[loserId] = 0;

            let points = 1;
            if (room.streaks[winnerId] >= 3) points += 1;
            room.scores[winnerId] = (room.scores[winnerId] || 0) + points;

            room.history.push({
                word: word,
                winner: room.playerNames[winnerId],
                reason: validation.reason,
                timestamp: Date.now()
            });

            io.to(session.roomId).emit('round_over', {
                winner: room.playerNames[winnerId],
                word: word,
                reason: validation.reason || "Valid word!",
                scores: room.scores,
                streaks: room.streaks,
                pointsEarned: points,
                history: room.history,
                winnerSessionId: winnerId
            });
            broadcastRooms();
        } else {
            socket.emit('validation_fail', { reason: validation.reason });
        }
    });

    // LANJUT KATA SUBMIT
    socket.on('submit_word_lanjut', async ({ word }) => {
        const session = getSession();
        if (!session || !session.roomId) return;
        const room = rooms.get(session.roomId);

        // Basic checks
        if (!room || room.status !== 'playing' || room.gameMode !== 'lanjut') return;
        if (room.currentTurn !== socket.sessionId) {
            return socket.emit('validation_fail', { reason: "Not your turn!" });
        }

        const normalizedWord = word.trim().toUpperCase();

        // 1. Check if word starts with last letter (if not first turn)
        if (room.lastWord) {
            const requiredChar = room.lastWord.slice(-1).toUpperCase();
            if (!normalizedWord.startsWith(requiredChar)) {
                return socket.emit('validation_fail', { reason: `Must start with '${requiredChar}'!` });
            }
        }

        // 2. Check duplicates
        if (room.usedWords.has(normalizedWord)) {
            return socket.emit('validation_fail', { reason: "Word already used!" });
        }

        // 3. AI/Dictionary Validation
        // Using same validateWord but we ignore 'end' char restriction (pass null)
        // If it's the first turn (no lastWord), we also ignore the start char restriction (pass null)
        const startChar = room.lastWord ? normalizedWord[0] : null;
        const validation = await validateWord(normalizedWord, startChar, null, room.category);

        if (!validation.isValid) {
            return socket.emit('validation_fail', { reason: validation.reason });
        }

        // --- SUCCESS ---
        if (room.timer) clearTimeout(room.timer);

        room.usedWords.add(normalizedWord);
        room.lastWord = normalizedWord;
        room.history.push({ word: normalizedWord, player: room.playerNames[socket.sessionId] });

        // Switch turn
        const nextPlayer = room.players.find(id => id !== socket.sessionId);
        room.currentTurn = nextPlayer;

        io.to(room.roomId).emit('word_accepted', {
            word: normalizedWord,
            player: socket.sessionId,
            history: room.history
        });

        startTurnTimer(room);
    });

    socket.on('request_next_round', () => {
        const session = getSession();
        if (!session || !session.roomId) return;
        const room = rooms.get(session.roomId);
        if (!room) return;

        if (room.gameMode === 'race') {
            room.letters = { start: null, end: null };
            room.status = 'picking';
            room.winner = null;
            room.skipVotes.clear();

            // Swap roles
            const p1 = room.players[0];
            const p2 = room.players[1];
            const roundsPlayed = room.history.length;
            const shouldSwap = Math.floor(roundsPlayed / 10) % 2 === 1;

            io.to(session.roomId).emit('next_round_started', {
                roomId: session.roomId,
                players: room.playerNames,
                pickerRoles: {
                    start: shouldSwap ? p2 : p1,
                    end: shouldSwap ? p1 : p2
                },
                scores: room.scores,
                streaks: room.streaks
            });
        } else if (room.gameMode === 'lanjut') {
            // For Lanjut, next round means restarting the loop after someone lost
            startLanjutRound(room);
        }

        broadcastRooms();
    });

    socket.on('vote_skip', () => {
        const session = getSession();
        if (!session || !session.roomId) return;
        const room = rooms.get(session.roomId);
        if (!room || room.status !== 'playing') return;

        // Skip logic only for Race 
        if (room.gameMode !== 'race') return;

        room.skipVotes.add(socket.sessionId);

        io.to(session.roomId).emit('skip_update', {
            votes: room.skipVotes.size,
            needed: 2,
            voter: socket.sessionId // Send sessID
        });

        if (room.skipVotes.size >= 2) {
            room.letters = { start: null, end: null };
            room.status = 'picking';
            room.skipVotes.clear();
            room.winner = null;

            const p1 = room.players[0];
            const p2 = room.players[1];

            io.to(session.roomId).emit('round_skipped', {
                pickerRoles: { start: p2, end: p1 }
            });
            broadcastRooms();
        }
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id} (Session: ${socket.sessionId})`);

        const session = sessions.get(socket.sessionId);
        if (session) {
            session.connected = false;

            // If in a room, notifying opponent shouldn't mean game over immediately
            if (session.roomId) {
                const room = rooms.get(session.roomId);
                // Notify opponent that this user is offline (but might return)
                socket.to(session.roomId).emit('opponent_status', { online: false });

                // IF room is just 'waiting' (only 1 player), we might just leave it?
                // Or if it's 'playing', we wait.

                // Set a timeout to CLEANUP only if they don't come back
                // 2 minutes timeout
                session.disconnectTimeout = setTimeout(() => {
                    console.log(`Session ${socket.sessionId} timed out. Cleaning up.`);

                    // Now we really remove them
                    if (session.roomId) {
                        const r = rooms.get(session.roomId);
                        if (r) {
                            // Notify others they REALLY left
                            io.to(session.roomId).emit('player_left');

                            // Destroy room or remove player?
                            // For 1v1, destroying room is standard if one leaves permanently
                            rooms.delete(session.roomId);
                            broadcastRooms();
                        }
                    }
                    sessions.delete(socket.sessionId);
                }, 120000); // 2 minutes
            } else {
                // Not in room, just clean up session after a while to save memory
                session.disconnectTimeout = setTimeout(() => {
                    sessions.delete(socket.sessionId);
                }, 60000);
            }
        }
    });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
