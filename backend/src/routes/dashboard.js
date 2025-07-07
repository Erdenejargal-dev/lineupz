const express = require('express');
const router = express.Router();
const {
  getDashboardOverview,
  getAnalytics,
  setupCreatorProfile
} = require('../controllers/dashboardController');
const { authenticateToken } = require('../middleware/auth');

// All dashboard routes require authentication

// Get dashboard overview
router.get('/overview', authenticateToken, getDashboardOverview);

// Get analytics data
router.get('/analytics', authenticateToken, getAnalytics);

// Setup creator profile
router.post('/setup-creator', authenticateToken, setupCreatorProfile);

module.exports = router;