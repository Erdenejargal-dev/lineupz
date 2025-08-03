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

// DEBUG route - temporary for troubleshooting
router.get('/debug/:lineCode', async (req, res) => {
  try {
    const { lineCode } = req.params;
    const Line = require('../models/Line');
    const Appointment = require('../models/Appointment');
    
    console.log(`DEBUG: Checking appointments for line code ${lineCode}`);
    
    const line = await Line.findOne({ lineCode });
    if (!line) {
      return res.json({ success: false, message: 'Line not found', lineCode });
    }
    
    const allAppointments = await Appointment.find({ line: line._id })
      .populate('user', 'name phone userId')
      .sort({ createdAt: -1 });
    
    console.log(`DEBUG: Found ${allAppointments.length} appointments for line ${lineCode}`);
    
    res.json({
      success: true,
      lineCode,
      lineId: line._id,
      lineTitle: line.title,
      serviceType: line.serviceType,
      totalAppointments: allAppointments.length,
      appointments: allAppointments.map(apt => ({
        _id: apt._id,
        appointmentTime: apt.appointmentTime,
        status: apt.status,
        notes: apt.notes,
        user: apt.user,
        createdAt: apt.createdAt
      }))
    });
    
  } catch (error) {
    console.error('Debug appointments error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
