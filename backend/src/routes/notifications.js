const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  sendTestNotification,
  getNotificationSettings,
  updateNotificationSettings
} = require('../controllers/notificationController');

// Test notification endpoint
router.post('/test', authenticateToken, sendTestNotification);

// Notification settings for lines
router.get('/settings/:lineId', authenticateToken, getNotificationSettings);
router.patch('/settings/:lineId', authenticateToken, updateNotificationSettings);

module.exports = router;
