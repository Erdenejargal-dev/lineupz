const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const googleCalendarController = require('../controllers/googleCalendarController');

// All routes require authentication
router.use(authenticateToken);

// Get Google OAuth authorization URL
router.get('/auth-url', googleCalendarController.getAuthUrl);

// Handle OAuth callback
router.post('/callback', googleCalendarController.handleCallback);

// Disconnect Google Calendar
router.post('/disconnect', googleCalendarController.disconnect);

// Check calendar availability for a time slot
router.post('/check-availability', googleCalendarController.checkAvailability);

// Get calendar connection status
router.get('/status', googleCalendarController.getStatus);

// Toggle calendar sync on/off
router.put('/toggle-sync', googleCalendarController.toggleSync);

module.exports = router;
