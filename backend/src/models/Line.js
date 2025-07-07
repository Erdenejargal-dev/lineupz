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
  // For temporary codes - when to regenerate
  codeExpiresAt: {
    type: Date
  },
  // Availability schedule
  availability: {
    isActive: {
      type: Boolean,
      default: true
    },
    schedule: [{
      day: {
        type: String,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      },
      startTime: String, // "09:00"
      endTime: String,   // "17:00"
      isAvailable: {
        type: Boolean,
        default: true
      }
    }],
    // Special dates (holidays, breaks, etc.)
    specialDates: [{
      date: Date,
      isAvailable: Boolean,
      note: String
    }]
  },
  // Line settings
  settings: {
    maxCapacity: {
      type: Number,
      default: 50
    },
    estimatedServiceTime: {
      type: Number, // in minutes
      default: 5
    },
    allowJoining: {
      type: Boolean,
      default: true
    },
    autoRemoveAfterMinutes: {
      type: Number,
      default: 60 // Auto-remove people after 1 hour without being marked visited
    }
  },
  // Stats
  stats: {
    totalJoined: {
      type: Number,
      default: 0
    },
    totalServed: {
      type: Number,
      default: 0
    },
    averageWaitTime: {
      type: Number,
      default: 0
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Generate unique 6-digit code before saving
lineSchema.pre('save', async function(next) {
  if (this.isNew && !this.lineCode) {
    try {
      this.lineCode = await this.constructor.generateUniqueCode();
    } catch (error) {
      return next(error);
    }
  }
  
  // Set expiration for temporary codes
  if (this.codeType === 'temporary' && !this.codeExpiresAt) {
    this.codeExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  }
  
  next();
});

// Generate unique 6-digit code
lineSchema.statics.generateUniqueCode = async function() {
  let code;
  let exists = true;
  
  while (exists) {
    code = Math.floor(100000 + Math.random() * 900000).toString();
    const existingLine = await this.findOne({ lineCode: code });
    exists = !!existingLine;
  }
  
  return code;
};

// Regenerate code for temporary codes
lineSchema.methods.regenerateCode = async function() {
  this.lineCode = await this.constructor.generateUniqueCode();
  if (this.codeType === 'temporary') {
    this.codeExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  }
  await this.save();
  return this.lineCode;
};

// Check if line is currently available
lineSchema.methods.isCurrentlyAvailable = function() {
  if (!this.availability.isActive) return false;
  
  const now = new Date();
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const currentDay = days[now.getDay()]; // Get current day name
  const currentTime = now.toTimeString().substring(0, 5); // "14:30"
  
  // Check special dates first
  const todaySpecial = this.availability.specialDates.find(date => 
    date.date.toDateString() === now.toDateString()
  );
  if (todaySpecial) return todaySpecial.isAvailable;
  
  // Check regular schedule
  const todaySchedule = this.availability.schedule.find(day => 
    day.day === currentDay
  );
  
  if (!todaySchedule || !todaySchedule.isAvailable) return false;
  
  return currentTime >= todaySchedule.startTime && currentTime <= todaySchedule.endTime;
};

// Get current queue count
lineSchema.methods.getCurrentQueueCount = async function() {
  const LineJoiner = mongoose.model('LineJoiner');
  return await LineJoiner.countDocuments({ 
    line: this._id, 
    status: 'waiting' 
  });
};

// Get estimated wait time
lineSchema.methods.getEstimatedWaitTime = async function() {
  const queueCount = await this.getCurrentQueueCount();
  return queueCount * this.settings.estimatedServiceTime;
};

module.exports = mongoose.model('Line', lineSchema);