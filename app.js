import express from 'express';
import cors from 'cors';
import { randomBytes } from 'node:crypto';

const app = express();
const rooms = new Map();

app.use(cors());
app.use(express.json());

function getValidRoom(rawCode) {
    if (!/^[a-fA-F0-9]{6}$/.test(rawCode)) return null;
    return rooms.get(rawCode.toUpperCase()) || null;
}

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.get('/api/rooms', (req, res) => {
    const publicRooms = Array.from(rooms.values()).map(r => ({
        code: r.code,
        status: r.status,
        playersCount: r.players.length,
        maxPlayers: r.maxPlayers,
        createdAt: r.createdAt
    }));

    res.json({ rooms: publicRooms });
});

app.post('/api/rooms', (req, res) => {
    let code;

    do {
        code = randomBytes(3).toString('hex').toUpperCase();
    } while (rooms.has(code));

    const room = {
        code: code,
        status: 'waiting', 
        maxPlayers: 2,
        players: [],
        createdAt: new Date().toISOString()
    };

    rooms.set(code, room);

    res.status(201).json({
        room: room,
        invitePath: `/join/${code}`
    });
});

app.get('/api/rooms/:code', (req, res) => {
    const room = getValidRoom(req.params.code);

    if (!room) {
        return res.status(404).json({ error: 'Room not found' });
    }

    res.json({
        room: room,
        invitePath: `/join/${room.code}`
    });
});

app.post('/api/rooms/:code/join', (req, res) => {
    const room = getValidRoom(req.params.code);

    if (!room) return res.status(404).json({ error: 'Room not found' });
    if (room.status !== 'waiting') return res.status(400).json({ error: 'Game already in progress or finished' });
    if (room.players.length >= room.maxPlayers) return res.status(400).json({ error: 'Room is full' });

    const nickname = (req.body.nickname || '').trim() || `Player ${room.players.length + 1}`;

    const player = {
        id: randomBytes(8).toString('hex'), 
        nickname: nickname,
        isReady: false,
        slot: room.players.length + 1
    };

    room.players.push(player);

    res.json({
        message: 'Joined successfully',
        roomCode: room.code,
        player: player
    });
});

app.post('/api/rooms/:code/ready', (req, res) => {
    const room = getValidRoom(req.params.code);

    if (!room) return res.status(404).json({ error: 'Room not found' });

    const { playerId } = req.body;
    const player = room.players.find(p => p.id === playerId);

    if (!player) return res.status(403).json({ error: 'Invalid playerId' });

    player.isReady = !player.isReady;

    const allReady = room.players.length === room.maxPlayers && room.players.every(p => p.isReady);
    if (allReady) {
        room.status = 'in_progress';
    }

    res.json({
        roomStatus: room.status,
        playerReady: player.isReady,
        allReady: allReady
    });
});

app.post('/api/rooms/:code/leave', (req, res) => {
    const room = getValidRoom(req.params.code);

    if (!room) return res.status(404).json({ error: 'Room not found' });

    const { playerId } = req.body;
    const playerIndex = room.players.findIndex(p => p.id === playerId);

    if (playerIndex === -1) return res.status(403).json({ error: 'Invalid playerId' });

    room.players.splice(playerIndex, 1);

    if (room.players.length === 0) {
        rooms.delete(room.code);
        return res.json({ message: 'Room deleted because all players left' });
    }

    if (room.status === 'in_progress') {
        room.status = 'finished';
    }

    res.json({ message: 'Left room successfully' });
});

app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Serwer działa: http://localhost:${PORT}`);
});