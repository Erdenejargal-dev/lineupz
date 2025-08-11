const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema({
  // Business Information
  name: {
    type: String,
    required: [true, 'Business name is required'],
    trim: true,
    maxlength: [100, 'Business name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  category: {
    type: String,
    enum: ['salon', 'clinic', 'restaurant', 'retail', 'service', 'other'],
    required: true
  },
  
  // Contact Information
  contact: {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: { type: String, default: 'Mongolia' }
    },
    website: String
  },
  
  // Business Owner/Manager
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Subscription Plan
  subscription: {
    plan: {
      type: String,
      enum: ['starter', 'professional', 'enterprise'],
      required: true
    },
    maxArtists: {
      type: Number,
      required: true
    },
    maxLinesPerArtist: {
      type: Number,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date,
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    paymentId: String // BYL payment reference
  },
  
  // Join Requests Management
  joinRequests: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    requestedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'declined'],
      default: 'pending'
    },
    message: {
      type: String,
      trim: true,
      maxlength: 500
    },
    respondedAt: Date,
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],

  // Artists/Staff Management
  artists: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['artist', 'manager', 'staff'],
      default: 'artist'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    },
    permissions: {
      canCreateLines: { type: Boolean, default: true },
      canManageQueue: { type: Boolean, default: true },
      canViewAnalytics: { type: Boolean, default: false },
      canManageArtists: { type: Boolean, default: false }
    }
  }],
  
  // Business Settings
  settings: {
    timezone: {
      type: String,
      default: 'Asia/Ulaanbaatar'
    },
    currency: {
      type: String,
      default: 'MNT'
    },
    language: {
      type: String,
      default: 'mn'
    },
    branding: {
      logo: String,
      primaryColor: { type: String, default: '#3B82F6' },
      secondaryColor: { type: String, default: '#10B981' }
    }
  },
  
  // Statistics
  stats: {
    totalLines: { type: Number, default: 0 },
    totalCustomers: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 }
  },
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'active', 'suspended', 'cancelled'],
    default: 'pending'
  },
  
  // Verification
  verification: {
    isVerified: { type: Boolean, default: false },
    verifiedAt: Date,
    documents: [{
      type: String,
      url: String,
      uploadedAt: { type: Date, default: Date.now }
    }]
  }
}, {
  timestamps: true
});

// Indexes
businessSchema.index({ owner: 1 });
businessSchema.index({ 'artists.user': 1 });
businessSchema.index({ status: 1 });
businessSchema.index({ 'subscription.isActive': 1 });

// Virtual for current artist count
businessSchema.virtual('currentArtistCount').get(function() {
  return this.artists ? this.artists.filter(artist => artist.isActive).length : 0;
});

// Method to check if business can add more artists
businessSchema.methods.canAddArtist = function() {
  return this.currentArtistCount < this.subscription.maxArtists;
};

// Method to add artist to business
businessSchema.methods.addArtist = function(userId, role = 'artist') {
  if (!this.canAddArtist()) {
    throw new Error('Maximum artist limit reached for current plan');
  }
  
  // Check if user is already an artist
  const existingArtist = this.artists.find(artist => 
    artist.user.toString() === userId.toString()
  );
  
  if (existingArtist) {
    if (!existingArtist.isActive) {
      existingArtist.isActive = true;
      return existingArtist;
    }
    throw new Error('User is already an artist in this business');
  }
  
  const newArtist = {
    user: userId,
    role: role,
    joinedAt: new Date(),
    isActive: true,
    permissions: {
      canCreateLines: true,
      canManageQueue: true,
      canViewAnalytics: role === 'manager',
      canManageArtists: role === 'manager'
    }
  };
  
  this.artists.push(newArtist);
  return newArtist;
};

// Method to remove artist from business
businessSchema.methods.removeArtist = function(userId) {
  const artistIndex = this.artists.findIndex(artist => 
    artist.user.toString() === userId.toString()
  );
  
  if (artistIndex === -1) {
    throw new Error('Artist not found in this business');
  }
  
  this.artists[artistIndex].isActive = false;
  return this.artists[artistIndex];
};

// Method to check if subscription is active
businessSchema.methods.isSubscriptionActive = function() {
  return this.subscription.isActive && 
         this.subscription.endDate > new Date() &&
         this.status === 'active';
};

// Method to get artist statistics
businessSchema.methods.getArtistStats = async function(artistId) {
  const Line = require('./Line');
  const LineJoiner = require('./LineJoiner');
  
  // Get lines created by this artist
  const artistLines = await Line.find({
    creator: artistId,
    // Add business reference when we update Line model
  });
  
  // Get total customers served
  const totalCustomers = await LineJoiner.countDocuments({
    line: { $in: artistLines.map(line => line._id) },
    status: 'served'
  });
  
  // Get total revenue (if lines have pricing)
  const revenueData = await LineJoiner.aggregate([
    {
      $lookup: {
        from: 'lines',
        localField: 'line',
        foreignField: '_id',
        as: 'lineInfo'
      }
    },
    {
      $match: {
        'lineInfo.creator': artistId,
        status: 'served',
        paymentStatus: 'paid'
      }
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$amountPaid' }
      }
    }
  ]);
  
  return {
    totalLines: artistLines.length,
    totalCustomers,
    totalRevenue: revenueData[0]?.totalRevenue || 0,
    averageCustomersPerLine: artistLines.length > 0 ? totalCustomers / artistLines.length : 0
  };
};

module.exports = mongoose.model('Business', businessSchema);
