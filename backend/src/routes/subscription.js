const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getPlans,
  getCurrentSubscription,
  createSubscription,
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
router.get('/current', auth.authenticateToken, getCurrentSubscription);
router.post('/create', auth.authenticateToken, createSubscription);
router.post('/upgrade', auth.authenticateToken, requestUpgrade);
router.post('/cancel', auth.authenticateToken, cancelSubscription);
router.get('/usage', auth.authenticateToken, getUsageStats);
router.get('/check/:action', auth.authenticateToken, checkLimits);

// Payment verification route
router.post('/verify-payment', auth.authenticateToken, require('../controllers/subscriptionController').verifyPaymentAndActivate);

// Admin routes
router.get('/admin/all', auth.authenticateToken, getAllSubscriptions);
router.post('/admin/:subscriptionId/approve', auth.authenticateToken, approveUpgrade);

module.exports = router;
