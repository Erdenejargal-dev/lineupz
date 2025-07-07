const express = require('express');
const router = express.Router();
const { 
  sendOTP, 
  verifyOTP, 
  getMe, 
  updateProfile, 
  refreshToken 
} = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// Public routes (no authentication required)
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);

// Protected routes (authentication required)
router.get('/me', authenticateToken, getMe);
router.put('/profile', authenticateToken, updateProfile);
router.post('/refresh', authenticateToken, refreshToken);

module.exports = router;