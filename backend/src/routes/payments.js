const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const auth = require('../middleware/auth');

// Public routes
router.post('/webhook', paymentController.handleWebhook);

// Protected routes (require authentication)
router.use(auth);

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
