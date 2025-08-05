const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  submitReview,
  getBusinessReviews,
  getUserReviews,
  respondToReview,
  getReviewableServices
} = require('../controllers/reviewController');

// Submit a review (requires authentication)
router.post('/submit', auth, submitReview);

// Get reviews for a business (public)
router.get('/business/:businessId', getBusinessReviews);

// Get user's reviews (requires authentication)
router.get('/my-reviews', auth, getUserReviews);

// Get services that can be reviewed (requires authentication)
router.get('/reviewable', auth, getReviewableServices);

// Business owner: Respond to a review (requires authentication)
router.post('/:reviewId/respond', auth, respondToReview);

module.exports = router;
