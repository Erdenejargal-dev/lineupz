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
    const { name, businessName, businessDescription } = req.body;
    
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Update fields if provided
    if (name !== undefined) user.name = name;
    if (businessName !== undefined) {
      user.businessName = businessName;
      user.isCreator = true; // Mark as creator if they set business info
    }
    if (businessDescription !== undefined) user.businessDescription = businessDescription;

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
  refreshToken
};
