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
  
  // NEW: Pricing settings for paid services
  pricing: {
    isPaid: {
      type: Boolean,
      default: false
    },
    price: {
      type: Number,
      min: [0, 'Price cannot be negative'],
      max: [1000000, 'Price cannot exceed 1,000,000'],
      validate: {
        validator: function(value) {
          // If isPaid is true, price must be greater than 0
          if (this.pricing?.isPaid && (!value || value <= 0)) {
            return false;
          }
          return true;
        },
        message: 'Price must be greater than 0 for paid services'
      }
    },
    currency: {
      type: String,
      enum: ['MNT', 'USD', 'EUR'],
      default: 'MNT'
    },
    paymentMethods: [{
      type: String,
      enum: ['byl', 'cash', 'card', 'bank_transfer'],
      default: 'byl'
    }],
    description: {
      type: String,
      trim: true,
      maxlength: [200, 'Price description cannot exceed 200 characters']
    },
    // For appointments: per appointment price
    // For queue: per service price
    priceType: {
      type: String,
      enum: ['per_service', 'per_appointment', 'per_hour'],
      default: 'per_service'
    }
  },
  
  // NEW: Appointment settings (only used for appointments/hybrid)
  appointmentSettings: {
    // Meeting type: in-person or online
    meetingType: {
      type: String,
      enum: ['in-person', 'online', 'both'],
      default: 'in-person'
    },
    // Physical location for in-person meetings
    location: {
      address: {
        type: String,
        trim: true
      },
      instructions: {
        type: String,
        trim: true,
        maxlength: 500
      }
    },
    // Online meeting settings
    onlineSettings: {
      platform: {
        type: String,
        enum: ['google-meet', 'zoom', 'teams', 'custom'],
        default: 'google-meet'
      },
      autoCreateMeeting: {
        type: Boolean,
        default: true
      },
      meetingInstructions: {
        type: String,
        trim: true,
        maxlength: 500
      }
    },
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
      required: function() {
        return this.serviceType === 'queue' || this.serviceType === 'hybrid' || !this.serviceType;
      },
      min: [1, 'Max capacity must be at least 1'],
      max: [200, 'Max capacity cannot exceed 200'],
      validate: {
        validator: function(value) {
          // Only validate if this is a queue or hybrid line
          if (this.serviceType === 'appointments') return true;
          return value && value >= 1 && value <= 200;
        },
        message: 'Max capacity must be between 1 and 200 for queue-based lines'
      }
    },
    estimatedServiceTime: {
      type: Number,
      required: function() {
        return this.serviceType === 'queue' || this.serviceType === 'hybrid' || !this.serviceType;
      },
      min: [1, 'Service time must be at least 1 minute'],
      max: [240, 'Service time cannot exceed 240 minutes'],
      validate: {
        validator: function(value) {
          // Only validate if this is a queue or hybrid line
          if (this.serviceType === 'appointments') return true;
          return value && value >= 1 && value <= 240;
        },
        message: 'Service time must be between 1 and 240 minutes for queue-based lines'
      }
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
  const currentDay = now.toLocaleDateString('en-US', { weekday: 'lowercase' });
  const currentTime = now.toTimeString().slice(0, 5);
  
  const todaySchedule = this.availability.schedule.find(s => s.day === currentDay);
  if (!todaySchedule || !todaySchedule.isAvailable) return false;
  
  return currentTime >= todaySchedule.startTime && currentTime <= todaySchedule.endTime;
};

// Method to get current queue count
lineSchema.methods.getCurrentQueueCount = async function() {
  const LineJoiner = require('./LineJoiner');
  return await LineJoiner.countDocuments({
    line: this._id,
    status: 'waiting'
  });
};

// Method to get estimated wait time
lineSchema.methods.getEstimatedWaitTime = async function() {
  const queueCount = await this.getCurrentQueueCount();
  const serviceTime = this.settings?.estimatedServiceTime || 5; // Default to 5 minutes
  return queueCount * serviceTime;
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
