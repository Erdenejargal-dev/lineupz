const express = require('express');
const router = express.Router();
const {
  createLine,
  getLineByCode,
  validateLineCode,
  getMyLines,
  getLineDetails,
  updateLine,
  regenerateCode,
  toggleAvailability,
  deleteLine
} = require('../controllers/lineController');
const { authenticateToken, optionalAuth, requireCreator } = require('../middleware/auth');

const rateLimit = require('express-rate-limit');

// Rate limiter for high-frequency public validation endpoint
const validateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // limit each IP to 30 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false
});

 // Public routes (anyone can access)
 router.get('/code/:code', optionalAuth, getLineByCode); // Get line info by code
 // Lightweight validate route for high-frequency checks (uses rate limiter + small payload)
 router.get('/validate/:code', validateLimiter, validateLineCode);

// Protected routes (authentication required)
router.post('/', authenticateToken, createLine); // Create new line
router.get('/my-lines', authenticateToken, getMyLines); // Get creator's lines

// Line management routes (creator only)
router.get('/:lineId', authenticateToken, getLineDetails); // Get specific line details
router.get('/:lineId/details', authenticateToken, getLineDetails); // Get line details with queue and appointments
router.patch('/:lineId', authenticateToken, updateLine); // Update line settings
router.post('/:lineId/regenerate-code', authenticateToken, regenerateCode); // Regenerate line code
router.patch('/:lineId/toggle-availability', authenticateToken, toggleAvailability); // Toggle availability
router.delete('/:lineId', authenticateToken, deleteLine); // Delete line

module.exports = router;
