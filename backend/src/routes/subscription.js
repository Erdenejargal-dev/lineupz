const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
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
router.get('/current', authenticateToken, getCurrentSubscription);
router.post('/create', authenticateToken, createSubscription);
router.post('/upgrade', authenticateToken, requestUpgrade);
router.post('/cancel', authenticateToken, cancelSubscription);
router.get('/usage', authenticateToken, getUsageStats);
router.get('/check/:action', authenticateToken, checkLimits);

// Payment verification route
router.post('/verify-payment', authenticateToken, require('../controllers/subscriptionController').verifyPaymentAndActivate);

// Admin routes
router.get('/admin/all', authenticateToken, getAllSubscriptions);
router.post('/admin/:subscriptionId/approve', authenticateToken, approveUpgrade);

module.exports = router;
