const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const appointmentController = require('../controllers/appointmentController');

// Public routes
router.get('/available-slots/:lineCode', appointmentController.getAvailableSlots);

// Protected routes (require authentication)
router.post('/book', authenticateToken, appointmentController.bookAppointment);
router.get('/my-appointments', authenticateToken, appointmentController.getMyAppointments);
router.patch('/:appointmentId/cancel', authenticateToken, appointmentController.cancelAppointment);

// Creator routes
router.get('/line/:lineId', authenticateToken, appointmentController.getLineAppointments);
router.patch('/:appointmentId/complete', authenticateToken, appointmentController.markAppointmentCompleted);

module.exports = router;
