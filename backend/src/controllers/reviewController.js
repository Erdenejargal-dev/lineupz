const Review = require('../models/Review');
const LineJoiner = require('../models/LineJoiner');
const Appointment = require('../models/Appointment');
const Line = require('../models/Line');
const User = require('../models/User');

// Submit a review
const submitReview = async (req, res) => {
  try {
    const {
      businessId,
      lineId,
      queueEntryId,
      appointmentId,
      rating,
      comment,
      serviceType,
      aspects,
      isAnonymous
    } = req.body;

    // Validate required fields
    if (!businessId || !lineId || !rating || !serviceType) {
      return res.status(400).json({
        success: false,
        message: 'Business ID, Line ID, rating, and service type are required'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    if (!['queue', 'appointment'].includes(serviceType)) {
      return res.status(400).json({
        success: false,
        message: 'Service type must be either "queue" or "appointment"'
      });
    }

    // Check if user can review (hasn't reviewed this service yet)
    const canReview = await Review.canUserReview(
      req.userId,
      businessId,
      queueEntryId,
      appointmentId
    );

    if (!canReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this service'
      });
    }

    // Verify the user actually used the service
    let serviceUsed = false;
    
    if (serviceType === 'queue' && queueEntryId) {
      const queueEntry = await LineJoiner.findOne({
        _id: queueEntryId,
        user: req.userId,
        status: { $in: ['served', 'completed'] }
      });
      serviceUsed = !!queueEntry;
    } else if (serviceType === 'appointment' && appointmentId) {
      const appointment = await Appointment.findOne({
        _id: appointmentId,
        user: req.userId,
        status: { $in: ['completed', 'attended'] }
      });
      serviceUsed = !!appointment;
    }

    if (!serviceUsed) {
      return res.status(400).json({
        success: false,
        message: 'You can only review services you have completed'
      });
    }

    // Create the review
    const review = new Review({
      reviewer: req.userId,
      business: businessId,
      line: lineId,
      queueEntry: queueEntryId || null,
      appointment: appointmentId || null,
      rating,
      comment: comment?.trim() || '',
      serviceType,
      aspects: aspects || {},
      isAnonymous: isAnonymous || false
    });

    await review.save();

    // Populate the review for response
    await review.populate([
      { path: 'reviewer', select: 'name userId' },
      { path: 'line', select: 'title' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      review: {
        _id: review._id,
        rating: review.rating,
        comment: review.comment,
        serviceType: review.serviceType,
        aspects: review.aspects,
        isAnonymous: review.isAnonymous,
        createdAt: review.createdAt,
        reviewer: review.isAnonymous ? null : review.reviewer,
        line: review.line
      }
    });

  } catch (error) {
    console.error('Submit review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit review'
    });
  }
};

// Get reviews for a business
const getBusinessReviews = async (req, res) => {
  try {
    const { businessId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const reviews = await Review.getBusinessReviews(
      businessId,
      parseInt(limit),
      skip
    );

    const averageData = await Review.getBusinessAverageRating(businessId);

    res.json({
      success: true,
      reviews: reviews.map(review => ({
        _id: review._id,
        rating: review.rating,
        comment: review.comment,
        serviceType: review.serviceType,
        aspects: review.aspects,
        isAnonymous: review.isAnonymous,
        createdAt: review.createdAt,
        reviewer: review.isAnonymous ? null : {
          name: review.reviewer?.name || 'Anonymous',
          userId: review.reviewer?.userId
        },
        line: review.line,
        businessResponse: review.businessResponse
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: reviews.length === parseInt(limit)
      },
      summary: averageData
    });

  } catch (error) {
    console.error('Get business reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get reviews'
    });
  }
};

// Get user's reviews
const getUserReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reviews = await Review.find({ reviewer: req.userId })
      .populate('business', 'name businessName')
      .populate('line', 'title')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    res.json({
      success: true,
      reviews: reviews.map(review => ({
        _id: review._id,
        rating: review.rating,
        comment: review.comment,
        serviceType: review.serviceType,
        aspects: review.aspects,
        createdAt: review.createdAt,
        business: {
          name: review.business?.businessName || review.business?.name || 'Business',
          _id: review.business?._id
        },
        line: review.line,
        businessResponse: review.businessResponse
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: reviews.length === parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get your reviews'
    });
  }
};

// Business owner: Respond to a review
const respondToReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { message } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Response message is required'
      });
    }

    if (message.length > 300) {
      return res.status(400).json({
        success: false,
        message: 'Response message cannot exceed 300 characters'
      });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if the user owns the business being reviewed
    if (review.business.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only respond to reviews of your business'
      });
    }

    // Update the review with business response
    review.businessResponse = {
      message: message.trim(),
      respondedAt: new Date(),
      respondedBy: req.userId
    };

    await review.save();

    res.json({
      success: true,
      message: 'Response added successfully',
      businessResponse: review.businessResponse
    });

  } catch (error) {
    console.error('Respond to review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to respond to review'
    });
  }
};

// Get reviewable services for a user (completed but not reviewed)
const getReviewableServices = async (req, res) => {
  try {
    const reviewableServices = [];

    // Get completed queue entries that haven't been reviewed
    const completedQueues = await LineJoiner.find({
      user: req.userId,
      status: { $in: ['served', 'completed'] }
    })
    .populate('line', 'title creator')
    .populate('line.creator', 'name businessName')
    .sort({ updatedAt: -1 });

    for (const queueEntry of completedQueues) {
      const canReview = await Review.canUserReview(
        req.userId,
        queueEntry.line.creator._id,
        queueEntry._id,
        null
      );

      if (canReview) {
        reviewableServices.push({
          _id: queueEntry._id,
          type: 'queue',
          serviceType: 'queue',
          line: {
            _id: queueEntry.line._id,
            title: queueEntry.line.title
          },
          business: {
            _id: queueEntry.line.creator._id,
            name: queueEntry.line.creator.businessName || queueEntry.line.creator.name
          },
          completedAt: queueEntry.updatedAt,
          position: queueEntry.position
        });
      }
    }

    // Get completed appointments that haven't been reviewed
    const completedAppointments = await Appointment.find({
      user: req.userId,
      status: { $in: ['completed', 'attended'] }
    })
    .populate('line', 'title creator')
    .populate('line.creator', 'name businessName')
    .sort({ updatedAt: -1 });

    for (const appointment of completedAppointments) {
      const canReview = await Review.canUserReview(
        req.userId,
        appointment.line.creator._id,
        null,
        appointment._id
      );

      if (canReview) {
        reviewableServices.push({
          _id: appointment._id,
          type: 'appointment',
          serviceType: 'appointment',
          line: {
            _id: appointment.line._id,
            title: appointment.line.title
          },
          business: {
            _id: appointment.line.creator._id,
            name: appointment.line.creator.businessName || appointment.line.creator.name
          },
          completedAt: appointment.updatedAt,
          appointmentTime: appointment.appointmentTime,
          duration: appointment.duration
        });
      }
    }

    // Sort by completion date (most recent first)
    reviewableServices.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));

    res.json({
      success: true,
      services: reviewableServices
    });

  } catch (error) {
    console.error('Get reviewable services error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get reviewable services'
    });
  }
};

module.exports = {
  submitReview,
  getBusinessReviews,
  getUserReviews,
  respondToReview,
  getReviewableServices
};
