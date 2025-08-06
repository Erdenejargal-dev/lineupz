const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getBusinessPlans,
  registerBusiness,
  getUserBusiness,
  joinBusiness,
  getBusinessDashboard,
  handlePaymentSuccess,
  removeArtist
} = require('../controllers/businessController');

// Get all business plans (public)
router.get('/plans', getBusinessPlans);

// Register a new business (requires auth)
router.post('/register', auth, registerBusiness);

// Get user's business information (requires auth)
router.get('/my-business', auth, getUserBusiness);

// Join a business as an artist (requires auth)
router.post('/join', auth, joinBusiness);

// Get business dashboard data (requires auth)
router.get('/:businessId/dashboard', auth, getBusinessDashboard);

// Handle business payment success (requires auth)
router.post('/payment/success', auth, handlePaymentSuccess);

// Remove artist from business (requires auth)
router.delete('/:businessId/artists/:artistId', auth, removeArtist);

module.exports = router;
