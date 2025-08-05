const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getPlans,
  getCurrentSubscription,
  requestUpgrade,
  approveUpgrade,
  cancelSubscription,
  getUsageStats,
  checkLimits,
  getAllSubscriptions
} = require('../controllers/subscriptionController');

// Public routes
router.get('/plans', getPlans);

// Protected routes (require authentication) - temporarily without auth middleware
router.get('/current', getCurrentSubscription);
router.post('/upgrade', requestUpgrade);
router.post('/cancel', cancelSubscription);
router.get('/usage', getUsageStats);
router.get('/check/:action', checkLimits);

// Admin routes (temporarily without auth middleware)
router.get('/admin/all', getAllSubscriptions);
router.post('/admin/:subscriptionId/approve', approveUpgrade);

module.exports = router;
