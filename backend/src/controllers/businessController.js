const Business = require('../models/Business');
const User = require('../models/User');
const { bylService } = require('../services/bylService');

// Business subscription plans
const BUSINESS_PLANS = {
  starter: {
    name: 'Starter Plan',
    maxArtists: 5,
    maxLinesPerArtist: 3,
    price: 120000, // ₮120,000
    features: ['Basic queue management', 'SMS notifications', 'Basic analytics', '3 lines per artist']
  },
  professional: {
    name: 'Professional Plan', 
    maxArtists: 8,
    maxLinesPerArtist: 10,
    price: 200000, // ₮200,000
    features: ['Advanced queue management', 'SMS & Email notifications', 'Advanced analytics', 'Calendar integration', '10 lines per artist']
  },
  enterprise: {
    name: 'Enterprise Plan',
    maxArtists: 12,
    maxLinesPerArtist: 999,
    price: 250000, // ₮250,000
    features: ['Full queue management', 'All notifications', 'Complete analytics', 'Calendar integration', 'Priority support', 'Unlimited lines per artist']
  }
};

// Get all business plans
const getBusinessPlans = async (req, res) => {
  try {
    res.json({
      success: true,
      plans: BUSINESS_PLANS
    });
  } catch (error) {
    console.error('Error fetching business plans:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch business plans'
    });
  }
};

// Register a new business
const registerBusiness = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      contact,
      plan
    } = req.body;

    const userId = req.user.id;

    // Validate plan
    if (!BUSINESS_PLANS[plan]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid business plan selected'
      });
    }

    // Check if user already owns a business
    const existingBusiness = await Business.findOne({ owner: userId });
    if (existingBusiness) {
      return res.status(400).json({
        success: false,
        message: 'You already own a business'
      });
    }

    const planDetails = BUSINESS_PLANS[plan];
    
    // Calculate subscription end date (1 year from now)
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 1);

    // Create business
    const business = new Business({
      name,
      description,
      category,
      contact,
      owner: userId,
      subscription: {
        plan,
        maxArtists: planDetails.maxArtists,
        maxLinesPerArtist: planDetails.maxLinesPerArtist,
        price: planDetails.price,
        endDate,
        isActive: false // Will be activated after payment
      },
      status: 'pending'
    });

    await business.save();

    // Create BYL payment for business subscription
    const bylPayment = await bylService.createPayment({
      amount: planDetails.price,
      currency: 'MNT',
      description: `Business Registration - ${planDetails.name}`,
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/business/payment/success?businessId=${business._id}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/business/payment/cancel?businessId=${business._id}`,
      metadata: {
        businessId: business._id.toString(),
        userId: userId,
        type: 'business_registration'
      }
    });

    res.json({
      success: true,
      business: {
        id: business._id,
        name: business.name,
        plan: business.subscription.plan,
        price: business.subscription.price
      },
      paymentUrl: bylPayment.checkout_url
    });

  } catch (error) {
    console.error('Error registering business:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register business'
    });
  }
};

// Get user's business information
const getUserBusiness = async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if user owns a business
    const ownedBusiness = await Business.findOne({ owner: userId })
      .populate('artists.user', 'name email userId');

    // Check if user is affiliated with a business
    const affiliatedBusiness = await Business.findOne({
      'artists.user': userId,
      'artists.isActive': true
    }).populate('owner', 'name email userId');

    res.json({
      success: true,
      ownedBusiness,
      affiliatedBusiness: affiliatedBusiness ? {
        id: affiliatedBusiness._id,
        name: affiliatedBusiness.name,
        owner: affiliatedBusiness.owner,
        role: affiliatedBusiness.artists.find(a => a.user._id.toString() === userId)?.role
      } : null
    });

  } catch (error) {
    console.error('Error fetching user business:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch business information'
    });
  }
};

// Send join request to business
const sendJoinRequest = async (req, res) => {
  try {
    const { businessName, message } = req.body;
    const userId = req.user.id;

    // Find business by name
    const business = await Business.findOne({ 
      name: { $regex: new RegExp(businessName, 'i') },
      status: 'active'
    }).populate('owner', 'name email');

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found or not active'
      });
    }

    // Check if user already has a pending request
    const existingRequest = business.joinRequests.find(req => 
      req.user.toString() === userId && req.status === 'pending'
    );

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending request to this business'
      });
    }

    // Check if user is already an artist
    const existingArtist = business.artists.find(artist => 
      artist.user.toString() === userId && artist.isActive
    );

    if (existingArtist) {
      return res.status(400).json({
        success: false,
        message: 'You are already part of this business'
      });
    }

    // Get user info for email
    const user = await User.findById(userId);

    // Add join request
    business.joinRequests.push({
      user: userId,
      message: message || '',
      status: 'pending',
      requestedAt: new Date()
    });

    await business.save();

    // Send email notification to business owner
    const emailService = require('../services/emailService');
    try {
      await emailService.sendEmail({
        to: business.contact.email,
        subject: `New Artist Join Request - ${business.name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #3B82F6;">New Artist Join Request</h2>
            
            <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Request Details</h3>
              <p><strong>Artist Name:</strong> ${user.name || 'Not provided'}</p>
              <p><strong>Phone:</strong> ${user.phone}</p>
              <p><strong>Email:</strong> ${user.email || 'Not provided'}</p>
              <p><strong>User ID:</strong> ${user.userId}</p>
              ${message ? `<p><strong>Message:</strong> ${message}</p>` : ''}
              <p><strong>Requested At:</strong> ${new Date().toLocaleString()}</p>
            </div>

            <div style="background: #EFF6FF; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #1E40AF;">Action Required</h3>
              <p>Please log in to your business dashboard to review and respond to this request.</p>
              <p>You can approve or decline this request from your dashboard.</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_BASE_URL}/business/dashboard" 
                 style="background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                View Dashboard
              </a>
            </div>

            <hr style="margin: 30px 0; border: none; border-top: 1px solid #E5E7EB;">
            <p style="color: #6B7280; font-size: 14px; text-align: center;">
              This is an automated message from Tabi Business Management System.
            </p>
          </div>
        `
      });
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError);
      // Continue even if email fails
    }

    res.json({
      success: true,
      message: 'Join request sent successfully. The business owner will review your request.',
      business: {
        id: business._id,
        name: business.name
      }
    });

  } catch (error) {
    console.error('Error sending join request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send join request'
    });
  }
};

// Get join requests for a business
const getJoinRequests = async (req, res) => {
  try {
    const { businessId } = req.params;
    const userId = req.user.id;

    const business = await Business.findById(businessId)
      .populate('joinRequests.user', 'name email phone userId')
      .populate('joinRequests.respondedBy', 'name');

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    // Check if user is owner or manager
    const isOwner = business.owner.toString() === userId;
    const userArtist = business.artists.find(a => a.user.toString() === userId);
    const canManage = userArtist?.permissions.canManageArtists;

    if (!isOwner && !canManage) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      requests: business.joinRequests.sort((a, b) => b.requestedAt - a.requestedAt)
    });

  } catch (error) {
    console.error('Error fetching join requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch join requests'
    });
  }
};

// Respond to join request (approve/decline)
const respondToJoinRequest = async (req, res) => {
  try {
    const { businessId, requestId } = req.params;
    const { action } = req.body; // 'approve' or 'decline'
    const userId = req.user.id;

    const business = await Business.findById(businessId)
      .populate('joinRequests.user', 'name email phone userId');

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    // Check if user is owner or manager
    const isOwner = business.owner.toString() === userId;
    const userArtist = business.artists.find(a => a.user.toString() === userId);
    const canManage = userArtist?.permissions.canManageArtists;

    if (!isOwner && !canManage) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Find the request
    const request = business.joinRequests.id(requestId);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Join request not found'
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Request has already been responded to'
      });
    }

    // Update request status
    request.status = action;
    request.respondedAt = new Date();
    request.respondedBy = userId;

    if (action === 'approve') {
      // Check if business can add more artists
      if (!business.canAddArtist()) {
        return res.status(400).json({
          success: false,
          message: 'Business has reached maximum artist limit for current plan'
        });
      }

      // Add user as artist
      business.addArtist(request.user._id, 'artist');

      // Update user's business affiliation
      await User.findByIdAndUpdate(request.user._id, {
        'businessAffiliation.business': business._id,
        'businessAffiliation.role': 'artist',
        'businessAffiliation.joinedAt': new Date(),
        'businessAffiliation.isActive': true,
        isCreator: true
      });
    }

    await business.save();

    // Send email notification to the requesting user
    const emailService = require('../services/emailService');
    try {
      const statusText = action === 'approve' ? 'approved' : 'declined';
      const statusColor = action === 'approve' ? '#10B981' : '#EF4444';
      
      await emailService.sendEmail({
        to: request.user.email,
        subject: `Join Request ${statusText.charAt(0).toUpperCase() + statusText.slice(1)} - ${business.name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: ${statusColor};">Join Request ${statusText.charAt(0).toUpperCase() + statusText.slice(1)}</h2>
            
            <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p>Your request to join <strong>${business.name}</strong> has been <strong style="color: ${statusColor};">${statusText}</strong>.</p>
              ${action === 'approve' ? 
                '<p>You can now create lines and manage queues as part of this business. Welcome to the team!</p>' :
                '<p>Thank you for your interest. You may try applying to other businesses or contact the business directly for more information.</p>'
              }
            </div>

            ${action === 'approve' ? `
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_BASE_URL}/creator-dashboard" 
                   style="background: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  Go to Dashboard
                </a>
              </div>
            ` : ''}

            <hr style="margin: 30px 0; border: none; border-top: 1px solid #E5E7EB;">
            <p style="color: #6B7280; font-size: 14px; text-align: center;">
              This is an automated message from Tabi Business Management System.
            </p>
          </div>
        `
      });
    } catch (emailError) {
      console.error('Failed to send response email:', emailError);
      // Continue even if email fails
    }

    res.json({
      success: true,
      message: `Request ${action}d successfully`,
      request: {
        id: request._id,
        status: request.status,
        respondedAt: request.respondedAt
      }
    });

  } catch (error) {
    console.error('Error responding to join request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to respond to join request'
    });
  }
};

// Get business dashboard data
const getBusinessDashboard = async (req, res) => {
  try {
    const { businessId } = req.params;
    const userId = req.user.id;

    const business = await Business.findById(businessId)
      .populate('artists.user', 'name email userId totalLinesCreated');

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    // Check if user has access to this business
    const isOwner = business.owner.toString() === userId;
    const isArtist = business.artists.some(artist => 
      artist.user._id.toString() === userId && artist.isActive
    );

    if (!isOwner && !isArtist) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Get artist statistics
    const artistStats = [];
    for (const artist of business.artists.filter(a => a.isActive)) {
      const stats = await business.getArtistStats(artist.user._id);
      artistStats.push({
        artist: artist.user,
        role: artist.role,
        joinedAt: artist.joinedAt,
        stats
      });
    }

    res.json({
      success: true,
      business: {
        id: business._id,
        name: business.name,
        description: business.description,
        category: business.category,
        subscription: business.subscription,
        stats: business.stats,
        currentArtistCount: business.currentArtistCount,
        maxArtists: business.subscription.maxArtists
      },
      artistStats,
      userRole: isOwner ? 'owner' : business.artists.find(a => a.user._id.toString() === userId)?.role
    });

  } catch (error) {
    console.error('Error fetching business dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch business dashboard'
    });
  }
};

// Handle business payment success
const handlePaymentSuccess = async (req, res) => {
  try {
    const { businessId, paymentId } = req.body;

    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    // Activate business subscription
    business.subscription.isActive = true;
    business.subscription.paymentId = paymentId;
    business.status = 'active';
    
    await business.save();

    // Update business owner as creator
    await User.findByIdAndUpdate(business.owner, {
      'businessAffiliation.business': business._id,
      'businessAffiliation.role': 'owner',
      'businessAffiliation.joinedAt': new Date(),
      'businessAffiliation.isActive': true,
      isCreator: true
    });

    res.json({
      success: true,
      message: 'Business registration completed successfully',
      business: {
        id: business._id,
        name: business.name,
        status: business.status
      }
    });

  } catch (error) {
    console.error('Error handling payment success:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process payment'
    });
  }
};

// Remove artist from business
const removeArtist = async (req, res) => {
  try {
    const { businessId, artistId } = req.params;
    const userId = req.user.id;

    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    // Check if user is owner or manager
    const isOwner = business.owner.toString() === userId;
    const userArtist = business.artists.find(a => a.user.toString() === userId);
    const canManage = userArtist?.permissions.canManageArtists;

    if (!isOwner && !canManage) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Remove artist
    business.removeArtist(artistId);
    await business.save();

    // Update user's business affiliation
    await User.findByIdAndUpdate(artistId, {
      'businessAffiliation.isActive': false
    });

    res.json({
      success: true,
      message: 'Artist removed successfully'
    });

  } catch (error) {
    console.error('Error removing artist:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove artist'
    });
  }
};

module.exports = {
  getBusinessPlans,
  registerBusiness,
  getUserBusiness,
  sendJoinRequest,
  getJoinRequests,
  respondToJoinRequest,
  getBusinessDashboard,
  handlePaymentSuccess,
  removeArtist
};
