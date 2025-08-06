const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Import controller functions with error handling
let reviewController;
try {
  reviewController = require('../controllers/reviewController');
} catch (error) {
  console.error('Error loading review controller:', error);
  // Create dummy functions to prevent server crash
  reviewController = {
    submitReview: (req, res) => res.status(503).json({ error: 'Review service temporarily unavailable' }),
    getBusinessReviews: (req, res) => res.status(503).json({ error: 'Review service temporarily unavailable' }),
    getUserReviews: (req, res) => res.status(503).json({ error: 'Review service temporarily unavailable' }),
    respondToReview: (req, res) => res.status(503).json({ error: 'Review service temporarily unavailable' }),
    getReviewableServices: (req, res) => res.status(503).json({ error: 'Review service temporarily unavailable' })
  };
}

const {
  submitReview,
  getBusinessReviews,
  getUserReviews,
  respondToReview,
  getReviewableServices
} = reviewController;

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
