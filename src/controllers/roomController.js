import * as roomService from '../services/roomService.js';

export const getRooms = (req, res) => {
    const rooms = roomService.getAllPublicRooms();
    res.json({ rooms });
};

export const createRoom = (req, res) => {
    const room = roomService.createNewRoom();
    res.status(201).json({ room, invitePath: `/join/${room.code}` });
};

export const getRoom = (req, res) => {
    try {
        const room = roomService.getRoomDetails(req.params.code);
        res.json({ room, invitePath: `/join/${room.code}` });
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
};

export const joinRoom = (req, res) => {
    const body = req.body ?? {};

    if (typeof body !== 'object' || Array.isArray(body)) {
        return res.status(400).json({
            error: 'Request body must be an object'
        });
    }

    try {
        const { room, player } = roomService.joinPlayerToRoom(
            req.params.code,
            body.nickname
        );

        res.json({
            message: 'Joined successfully',
            roomCode: room.code,
            player
        });
    } catch (error) {
        const status = error.message === 'Room not found' ? 404 : 400;
        res.status(status).json({ error: error.message });
    }
};

export const readyRoom = (req, res) => {
    const body = req.body;

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
        return res.status(400).json({
            error: 'Request body must be an object'
        });
    }

    const { playerId } = body;

    if (typeof playerId !== 'string' || !/^[a-f0-9]{16}$/.test(playerId)) {
        return res.status(400).json({
            error: 'playerId must contain 16 lowercase hexadecimal characters'
        });
    }

    try {
        const result = roomService.togglePlayerReady(
            req.params.code,
            playerId
        );

        res.json(result);
    } catch (error) {
        const status = error.message === 'Room not found' ? 404 : 403;
        res.status(status).json({ error: error.message });
    }
};

export const leaveRoom = (req, res) => {
    const body = req.body;

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
        return res.status(400).json({
            error: 'Request body must be an object'
        });
    }

    const { playerId } = body;

    if (typeof playerId !== 'string' || !/^[a-f0-9]{16}$/.test(playerId)) {
        return res.status(400).json({
            error: 'playerId must contain 16 lowercase hexadecimal characters'
        });
    }

    try {
        const result = roomService.removePlayerFromRoom(
            req.params.code,
            playerId
        );

        res.json(result);
    } catch (error) {
        const status = error.message === 'Room not found' ? 404 : 403;
        res.status(status).json({ error: error.message });
    }
};