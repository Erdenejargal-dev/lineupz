const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    trim: true,
    match: [/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number']
  },
  userId: {
    type: String,
    unique: true,
    required: true
  },
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  name: {
    type: String,
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  // Optional profile info
  profilePicture: String,
  isActive: {
    type: Boolean,
    default: true
  },
  // Enhanced profile fields
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address']
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  
  // Business Affiliation
  businessAffiliation: {
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business'
    },
    role: {
      type: String,
      enum: ['owner', 'manager', 'artist', 'staff'],
      default: 'artist'
    },
    joinedAt: Date,
    isActive: {
      type: Boolean,
      default: true
    }
  },
  
  // Creator status (individual or business-affiliated)
  isCreator: {
    type: Boolean,
    default: false
  },
  
  // Service customization defaults
  defaultServiceSettings: {
    appointmentDuration: {
      type: Number,
      default: 30,
      min: 15,
      max: 480
    },
    slotInterval: {
      type: Number,
      default: 30,
      enum: [15, 30, 60]
    },
    advanceBookingDays: {
      type: Number,
      default: 7,
      min: 1,
      max: 90
    },
    cancellationHours: {
      type: Number,
      default: 2,
      min: 0,
      max: 72
    },
    autoConfirmAppointments: {
      type: Boolean,
      default: true
    },
    pricing: {
      enabled: {
        type: Boolean,
        default: false
      },
      currency: {
        type: String,
        default: 'USD'
      },
      defaultPrice: {
        type: Number,
        default: 0,
        min: 0
      }
    }
  },
  
  // Notification preferences
  notificationPreferences: {
    email: {
      enabled: {
        type: Boolean,
        default: true
      },
      appointmentConfirmations: {
        type: Boolean,
        default: true
      },
      appointmentReminders: {
        type: Boolean,
        default: true
      },
      appointmentCancellations: {
        type: Boolean,
        default: true
      },
      queueUpdates: {
        type: Boolean,
        default: false
      }
    },
    sms: {
      enabled: {
        type: Boolean,
        default: true
      },
      appointmentConfirmations: {
        type: Boolean,
        default: true
      },
      appointmentReminders: {
        type: Boolean,
        default: true
      },
      appointmentCancellations: {
        type: Boolean,
        default: true
      },
      queueUpdates: {
        type: Boolean,
        default: true
      }
    }
  },
  
  // Google Calendar integration
  googleCalendar: {
    connected: {
      type: Boolean,
      default: false
    },
    accessToken: String,
    refreshToken: String,
    calendarId: String,
    syncEnabled: {
      type: Boolean,
      default: false
    },
    lastSyncAt: Date,
    connectedAt: Date
  },
  
  // Onboarding progress
  onboardingCompleted: {
    type: Boolean,
    default: false
  },
  onboardingSteps: {
    profileSetup: {
      type: Boolean,
      default: false
    },
    businessInfo: {
      type: Boolean,
      default: false
    },
    serviceSettings: {
      type: Boolean,
      default: false
    },
    notificationPrefs: {
      type: Boolean,
      default: false
    },
    calendarConnection: {
      type: Boolean,
      default: false
    }
  },
  // Stats
  totalLinesCreated: {
    type: Number,
    default: 0
  },
  totalTimesJoined: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Generate unique userId before saving
userSchema.pre('save', async function(next) {
  if (this.isNew && !this.userId) {
    let userId;
    let isUnique = false;
    
    // Keep generating until we find a unique userId
    while (!isUnique) {
      userId = this.generateUserId();
      const existingUser = await this.constructor.findOne({ userId });
      if (!existingUser) {
        isUnique = true;
      }
    }
    
    this.userId = userId;
  }
  next();
});

// Generate unique user ID (8 characters: letters + numbers)
userSchema.methods.generateUserId = function() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Hide sensitive information when converting to JSON
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.phone; // Hide phone number in responses
  return user;
};

// Get public profile (what others see when joining lines)
userSchema.methods.getPublicProfile = function() {
  return {
    userId: this.userId,
    name: this.name || 'Anonymous',
    businessName: this.businessName,
    businessDescription: this.businessDescription,
    isCreator: this.isCreator
  };
};

module.exports = mongoose.model('User', userSchema);
