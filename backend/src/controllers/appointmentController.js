// ===== backend/src/controllers/appointmentController.js =====
// Create this as a NEW FILE

const Appointment = require('../models/Appointment');
const Line = require('../models/Line');
const { notifyAppointmentUpdate } = require('./notificationController');

// Get available slots for a line on a specific date
const getAvailableSlots = async (req, res) => {
  try {
    const { lineCode } = req.params;
    const { date } = req.query; // YYYY-MM-DD format
    
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date parameter is required (format: YYYY-MM-DD)'
      });
    }
    
    const line = await Line.findOne({ lineCode, isActive: true });
    if (!line) {
      return res.status(404).json({
        success: false,
        message: 'Line not found'
      });
    }
    
    if (line.serviceType === 'queue') {
      return res.status(400).json({
        success: false,
        message: 'This line does not support appointments'
      });
    }

    // Ensure appointment settings exist
    if (!line.appointmentSettings) {
      return res.status(400).json({
        success: false,
        message: 'This line is not properly configured for appointments'
      });
    }
    
    // Check if the requested date is within allowed booking window
    const requestedDate = new Date(date + 'T00:00:00.000Z'); // Ensure UTC
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today
    
    const maxAdvanceDays = line.appointmentSettings?.advanceBookingDays || 7;
    
    // Handle fractional days (e.g., 0.04 for 1 hour)
    const maxAdvanceMilliseconds = maxAdvanceDays * 24 * 60 * 60 * 1000;
    const maxDate = new Date(today.getTime() + maxAdvanceMilliseconds);
    
    // Check if requested date is in the past
    if (requestedDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Cannot book appointments for past dates'
      });
    }
    
    if (requestedDate > maxDate) {
      const advanceText = maxAdvanceDays < 1 ? 
        `${Math.round(maxAdvanceDays * 24)} hours` : 
        `${maxAdvanceDays} days`;
      
      return res.status(400).json({
        success: false,
        message: `Appointments can only be booked ${advanceText} in advance`
      });
    }
    
    // Get day of week
    const dayOfWeek = requestedDate.toLocaleDateString('en-US', { weekday: 'lowercase' });
    
    // Find schedule for this day
    const daySchedule = line.availability.schedule.find(s => s.day === dayOfWeek);
    if (!daySchedule || !daySchedule.isAvailable) {
      return res.json({
        success: true,
        date,
        slots: [],
        message: 'No availability on this day'
      });
    }
    
    // Generate time slots
    const slots = [];
    const duration = line.appointmentSettings?.duration || 30;
    const interval = line.appointmentSettings?.slotInterval || 30;
    
    // Parse start and end times properly
    const [startHour, startMinute] = daySchedule.startTime.split(':').map(Number);
    const [endHour, endMinute] = daySchedule.endTime.split(':').map(Number);
    
    // Create start and end times for the specific date
    const startTime = new Date(date + 'T00:00:00.000Z');
    startTime.setUTCHours(startHour, startMinute, 0, 0);
    
    const endTime = new Date(date + 'T00:00:00.000Z');
    endTime.setUTCHours(endHour, endMinute, 0, 0);
    
    console.log(`Generating slots for ${date}:`);
    console.log(`Start time: ${startTime.toISOString()}`);
    console.log(`End time: ${endTime.toISOString()}`);
    console.log(`Duration: ${duration} minutes, Interval: ${interval} minutes`);
    
    let currentSlot = new Date(startTime);
    
    while (currentSlot < endTime) {
      const slotEnd = new Date(currentSlot.getTime() + duration * 60000);
      if (slotEnd <= endTime) {
        slots.push({
          startTime: new Date(currentSlot),
          endTime: new Date(slotEnd),
          available: true // Will be checked against existing appointments
        });
        console.log(`Generated slot: ${currentSlot.toISOString()} - ${slotEnd.toISOString()}`);
      }
      currentSlot = new Date(currentSlot.getTime() + interval * 60000);
    }
    
    console.log(`Total slots generated: ${slots.length}`);
    
    // Get existing appointments for this date
    const startOfDay = new Date(`${date}T00:00:00.000Z`);
    const endOfDay = new Date(`${date}T23:59:59.999Z`);
    
    const existingAppointments = await Appointment.find({
      line: line._id,
      appointmentTime: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      status: { $in: ['confirmed', 'pending', 'in_progress'] }
    });
    
    // Mark slots as unavailable if they conflict with existing appointments
    const availableSlots = slots.map(slot => {
      const isConflict = existingAppointments.some(appointment => {
        const appointmentStart = new Date(appointment.appointmentTime);
        const appointmentEnd = new Date(appointment.endTime);
        
        return (slot.startTime < appointmentEnd && slot.endTime > appointmentStart);
      });
      
      return {
        startTime: slot.startTime.toISOString(),
        endTime: slot.endTime.toISOString(),
        available: !isConflict
      };
    });
    
    res.json({
      success: true,
      date,
      slots: availableSlots,
      totalSlots: availableSlots.length,
      availableSlots: availableSlots.filter(s => s.available).length
    });
    
  } catch (error) {
    console.error('Get available slots error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get available slots'
    });
  }
};

// Book an appointment
const bookAppointment = async (req, res) => {
  try {
    const { lineCode, appointmentTime, notes } = req.body;
    
    if (!lineCode || !appointmentTime) {
      return res.status(400).json({
        success: false,
        message: 'Line code and appointment time are required'
      });
    }
    
    const line = await Line.findOne({ lineCode, isActive: true });
    if (!line) {
      return res.status(404).json({
        success: false,
        message: 'Line not found'
      });
    }
    
    if (line.serviceType === 'queue') {
      return res.status(400).json({
        success: false,
        message: 'This line does not support appointments'
      });
    }
    
    const startTime = new Date(appointmentTime);
    const duration = line.appointmentSettings?.duration || 30;
    const endTime = new Date(startTime.getTime() + duration * 60000);
    
    // Check if user already has an appointment for this line
    const existingAppointment = await Appointment.findOne({
      line: line._id,
      user: req.userId,
      status: { $in: ['confirmed', 'pending'] }
    });
    
    if (existingAppointment) {
      return res.status(409).json({
        success: false,
        message: 'You already have an appointment for this line'
      });
    }
    
    // Check if slot is still available - improved overlap detection
    const conflictingAppointments = await Appointment.find({
      line: line._id,
      status: { $in: ['confirmed', 'pending', 'in_progress'] },
      $or: [
        // New appointment starts during existing appointment
        {
          appointmentTime: { $lte: startTime },
          endTime: { $gt: startTime }
        },
        // New appointment ends during existing appointment
        {
          appointmentTime: { $lt: endTime },
          endTime: { $gte: endTime }
        },
        // New appointment completely contains existing appointment
        {
          appointmentTime: { $gte: startTime },
          endTime: { $lte: endTime }
        },
        // Existing appointment completely contains new appointment
        {
          appointmentTime: { $lte: startTime },
          endTime: { $gte: endTime }
        }
      ]
    });
    
    if (conflictingAppointments.length > 0) {
      console.log(`Booking conflict detected for ${startTime.toISOString()} - ${endTime.toISOString()}`);
      console.log('Conflicting appointments:', conflictingAppointments.map(apt => ({
        start: apt.appointmentTime.toISOString(),
        end: apt.endTime.toISOString()
      })));
      
      return res.status(409).json({
        success: false,
        message: 'This time slot is no longer available due to overlapping appointments'
      });
    }
    
    // Create appointment
    const appointment = new Appointment({
      line: line._id,
      user: req.userId,
      appointmentTime: startTime,
      endTime: endTime,
      duration: duration,
      status: line.appointmentSettings?.autoConfirm ? 'confirmed' : 'pending',
      notes: notes || ''
    });
    
    await appointment.save();
    await appointment.populate(['line', 'user']);
    
    // Send SMS notification for appointment confirmation
    try {
      await notifyAppointmentUpdate(appointment._id, 'confirmed');
    } catch (notificationError) {
      console.error('Failed to send appointment confirmation SMS:', notificationError);
      // Don't fail the request if notification fails
    }
    
    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      appointment: {
        _id: appointment._id,
        appointmentTime: appointment.appointmentTime,
        endTime: appointment.endTime,
        duration: appointment.duration,
        status: appointment.status,
        notes: appointment.notes,
        line: {
          _id: appointment.line._id,
          title: appointment.line.title,
          lineCode: appointment.line.lineCode
        }
      }
    });
    
  } catch (error) {
    console.error('Book appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to book appointment'
    });
  }
};

// Get user's appointments
const getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({
      user: req.userId,
      status: { $in: ['confirmed', 'pending', 'in_progress'] },
      appointmentTime: { $gte: new Date() } // Only future appointments
    })
    .populate('line', 'title description lineCode serviceType')
    .sort({ appointmentTime: 1 });
    
    res.json({
      success: true,
      appointments: appointments.map(appointment => ({
        _id: appointment._id,
        appointmentTime: appointment.appointmentTime,
        endTime: appointment.endTime,
        duration: appointment.duration,
        status: appointment.status,
        notes: appointment.notes,
        canCancel: appointment.canBeCancelled(),
        line: appointment.line
      }))
    });
    
  } catch (error) {
    console.error('Get my appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get appointments'
    });
  }
};

// Cancel appointment
const cancelAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { reason } = req.body;
    
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      user: req.userId
    }).populate('line');
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }
    
    if (!appointment.canBeCancelled()) {
      return res.status(400).json({
        success: false,
        message: 'Appointment cannot be cancelled (too close to appointment time)'
      });
    }
    
    appointment.status = 'cancelled';
    appointment.cancelledAt = new Date();
    appointment.cancellationReason = reason || '';
    
    await appointment.save();
    
    res.json({
      success: true,
      message: 'Appointment cancelled successfully'
    });
    
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel appointment'
    });
  }
};

// Get line appointments (for creator)
const getLineAppointments = async (req, res) => {
  try {
    const { lineId } = req.params;
    const { date, status } = req.query;
    
    // Verify line belongs to user
    const line = await Line.findOne({
      _id: lineId,
      creator: req.userId
    });
    
    if (!line) {
      return res.status(404).json({
        success: false,
        message: 'Line not found or access denied'
      });
    }
    
    let query = { line: lineId };
    
    // Filter by date if provided
    if (date) {
      const startOfDay = new Date(`${date}T00:00:00.000Z`);
      const endOfDay = new Date(`${date}T23:59:59.999Z`);
      query.appointmentTime = { $gte: startOfDay, $lte: endOfDay };
    }
    
    // Filter by status if provided
    if (status) {
      query.status = status;
    }
    
    const appointments = await Appointment.find(query)
      .populate('user', 'name phone userId')
      .sort({ appointmentTime: 1 });
    
    res.json({
      success: true,
      appointments: appointments.map(appointment => ({
        _id: appointment._id,
        appointmentTime: appointment.appointmentTime,
        endTime: appointment.endTime,
        duration: appointment.duration,
        status: appointment.status,
        notes: appointment.notes,
        user: appointment.user,
        createdAt: appointment.createdAt
      }))
    });
    
  } catch (error) {
    console.error('Get line appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get line appointments'
    });
  }
};

// Mark appointment as completed
const markAppointmentCompleted = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    
    const appointment = await Appointment.findById(appointmentId).populate('line');
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }
    
    // Verify line belongs to user
    if (appointment.line.creator.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    appointment.status = 'completed';
    await appointment.save();
    
    res.json({
      success: true,
      message: 'Appointment marked as completed'
    });
    
  } catch (error) {
    console.error('Mark appointment completed error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark appointment as completed'
    });
  }
};

module.exports = {
  getAvailableSlots,
  bookAppointment,
  getMyAppointments,
  cancelAppointment,
  getLineAppointments,
  markAppointmentCompleted
};
