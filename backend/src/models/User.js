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
  // Creator-specific fields
  businessName: String,
  businessDescription: String,
  isCreator: {
    type: Boolean,
    default: false
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