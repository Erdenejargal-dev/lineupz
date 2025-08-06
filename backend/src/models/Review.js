const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  business: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  line: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Line',
    required: true
  },
  // Reference to the queue entry or appointment
  queueEntry: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LineJoiner',
    default: null
  },
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    default: null
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    maxlength: 500,
    trim: true
  },
  serviceType: {
    type: String,
    enum: ['queue', 'appointment'],
    required: true
  },
  // Service quality aspects
  aspects: {
    waitTime: {
      type: Number,
      min: 1,
      max: 5
    },
    serviceQuality: {
      type: Number,
      min: 1,
      max: 5
    },
    staff: {
      type: Number,
      min: 1,
      max: 5
    },
    cleanliness: {
      type: Number,
      min: 1,
      max: 5
    }
  },
  // Metadata
  isAnonymous: {
    type: Boolean,
    default: false
  },
  isVerified: {
    type: Boolean,
    default: true // Since they actually used the service
  },
  businessResponse: {
    message: {
      type: String,
      maxlength: 300
    },
    respondedAt: Date,
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  // Status
  status: {
    type: String,
    enum: ['active', 'hidden', 'reported'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Indexes for performance
reviewSchema.index({ business: 1, createdAt: -1 });
reviewSchema.index({ reviewer: 1, createdAt: -1 });
reviewSchema.index({ line: 1, createdAt: -1 });
reviewSchema.index({ rating: 1 });

// Calculate average rating for a business
reviewSchema.statics.getBusinessAverageRating = async function(businessId) {
  const result = await this.aggregate([
    { $match: { business: new mongoose.Types.ObjectId(businessId), status: 'active' } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
        ratingDistribution: {
          $push: '$rating'
        }
      }
    }
  ]);

  if (result.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };
  }

  const data = result[0];
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  
  data.ratingDistribution.forEach(rating => {
    distribution[rating] = (distribution[rating] || 0) + 1;
  });

  return {
    averageRating: Math.round(data.averageRating * 10) / 10,
    totalReviews: data.totalReviews,
    ratingDistribution: distribution
  };
};

// Get recent reviews for a business
reviewSchema.statics.getBusinessReviews = async function(businessId, limit = 10, skip = 0) {
  return this.find({ 
    business: businessId, 
    status: 'active' 
  })
  .populate('reviewer', 'name userId')
  .populate('line', 'title')
  .sort({ createdAt: -1 })
  .limit(limit)
  .skip(skip);
};

// Check if user can review (hasn't reviewed this service yet)
reviewSchema.statics.canUserReview = async function(userId, businessId, queueEntryId, appointmentId) {
  const existingReview = await this.findOne({
    reviewer: userId,
    business: businessId,
    $or: [
      { queueEntry: queueEntryId },
      { appointment: appointmentId }
    ]
  });

  return !existingReview;
};

module.exports = mongoose.model('Review', reviewSchema);
