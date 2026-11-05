import express from 'express';
import {
    getRooms, createRoom, getRoom,
    joinRoom, readyRoom, leaveRoom
} from '../controllers/roomController.js';

const router = express.Router();

router.get('/', getRooms);
router.post('/', createRoom);
router.get('/:code', getRoom);
router.post('/:code/join', joinRoom);
router.post('/:code/ready', readyRoom);
router.post('/:code/leave', leaveRoom);

export default router;