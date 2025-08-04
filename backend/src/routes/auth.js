const express = require('express');
const router = express.Router();
const { 
  sendOTP, 
  verifyOTP, 
  getMe, 
  updateProfile,
  updateServiceSettings,
  updateNotificationPreferences,
  sendEmailVerification,
  verifyEmail,
  refreshToken 
} = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// Public routes (no authentication required)
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);

// Protected routes (authentication required)
router.get('/me', authenticateToken, getMe);
router.put('/profile', authenticateToken, updateProfile);
router.put('/service-settings', authenticateToken, updateServiceSettings);
router.put('/notification-preferences', authenticateToken, updateNotificationPreferences);
router.post('/send-email-verification', authenticateToken, sendEmailVerification);
router.post('/verify-email', authenticateToken, verifyEmail);
router.post('/refresh', authenticateToken, refreshToken);

module.exports = router;
