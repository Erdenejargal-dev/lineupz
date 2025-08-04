const User = require('../models/User');
const OTP = require('../models/OTP');
const jwt = require('jsonwebtoken');

// Import SMS functionality
const { sendSMS } = require('./notificationController');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Generate unique user ID
const generateUserId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Send OTP to phone number
const sendOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ 
        success: false, 
        message: 'Phone number is required' 
      });
    }

    // Validate phone format (basic validation)
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid phone number format' 
      });
    }

    // Check if user exists to determine purpose
    const existingUser = await User.findOne({ phone });
    const purpose = existingUser ? 'login' : 'signup';

    // Generate and send OTP
    const otp = await OTP.createOTP(phone, purpose);

    // Send OTP via Android SMS Gateway
    const smsMessage = `Tabi: Your OTP code is ${otp}. Valid for 10 minutes. Do not share this code.`;
    
    try {
      const smsResult = await sendSMS(phone, smsMessage);
      console.log(`OTP SMS result for ${phone}:`, smsResult.success ? 'Success' : 'Failed');
    } catch (smsError) {
      console.error('Failed to send OTP SMS:', smsError);
      // Don't fail the request if SMS fails - user can still see OTP in development
    }

    res.json({
      success: true,
      message: `OTP sent to ${phone}`,
      purpose, // Tell frontend if this is signup or login
      // In development, return OTP (REMOVE IN PRODUCTION!)
      ...(process.env.NODE_ENV === 'development' && { otp })
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send OTP' 
    });
  }
};

// Verify OTP and login/signup user
const verifyOTP = async (req, res) => {
  try {
    const { phone, otp, name } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ 
        success: false, 
        message: 'Phone number and OTP are required' 
      });
    }

    // Check if user exists to determine the correct purpose
    const existingUser = await User.findOne({ phone });
    const purpose = existingUser ? 'login' : 'signup';
    
    console.log(`Verifying OTP with purpose: ${purpose} for existing user: ${!!existingUser}`);

    // Verify OTP with the correct purpose
    const otpResult = await OTP.verifyOTP(phone, otp, purpose);
    
    if (!otpResult.success) {
      return res.status(400).json({
        success: false,
        message: otpResult.message
      });
    }

    // Check if user exists
    let user = existingUser;
    let isNewUser = false;

    if (!user) {
      // Generate unique userId
      let userId;
      let isUnique = false;
      
      while (!isUnique) {
        userId = generateUserId();
        const existingUserCheck = await User.findOne({ userId });
        if (!existingUserCheck) {
          isUnique = true;
        }
      }

      // Create new user (signup)
      user = new User({
        phone,
        name: name || '',
        isPhoneVerified: true,
        userId: userId  // Explicitly set the userId
      });
      await user.save();
      isNewUser = true;
    } else {
      // Update existing user (login)
      if (!user.isPhoneVerified) {
        user.isPhoneVerified = true;
        await user.save();
      }
    }

    // Generate JWT token
    const token = generateToken(user._id);

    // Return user data (without sensitive info)
    const userData = user.toJSON();

    res.json({
      success: true,
      message: isNewUser ? 'Account created successfully' : 'Login successful',
      isNewUser,
      user: userData,
      token
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to verify OTP' 
    });
  }
};

// Get current user info
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.json({
      success: true,
      user: user.toJSON()
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get user data' 
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { 
      name, 
      email,
      businessName, 
      businessDescription,
      businessAddress,
      businessWebsite,
      businessCategory
    } = req.body;
    
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Update basic profile fields
    if (name !== undefined) {
      user.name = name;
      user.onboardingSteps.profileSetup = true;
    }
    
    if (email !== undefined) {
      user.email = email;
      user.isEmailVerified = false; // Reset email verification when email changes
      user.onboardingSteps.profileSetup = true;
    }

    // Update business fields
    if (businessName !== undefined) {
      user.businessName = businessName;
      user.isCreator = true; // Mark as creator if they set business info
      user.onboardingSteps.businessInfo = true;
    }
    
    if (businessDescription !== undefined) {
      user.businessDescription = businessDescription;
      user.onboardingSteps.businessInfo = true;
    }
    
    if (businessAddress !== undefined) {
      user.businessAddress = businessAddress;
      user.onboardingSteps.businessInfo = true;
    }
    
    if (businessWebsite !== undefined) {
      user.businessWebsite = businessWebsite;
      user.onboardingSteps.businessInfo = true;
    }
    
    if (businessCategory !== undefined) {
      user.businessCategory = businessCategory;
      user.onboardingSteps.businessInfo = true;
    }

    // Check if onboarding is completed
    const steps = user.onboardingSteps;
    user.onboardingCompleted = steps.profileSetup && 
                               (steps.businessInfo || !user.isCreator) &&
                               steps.serviceSettings &&
                               steps.notificationPrefs;

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: user.toJSON()
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update profile' 
    });
  }
};

// Update service settings
const updateServiceSettings = async (req, res) => {
  try {
    const { 
      appointmentDuration,
      slotInterval,
      advanceBookingDays,
      cancellationHours,
      autoConfirmAppointments,
      pricing
    } = req.body;
    
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Initialize defaultServiceSettings if it doesn't exist
    if (!user.defaultServiceSettings) {
      user.defaultServiceSettings = {};
    }

    // Update service settings
    if (appointmentDuration !== undefined) {
      user.defaultServiceSettings.appointmentDuration = appointmentDuration;
    }
    if (slotInterval !== undefined) {
      user.defaultServiceSettings.slotInterval = slotInterval;
    }
    if (advanceBookingDays !== undefined) {
      user.defaultServiceSettings.advanceBookingDays = advanceBookingDays;
    }
    if (cancellationHours !== undefined) {
      user.defaultServiceSettings.cancellationHours = cancellationHours;
    }
    if (autoConfirmAppointments !== undefined) {
      user.defaultServiceSettings.autoConfirmAppointments = autoConfirmAppointments;
    }
    if (pricing !== undefined) {
      user.defaultServiceSettings.pricing = {
        ...user.defaultServiceSettings.pricing,
        ...pricing
      };
    }

    // Mark service settings step as completed
    user.onboardingSteps.serviceSettings = true;

    // Check if onboarding is completed
    const steps = user.onboardingSteps;
    user.onboardingCompleted = steps.profileSetup && 
                               (steps.businessInfo || !user.isCreator) &&
                               steps.serviceSettings &&
                               steps.notificationPrefs;

    await user.save();

    res.json({
      success: true,
      message: 'Service settings updated successfully',
      user: user.toJSON()
    });

  } catch (error) {
    console.error('Update service settings error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update service settings' 
    });
  }
};

// Update notification preferences
const updateNotificationPreferences = async (req, res) => {
  try {
    const { email, sms } = req.body;
    
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Initialize notificationPreferences if it doesn't exist
    if (!user.notificationPreferences) {
      user.notificationPreferences = {
        email: {},
        sms: {}
      };
    }

    // Update email preferences
    if (email !== undefined) {
      user.notificationPreferences.email = {
        ...user.notificationPreferences.email,
        ...email
      };
    }

    // Update SMS preferences
    if (sms !== undefined) {
      user.notificationPreferences.sms = {
        ...user.notificationPreferences.sms,
        ...sms
      };
    }

    // Mark notification preferences step as completed
    user.onboardingSteps.notificationPrefs = true;

    // Check if onboarding is completed
    const steps = user.onboardingSteps;
    user.onboardingCompleted = steps.profileSetup && 
                               (steps.businessInfo || !user.isCreator) &&
                               steps.serviceSettings &&
                               steps.notificationPrefs;

    await user.save();

    res.json({
      success: true,
      message: 'Notification preferences updated successfully',
      user: user.toJSON()
    });

  } catch (error) {
    console.error('Update notification preferences error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update notification preferences' 
    });
  }
};

// Send email verification
const sendEmailVerification = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    if (!user.email) {
      return res.status(400).json({ 
        success: false, 
        message: 'No email address found' 
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is already verified' 
      });
    }

    // Generate verification OTP for email
    const otp = await OTP.createOTP(user.email, 'email_verification');

    // TODO: Send email with OTP (implement email service)
    console.log(`Email verification OTP for ${user.email}: ${otp}`);

    res.json({
      success: true,
      message: 'Verification email sent',
      // In development, return OTP (REMOVE IN PRODUCTION!)
      ...(process.env.NODE_ENV === 'development' && { otp })
    });

  } catch (error) {
    console.error('Send email verification error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send verification email' 
    });
  }
};

// Verify email with OTP
const verifyEmail = async (req, res) => {
  try {
    const { otp } = req.body;
    
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    if (!user.email) {
      return res.status(400).json({ 
        success: false, 
        message: 'No email address found' 
      });
    }

    // Verify OTP
    const otpResult = await OTP.verifyOTP(user.email, otp, 'email_verification');
    
    if (!otpResult.success) {
      return res.status(400).json({
        success: false,
        message: otpResult.message
      });
    }

    // Mark email as verified
    user.isEmailVerified = true;
    await user.save();

    res.json({
      success: true,
      message: 'Email verified successfully',
      user: user.toJSON()
    });

  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to verify email' 
    });
  }
};

// Refresh token
const refreshToken = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const newToken = generateToken(user._id);

    res.json({
      success: true,
      token: newToken,
      user: user.toJSON()
    });

  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to refresh token' 
    });
  }
};

module.exports = {
  sendOTP,
  verifyOTP,
  getMe,
  updateProfile,
  updateServiceSettings,
  updateNotificationPreferences,
  sendEmailVerification,
  verifyEmail,
  refreshToken
};
