// ===== backend/src/models/Appointment.js =====
// Create this as a NEW FILE

const mongoose = require('mongoose');

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
  
  return hoursUntilAppointment > 2; // Default 2 hours cancellation policy
};

// Method to check if appointment is upcoming
appointmentSchema.methods.isUpcoming = function() {
  const now = new Date();
  const appointmentTime = new Date(this.appointmentTime);
  return appointmentTime > now && this.status === 'confirmed';
};

module.exports = mongoose.model('Appointment', appointmentSchema);