const express = require('express');
const router = express.Router();
const { getLiveStats, getDetailedStats } = require('../controllers/statsController');
const auth = require('../middleware/auth');

// Public route for homepage live stats
router.get('/live', getLiveStats);

// Protected route for detailed analytics (requires authentication)
router.get('/detailed', auth, getDetailedStats);

// Health check for stats service
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Stats service is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
