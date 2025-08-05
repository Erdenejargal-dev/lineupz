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

// Protected routes (require authentication)
router.get('/current', auth, getCurrentSubscription);
router.post('/upgrade', auth, requestUpgrade);
router.post('/cancel', auth, cancelSubscription);
router.get('/usage', auth, getUsageStats);
router.get('/check/:action', auth, checkLimits);

// Admin routes (you can add admin middleware later)
router.get('/admin/all', auth, getAllSubscriptions);
router.post('/admin/:subscriptionId/approve', auth, approveUpgrade);

module.exports = router;
