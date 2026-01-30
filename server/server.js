const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { validateWord } = require('./gemini');
require('dotenv').config();

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all for dev, restrict in prod
        methods: ["GET", "POST"]
    }
});

// Game State Storage
// Room ID -> { players: [id1, id2], playerNames: {id: name}, letters: {start: '', end: ''}, status: 'waiting'|'picking'|'playing'|'finished' }
const rooms = new Map();
// Socket ID -> Room ID
const playerRooms = new Map();

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
                players: room.players.length
            });
        }
    }
    io.emit('rooms_update', roomList);
}

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Send current rooms to new connector
    broadcastRooms();

    socket.on('create_room', ({ name, category = "General" }) => {
        const roomId = createRoomId();
        rooms.set(roomId, {
            players: [socket.id],
            playerNames: { [socket.id]: name },
            letters: { start: null, end: null },
            status: 'waiting',
            winner: null,
            category: category
        });

        socket.join(roomId);
        playerRooms.set(socket.id, roomId);
        socket.emit('joined_room', { roomId: roomId, role: 'host', category });
        console.log(`${name} created room ${roomId} [${category}]`);
        broadcastRooms();
    });

    socket.on('join_room', ({ name, roomId }) => {
        const room = rooms.get(roomId);

        if (room && room.status === 'waiting' && room.players.length < 2) {
            room.players.push(socket.id);
            room.playerNames[socket.id] = name;
            room.status = 'picking';

            socket.join(roomId);
            playerRooms.set(socket.id, roomId);

            // Assign roles
            const p1 = room.players[0]; // Host
            const p2 = room.players[1]; // Joiner

            io.to(roomId).emit('game_start', {
                roomId: roomId,
                players: room.playerNames,
                pickerRoles: {
                    start: p1,
                    end: p2
                },
                category: room.category
            });
            console.log(`${name} joined room ${roomId}`);
            broadcastRooms();
        } else {
            socket.emit('error', { message: 'Room not found or full' });
        }
    });

    // Kept generic join_game for simple scenarios if needed, but UI will likely use above
    socket.on('join_game', ({ name, category = "General" }) => {
        // ... Legacy or simple auto-match logic if we want to keep it ...
        // For now, let's redirect to create_room specific logic if they come here?
        // But better to just implement the simple match here again as a fallback or "Quick Match"

        let targetRoom = null;
        for (const [id, room] of rooms.entries()) {
            if (room.players.length === 1 && room.status === 'waiting') {
                targetRoom = id;
                break;
            }
        }

        if (!targetRoom) {
            const roomId = createRoomId();
            rooms.set(roomId, {
                players: [socket.id],
                playerNames: { [socket.id]: name },
                letters: { start: null, end: null },
                status: 'waiting',
                winner: null,
                category: category
            });
            socket.join(roomId);
            playerRooms.set(socket.id, roomId);
            socket.emit('joined_room', { roomId: roomId, role: 'host', category });
            broadcastRooms();
        } else {
            // Join logic same as above
            const room = rooms.get(targetRoom);
            room.players.push(socket.id);
            room.playerNames[socket.id] = name;
            room.status = 'picking';
            socket.join(targetRoom);
            playerRooms.set(socket.id, targetRoom);
            const p1 = room.players[0];
            const p2 = room.players[1];
            io.to(targetRoom).emit('game_start', {
                roomId: targetRoom,
                players: room.playerNames,
                pickerRoles: { start: p1, end: p2 },
                category: room.category
            });
            broadcastRooms();
        }
    });

    socket.on('pick_letter', ({ type, letter }) => {
        const roomId = playerRooms.get(socket.id);
        if (!roomId) return;
        const room = rooms.get(roomId);

        if (type === 'start') room.letters.start = letter;
        if (type === 'end') room.letters.end = letter;

        io.to(roomId).emit('letter_picked', { type, letter });

        if (room.letters.start && room.letters.end) {
            room.status = 'playing';
            // Small delay to ensure UI updates
            setTimeout(() => {
                io.to(roomId).emit('race_start', {
                    start: room.letters.start,
                    end: room.letters.end
                });
            }, 1000);
            broadcastRooms(); // Status changed to playing
        }
    });

    socket.on('typing_status', ({ isTyping }) => {
        const roomId = playerRooms.get(socket.id);
        if (!roomId) return;
        const room = rooms.get(roomId);

        // Broadcast to others in room
        socket.to(roomId).emit('opponent_typing', { isTyping });
    });

    socket.on('submit_word', async ({ word }) => {
        const roomId = playerRooms.get(socket.id);
        if (!roomId) return;
        const room = rooms.get(roomId);

        if (room.status !== 'playing') return;

        // Validate with category
        const validation = await validateWord(word, room.letters.start, room.letters.end, room.category);

        if (validation.isValid) {
            room.status = 'finished';
            room.winner = room.playerNames[socket.id];
            io.to(roomId).emit('game_over', {
                winner: room.playerNames[socket.id],
                word: word,
                reason: validation.reason || "Valid word!"
            });
            broadcastRooms(); // Status changed
        } else {
            socket.emit('validation_fail', { reason: validation.reason });
        }
    });

    socket.on('request_rematch', () => {
        const roomId = playerRooms.get(socket.id);
        if (!roomId) return;
        const room = rooms.get(roomId);

        // Ideally both need to agree, but for MVP, first click resets
        // Reset state
        room.letters = { start: null, end: null };
        room.status = 'picking';
        room.winner = null;

        // Swap roles for variety? Let's keep it simple or random
        const p1 = room.players[0];
        const p2 = room.players[1];

        io.to(roomId).emit('rematch_started', {
            roomId: roomId,
            players: room.playerNames,
            pickerRoles: {
                start: p2, // Swap picker roles
                end: p1
            }
        });
        broadcastRooms(); // Status back to picking
    });

    socket.on('disconnect', () => {
        const roomId = playerRooms.get(socket.id);
        if (roomId) {
            io.to(roomId).emit('player_left');
            rooms.delete(roomId);
            playerRooms.delete(socket.id);
            broadcastRooms();
        }
    });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
