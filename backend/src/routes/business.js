const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  getBusinessPlans,
  registerBusiness,
  getUserBusiness,
  sendJoinRequest,
  getJoinRequests,
  respondToJoinRequest,
  getBusinessDashboard,
  handlePaymentSuccess,
  removeArtist
} = require('../controllers/businessController');

// Get all business plans (public)
router.get('/plans', getBusinessPlans);

// Register a new business (requires auth)
router.post('/register', authenticateToken, registerBusiness);

// Get user's business information (requires auth)
router.get('/my-business', authenticateToken, getUserBusiness);

// Send join request to business (requires auth)
router.post('/join-request', authenticateToken, sendJoinRequest);

// Get join requests for a business (requires auth)
router.get('/:businessId/join-requests', authenticateToken, getJoinRequests);

// Respond to join request (requires auth)
router.post('/:businessId/join-requests/:requestId/respond', authenticateToken, respondToJoinRequest);

// Get business dashboard data (requires auth)
router.get('/:businessId/dashboard', authenticateToken, getBusinessDashboard);

// Handle business payment success (requires auth)
router.post('/payment/success', authenticateToken, handlePaymentSuccess);

// Remove artist from business (requires auth)
router.delete('/:businessId/artists/:artistId', authenticateToken, removeArtist);

module.exports = router;
