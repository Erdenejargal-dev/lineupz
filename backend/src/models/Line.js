// ===== models/Line.js (Updated) =====
const mongoose = require('mongoose');

const lineSchema = new mongoose.Schema({
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Line title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  lineCode: {
    type: String,
    required: true,
    unique: true,
    length: 6
  },
  codeType: {
    type: String,
    enum: ['stable', 'temporary'],
    default: 'stable'
  },
  
  // NEW: Service type field
  serviceType: {
    type: String,
    enum: ['queue', 'appointments', 'hybrid'],
    default: 'queue'
  },
  
  // NEW: Appointment settings (only used for appointments/hybrid)
  appointmentSettings: {
    duration: {
      type: Number,
      default: 30,
      min: 5,
      max: 480 // 8 hours max
    },
    advanceBookingDays: {
      type: Number,
      default: 7,
      min: 0,
      max: 90
    },
    slotInterval: {
      type: Number,
      default: 15,
      enum: [15, 30, 60] // 15min, 30min, 1hour
    },
    bufferTime: {
      type: Number,
      default: 5,
      min: 0,
      max: 60
    },
    cancellationHours: {
      type: Number,
      default: 2,
      min: 0,
      max: 72
    },
    autoConfirm: {
      type: Boolean,
      default: true
    },
    maxConcurrentAppointments: {
      type: Number,
      default: 1,
      min: 1,
      max: 10
    }
  },
  
  settings: {
    maxCapacity: {
      type: Number,
      required: true,
      min: 1,
      max: 200
    },
    estimatedServiceTime: {
      type: Number,
      required: true,
      min: 1,
      max: 240
    }
  },
  
  availability: {
    isActive: {
      type: Boolean,
      default: true
    },
    schedule: [{
      day: {
        type: String,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        required: true
      },
      startTime: {
        type: String,
        required: true,
        match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
      },
      endTime: {
        type: String,
        required: true,
        match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
      },
      isAvailable: {
        type: Boolean,
        default: true
      }
    }]
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Statistics
  totalServed: {
    type: Number,
    default: 0
  },
  totalJoined: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Virtual for current queue count
lineSchema.virtual('currentQueueCount').get(function() {
  return this.queueCount || 0;
});

// Method to check if line is currently available
lineSchema.methods.isCurrentlyAvailable = function() {
  if (!this.isActive || !this.availability.isActive) return false;
  
  const now = new Date();
  const currentDay = now.toLocaleLowerCase().slice(0, 3) + now.toLocaleLowerCase().slice(3);
  const currentTime = now.toTimeString().slice(0, 5);
  
  const todaySchedule = this.availability.schedule.find(s => s.day === currentDay);
  if (!todaySchedule || !todaySchedule.isAvailable) return false;
  
  return currentTime >= todaySchedule.startTime && currentTime <= todaySchedule.endTime;
};

// Method to get available appointment slots
lineSchema.methods.getAvailableSlots = function(date) {
  if (this.serviceType === 'queue') return [];
  
  const slots = [];
  const targetDate = new Date(date);
  const dayName = targetDate.toLocaleDateString('en-US', { weekday: 'lowercase' });
  
  const daySchedule = this.availability.schedule.find(s => s.day === dayName);
  if (!daySchedule || !daySchedule.isAvailable) return slots;
  
  const startTime = new Date(`${date}T${daySchedule.startTime}:00`);
  const endTime = new Date(`${date}T${daySchedule.endTime}:00`);
  
  const slotDuration = this.appointmentSettings.duration;
  const slotInterval = this.appointmentSettings.slotInterval;
  
  let currentSlot = new Date(startTime);
  
  while (currentSlot < endTime) {
    const slotEnd = new Date(currentSlot.getTime() + slotDuration * 60000);
    if (slotEnd <= endTime) {
      slots.push({
        startTime: new Date(currentSlot),
        endTime: new Date(slotEnd),
        available: true // This would be checked against existing appointments
      });
    }
    currentSlot = new Date(currentSlot.getTime() + slotInterval * 60000);
  }
  
  return slots;
};

module.exports = mongoose.model('Line', lineSchema);

// ===== models/Appointment.js (New Model) =====
const appointmentSchema = new mongoose.Schema({
  line: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Line',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Appointment timing
  appointmentTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  duration: {
    type: Number,
    required: true,
    min: 5,
    max: 480
  },
  
  // Status tracking
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'],
    default: 'confirmed'
  },
  
  // Booking metadata
  bookingType: {
    type: String,
    enum: ['appointment', 'queue_converted'],
    default: 'appointment'
  },
  
  // Additional info
  notes: {
    type: String,
    maxlength: 500
  },
  
  // Notifications
  reminderSent: {
    type: Boolean,
    default: false
  },
  confirmationSent: {
    type: Boolean,
    default: false
  },
  
  // Cancellation
  cancelledAt: Date,
  cancellationReason: String,
  
  // No-show tracking
  noShowAt: Date
}, {
  timestamps: true
});

// Index for efficient queries
appointmentSchema.index({ line: 1, appointmentTime: 1 });
appointmentSchema.index({ user: 1, appointmentTime: 1 });
appointmentSchema.index({ appointmentTime: 1, status: 1 });

// Virtual for formatted time
appointmentSchema.virtual('formattedTime').get(function() {
  return this.appointmentTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
});

// Method to check if appointment can be cancelled
appointmentSchema.methods.canBeCancelled = function() {
  if (this.status === 'cancelled' || this.status === 'completed') return false;
  
  const now = new Date();
  const appointmentTime = new Date(this.appointmentTime);
  const hoursUntilAppointment = (appointmentTime - now) / (1000 * 60 * 60);
  
  return hoursUntilAppointment > (this.line?.appointmentSettings?.cancellationHours || 2);
};

// Method to check if appointment is upcoming
appointmentSchema.methods.isUpcoming = function() {
  const now = new Date();
  const appointmentTime = new Date(this.appointmentTime);
  return appointmentTime > now && this.status === 'confirmed';
};

module.exports = mongoose.model('Appointment', appointmentSchema);

// ===== controllers/appointmentController.js (New Controller) =====
const Appointment = require('../models/Appointment');
const Line = require('../models/Line');

// Get available slots for a line on a specific date
const getAvailableSlots = async (req, res) => {
  try {
    const { lineId } = req.params;
    const { date } = req.query; // YYYY-MM-DD format
    
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date parameter is required'
      });
    }
    
    const line = await Line.findById(lineId);
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
    
    // Get theoretical slots from line schedule
    const theoreticalSlots = line.getAvailableSlots(date);
    
    // Get existing appointments for this date
    const startOfDay = new Date(`${date}T00:00:00.000Z`);
    const endOfDay = new Date(`${date}T23:59:59.999Z`);
    
    const existingAppointments = await Appointment.find({
      line: lineId,
      appointmentTime: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      status: { $in: ['confirmed', 'in_progress'] }
    });
    
    // Mark slots as unavailable if they conflict with existing appointments
    const availableSlots = theoreticalSlots.map(slot => {
      const isConflict = existingAppointments.some(appointment => {
        const appointmentStart = new Date(appointment.appointmentTime);
        const appointmentEnd = new Date(appointment.endTime);
        
        return (slot.startTime < appointmentEnd && slot.endTime > appointmentStart);
      });
      
      return {
        ...slot,
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
    const { lineId, appointmentTime, notes } = req.body;
    
    const line = await Line.findById(lineId);
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
    const endTime = new Date(startTime.getTime() + line.appointmentSettings.duration * 60000);
    
    // Check if slot is available
    const conflictingAppointment = await Appointment.findOne({
      line: lineId,
      $or: [
        {
          appointmentTime: { $lt: endTime },
          endTime: { $gt: startTime }
        }
      ],
      status: { $in: ['confirmed', 'in_progress'] }
    });
    
    if (conflictingAppointment) {
      return res.status(409).json({
        success: false,
        message: 'This time slot is no longer available'
      });
    }
    
    // Create appointment
    const appointment = new Appointment({
      line: lineId,
      user: req.userId,
      appointmentTime: startTime,
      endTime: endTime,
      duration: line.appointmentSettings.duration,
      status: line.appointmentSettings.autoConfirm ? 'confirmed' : 'pending',
      notes: notes || ''
    });
    
    await appointment.save();
    await appointment.populate(['line', 'user']);
    
    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      appointment
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
      status: { $in: ['confirmed', 'pending', 'in_progress'] }
    })
    .populate('line', 'title description lineCode serviceType')
    .sort({ appointmentTime: 1 });
    
    res.json({
      success: true,
      appointments
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

module.exports = {
  getAvailableSlots,
  bookAppointment,
  getMyAppointments,
  cancelAppointment
};