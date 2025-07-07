const express = require('express');
const router = express.Router();
const {
  createLine,
  getLineByCode,
  getMyLines,
  getLineDetails,
  updateLine,
  regenerateCode,
  toggleAvailability,
  deleteLine
} = require('../controllers/lineController');
const { authenticateToken, optionalAuth, requireCreator } = require('../middleware/auth');

// Public routes (anyone can access)
router.get('/code/:code', optionalAuth, getLineByCode); // Get line info by code

// Protected routes (authentication required)
router.post('/', authenticateToken, createLine); // Create new line
router.get('/my-lines', authenticateToken, getMyLines); // Get creator's lines

// Line management routes (creator only)
router.get('/:lineId', authenticateToken, getLineDetails); // Get specific line details
router.put('/:lineId', authenticateToken, updateLine); // Update line settings
router.post('/:lineId/regenerate-code', authenticateToken, regenerateCode); // Regenerate line code
router.patch('/:lineId/toggle-availability', authenticateToken, toggleAvailability); // Toggle availability
router.delete('/:lineId', authenticateToken, deleteLine); // Delete line

module.exports = router;