const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user still exists
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token or user not found'
      });
    }

    // Add userId to request object
    req.userId = decoded.userId;
    req.user = user;
    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

// Optional authentication (for routes that work with or without auth)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      
      if (user && user.isActive) {
        req.userId = decoded.userId;
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Don't fail for optional auth, just continue without user
    next();
  }
};

// Check if user is phone verified
const requirePhoneVerification = (req, res, next) => {
  if (!req.user || !req.user.isPhoneVerified) {
    return res.status(403).json({
      success: false,
      message: 'Phone verification required'
    });
  }
  next();
};

// Check if user is a creator (for line management routes)
const requireCreator = (req, res, next) => {
  if (!req.user || !req.user.isCreator) {
    return res.status(403).json({
      success: false,
      message: 'Creator access required'
    });
  }
  next();
};

module.exports = {
  authenticateToken,
  optionalAuth,
  requirePhoneVerification,
  requireCreator
};