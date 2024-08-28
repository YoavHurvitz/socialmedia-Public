import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { getMessagesBetweenUsers, getAllUserMessages } from '../controllers/messages.js';

const router = express.Router();

// Get messages between two users
router.get('/:userId/:receiverId', verifyToken, getMessagesBetweenUsers);

// Get all messages for a user
router.get('/:userId', verifyToken, getAllUserMessages);

export default router;