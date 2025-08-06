const Business = require('../models/Business');
const User = require('../models/User');
const { bylService } = require('../services/bylService');

// Business subscription plans
const BUSINESS_PLANS = {
  starter: {
    name: 'Starter Plan',
    maxArtists: 5,
    price: 120000, // ₮120,000
    features: ['Basic queue management', 'SMS notifications', 'Basic analytics']
  },
  professional: {
    name: 'Professional Plan', 
    maxArtists: 8,
    price: 200000, // ₮200,000
    features: ['Advanced queue management', 'SMS & Email notifications', 'Advanced analytics', 'Calendar integration']
  },
  enterprise: {
    name: 'Enterprise Plan',
    maxArtists: 12,
    price: 250000, // ₮250,000
    features: ['Full queue management', 'All notifications', 'Complete analytics', 'Calendar integration', 'Priority support']
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

// Join a business as an artist
const joinBusiness = async (req, res) => {
  try {
    const { businessName } = req.body;
    const userId = req.user.id;

    // Find business by name
    const business = await Business.findOne({ 
      name: { $regex: new RegExp(businessName, 'i') },
      status: 'active'
    });

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found or not active'
      });
    }

    // Check if business can add more artists
    if (!business.canAddArtist()) {
      return res.status(400).json({
        success: false,
        message: 'Business has reached maximum artist limit for current plan'
      });
    }

    // Add user as artist
    const artist = business.addArtist(userId, 'artist');
    await business.save();

    // Update user's business affiliation
    await User.findByIdAndUpdate(userId, {
      'businessAffiliation.business': business._id,
      'businessAffiliation.role': 'artist',
      'businessAffiliation.joinedAt': new Date(),
      'businessAffiliation.isActive': true,
      isCreator: true
    });

    res.json({
      success: true,
      message: 'Successfully joined business',
      business: {
        id: business._id,
        name: business.name,
        role: 'artist'
      }
    });

  } catch (error) {
    console.error('Error joining business:', error);
    
    if (error.message.includes('already an artist')) {
      return res.status(400).json({
        success: false,
        message: 'You are already part of this business'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to join business'
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
  joinBusiness,
  getBusinessDashboard,
  handlePaymentSuccess,
  removeArtist
};
