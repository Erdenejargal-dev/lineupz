const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

// Import payment controller with error handling
let paymentController;
try {
  paymentController = require('../controllers/paymentController');
} catch (error) {
  console.error('Error loading payment controller:', error);
  // Create dummy functions to prevent server crash
  paymentController = {
    handleWebhook: (req, res) => res.status(503).json({ error: 'Payment service temporarily unavailable' }),
    createSubscriptionPayment: (req, res) => res.status(503).json({ error: 'Payment service temporarily unavailable' }),
    createAppointmentPayment: (req, res) => res.status(503).json({ error: 'Payment service temporarily unavailable' }),
    createInvoice: (req, res) => res.status(503).json({ error: 'Payment service temporarily unavailable' }),
    getUserPayments: (req, res) => res.status(503).json({ error: 'Payment service temporarily unavailable' }),
    getPayment: (req, res) => res.status(503).json({ error: 'Payment service temporarily unavailable' }),
    getPaymentStats: (req, res) => res.status(503).json({ error: 'Payment service temporarily unavailable' })
  };
}

// Public routes
router.post('/webhook', paymentController.handleWebhook);

// Protected routes (require authentication)
router.use((req, res, next) => {
  if (typeof authenticateToken === 'function') {
    return authenticateToken(req, res, next);
  } else {
    console.error('Auth middleware not properly loaded');
    return res.status(500).json({ error: 'Authentication service unavailable' });
  }
});

// Create payments
router.post('/subscription', paymentController.createSubscriptionPayment);
router.post('/appointment', paymentController.createAppointmentPayment);
router.post('/invoice', paymentController.createInvoice);

// Get payments
router.get('/user', paymentController.getUserPayments);
router.get('/:paymentId', paymentController.getPayment);

// Admin routes (you might want to add admin middleware here)
router.get('/admin/stats', paymentController.getPaymentStats);

module.exports = router;
