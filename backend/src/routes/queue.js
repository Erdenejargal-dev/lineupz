const express = require('express');
const router = express.Router();
const {
  joinLine,
  getMyQueue,
  getQueueEntry,
  leaveLine,
  getLineQueue,
  markAsVisited,
  removeFromQueue,
  getQueueStats
} = require('../controllers/queueController');
const { authenticateToken } = require('../middleware/auth');

// ===== USER QUEUE ROUTES =====
// All routes require authentication

// Join a line
router.post('/join', authenticateToken, joinLine);

// Get user's current queue positions
router.get('/my-queue', authenticateToken, getMyQueue);

// Get specific queue entry details
router.get('/entry/:entryId', authenticateToken, getQueueEntry);

// Leave a line
router.patch('/entry/:entryId/leave', authenticateToken, leaveLine);

// ===== CREATOR QUEUE MANAGEMENT ROUTES =====

// Get queue for a specific line (creator view)
router.get('/line/:lineId', authenticateToken, getLineQueue);

// Get queue statistics for a line
router.get('/line/:lineId/stats', authenticateToken, getQueueStats);

// Mark person as visited/served
router.patch('/entry/:entryId/visited', authenticateToken, markAsVisited);

// Remove person from queue
router.patch('/entry/:entryId/remove', authenticateToken, removeFromQueue);

module.exports = router;