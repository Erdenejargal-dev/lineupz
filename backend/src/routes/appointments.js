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
    
    // Simulate the exact same filtering logic as getLineDetails
    const now = new Date();
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    
    const upcomingAppointments = allAppointments.filter(appointment => {
      const appointmentDate = new Date(appointment.appointmentTime);
      const isUpcoming = appointmentDate >= today;
      return isUpcoming && ['confirmed', 'pending', 'in_progress'].includes(appointment.status);
    });
    
    const formattedAppointments = upcomingAppointments.map(appointment => ({
      _id: appointment._id,
      type: 'appointment',
      userId: appointment.user?.userId || 'Unknown',
      customerName: appointment.user?.name || 'Anonymous',
      customerPhone: appointment.user?.phone,
      appointmentTime: appointment.appointmentTime,
      endTime: appointment.endTime,
      duration: appointment.duration,
      status: appointment.status,
      customerMessage: appointment.notes || '',
      joinedAt: appointment.createdAt,
      formattedTime: appointment.appointmentTime.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }),
      formattedDate: appointment.appointmentTime.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      })
    }));
    
    res.json({
      success: true,
      lineCode,
      lineId: line._id,
      lineTitle: line.title,
      serviceType: line.serviceType,
      currentTime: now.toISOString(),
      todayStart: today.toISOString(),
      totalAppointments: allAppointments.length,
      upcomingAppointments: upcomingAppointments.length,
      dashboardWillShow: formattedAppointments,
      rawAppointments: allAppointments.map(apt => ({
        _id: apt._id,
        appointmentTime: apt.appointmentTime,
        status: apt.status,
        notes: apt.notes,
        user: apt.user,
        createdAt: apt.createdAt,
        isUpcoming: new Date(apt.appointmentTime) >= today,
        hasValidStatus: ['confirmed', 'pending', 'in_progress'].includes(apt.status)
      }))
    });
    
  } catch (error) {
    console.error('Debug appointments error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DIRECT TEST: Simulate exact creator dashboard API call
router.get('/test-creator-dashboard/:lineCode', async (req, res) => {
  try {
    const { lineCode } = req.params;
    const Line = require('../models/Line');
    const LineJoiner = require('../models/LineJoiner');
    const Appointment = require('../models/Appointment');
    
    console.log(`TEST: Simulating creator dashboard for line code ${lineCode}`);
    
    const line = await Line.findOne({ lineCode });
    if (!line) {
      return res.json({ success: false, message: 'Line not found', lineCode });
    }
    
    console.log(`TEST: Found line ${line._id} with serviceType: ${line.serviceType}`);
    
    const serviceType = line.serviceType || 'queue';
    let queue = [];
    let appointments = [];
    let queueCount = 0;
    let appointmentCount = 0;

    // Get current queue for queue-based or hybrid lines
    if (serviceType === 'queue' || serviceType === 'hybrid') {
      try {
        queue = await LineJoiner.find({ line: line._id, status: 'waiting' })
          .populate('user', 'userId name')
          .sort({ position: 1 });
        queueCount = queue.length;
        console.log(`TEST: Found ${queueCount} queue customers`);
      } catch (queueError) {
        console.error('TEST: Error getting queue:', queueError);
      }
    }

    // Get appointments for appointment-based or hybrid lines
    if (serviceType === 'appointments' || serviceType === 'hybrid') {
      try {
        console.log(`TEST: Looking for appointments for line ${line._id}`);
        
        const allAppointments = await Appointment.find({
          line: line._id,
          status: { $in: ['confirmed', 'pending', 'in_progress'] }
        })
        .populate('user', 'name phone userId')
        .sort({ appointmentTime: 1 });
        
        console.log(`TEST: Found ${allAppointments.length} total appointments`);
        
        // Show ALL appointments (no filtering)
        appointments = allAppointments.map(appointment => ({
          _id: appointment._id,
          type: 'appointment',
          userId: appointment.user?.userId || 'Unknown',
          customerName: appointment.user?.name || 'Anonymous',
          customerPhone: appointment.user?.phone,
          appointmentTime: appointment.appointmentTime,
          endTime: appointment.endTime,
          duration: appointment.duration,
          status: appointment.status,
          customerMessage: appointment.notes || '',
          joinedAt: appointment.createdAt
        }));

        appointmentCount = appointments.length;
        console.log(`TEST: Returning ${appointmentCount} appointments`);
      } catch (appointmentError) {
        console.error('TEST: Error getting appointments:', appointmentError);
      }
    }
    
    const response = {
      success: true,
      lineCode,
      lineId: line._id,
      lineTitle: line.title,
      serviceType,
      queueCount,
      appointmentCount,
      totalCustomers: queueCount + appointmentCount,
      queue: queue.map(joiner => ({
        _id: joiner._id,
        type: 'queue',
        userId: joiner.user?.userId,
        name: joiner.user?.name || 'Anonymous',
        position: joiner.position,
        joinedAt: joiner.joinedAt
      })),
      appointments: appointments,
      // This is what the frontend should receive
      exactApiResponse: {
        success: true,
        line: {
          _id: line._id,
          title: line.title,
          serviceType: line.serviceType,
          queueCount,
          appointmentCount,
          totalCustomers: queueCount + appointmentCount,
          queue: queue.map(joiner => ({
            _id: joiner._id,
            type: 'queue',
            userId: joiner.user?.userId,
            name: joiner.user?.name || 'Anonymous',
            position: joiner.position,
            joinedAt: joiner.joinedAt
          })),
          appointments: appointments
        }
      }
    };
    
    console.log(`TEST: Final response - appointments: ${appointments.length}, queue: ${queue.length}`);
    res.json(response);
    
  } catch (error) {
    console.error('TEST: Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
