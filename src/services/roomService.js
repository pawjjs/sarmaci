import { randomBytes } from 'node:crypto';
import { rooms, getValidRoom } from '../store/roomStore.js';

export const getAllPublicRooms = () => {
    return Array.from(rooms.values()).map(r => ({
        code: r.code,
        status: r.status,
        playersCount: r.players.length,
        maxPlayers: r.maxPlayers,
        createdAt: r.createdAt
    }));
};

export const createNewRoom = () => {
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
    return room;
};

export const getRoomDetails = (code) => {
    const room = getValidRoom(code);
    if (!room) throw new Error('Room not found');
    return room;
};

export const joinPlayerToRoom = (code, rawNickname) => {
    const room = getValidRoom(code);

    if (!room) throw new Error('Room not found');
    if (room.status !== 'waiting') throw new Error('Game already in progress or finished');
    if (room.players.length >= room.maxPlayers) throw new Error('Room is full');

if (rawNickname !== undefined && typeof rawNickname !== 'string') {
    throw new Error('Nickname must be a string');
}

const trimmedNickname = (rawNickname ?? '').trim();

if (Array.from(trimmedNickname).length > 20) {
    throw new Error('Nickname must contain at most 20 characters');
}

const slot = [1, 2].find(
    number => !room.players.some(player => player.slot === number)
);

const nickname = trimmedNickname || `Player ${room.players.length + 1}`;    const player = {
        id: randomBytes(8).toString('hex'),
        nickname: nickname,
        isReady: false,
        slot: slot
    };

    room.players.push(player);
    return { room, player };
};

export const togglePlayerReady = (code, playerId) => {
    const room = getValidRoom(code);
    if (!room) throw new Error('Room not found');

    const player = room.players.find(p => p.id === playerId);
    if (!player) throw new Error('Invalid playerId');

    if (room.status !== 'waiting') {
    const error = new Error('Readiness can only be changed in a waiting room');
    error.statusCode = 409;
    throw error;
}
    player.isReady = !player.isReady;

    const allReady = room.players.length === room.maxPlayers && room.players.every(p => p.isReady);
    if (allReady) {
        room.status = 'in_progress';
    }

    return { roomStatus: room.status, playerReady: player.isReady, allReady };
};

export const removePlayerFromRoom = (code, playerId) => {
    const room = getValidRoom(code);
    if (!room) throw new Error('Room not found');

    const playerIndex = room.players.findIndex(p => p.id === playerId);
    if (playerIndex === -1) throw new Error('Invalid playerId');

    room.players.splice(playerIndex, 1);

    if (room.players.length === 0) {
        rooms.delete(room.code);
        return { message: 'Room deleted because all players left' };
    }

    if (room.status === 'in_progress') {
        room.status = 'finished';
    }

    return { message: 'Left room successfully' };
};