const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  phone: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true
  },
  otp: {
    type: String,
    required: true
  },
  purpose: {
    type: String,
    enum: ['signup', 'login', 'phone_verification', 'email_verification'],
    default: 'signup'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  attempts: {
    type: Number,
    default: 0,
    max: 5
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
  }
}, {
  timestamps: true
});

// Auto-delete expired OTPs
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Generate 6-digit OTP
otpSchema.statics.generateOTP = function() {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Create new OTP for phone number or email
otpSchema.statics.createOTP = async function(identifier, purpose = 'signup') {
  console.log(`Creating OTP for: identifier=${identifier}, purpose=${purpose}`);
  
  // Determine if identifier is phone or email
  const isEmail = identifier.includes('@');
  const query = isEmail ? { email: identifier } : { phone: identifier };
  
  // Delete any existing OTPs for this identifier
  await this.deleteMany(query);
  console.log(`Deleted existing OTPs for ${identifier}`);
  
  const otp = this.generateOTP();
  console.log(`Generated OTP: ${otp}`);
  
  const otpData = {
    otp,
    purpose
  };
  
  if (isEmail) {
    otpData.email = identifier;
  } else {
    otpData.phone = identifier;
  }
  
  const otpDoc = new this(otpData);
  
  await otpDoc.save();
  console.log(`Saved OTP to database for ${identifier}`);
  return otp;
};

// Verify OTP for phone or email
otpSchema.statics.verifyOTP = async function(identifier, otp, purpose = 'signup') {
  console.log('=== OTP VERIFICATION DEBUG ===');
  console.log('Identifier:', identifier);
  console.log('OTP:', otp);
  console.log('Purpose:', purpose);
  
  // Determine if identifier is phone or email
  const isEmail = identifier.includes('@');
  const query = isEmail ? { email: identifier } : { phone: identifier };
  
  const otpDoc = await this.findOne({ 
    ...query,
    purpose,
    isVerified: false,
    expiresAt: { $gt: new Date() }
  });
  
  console.log('Found OTP document:', !!otpDoc);
  if (otpDoc) {
    console.log('OTP in DB:', otpDoc.otp);
    console.log('OTP provided:', otp);
    console.log('OTP matches:', otpDoc.otp === otp);
    console.log('Attempts:', otpDoc.attempts);
    console.log('Expires at:', otpDoc.expiresAt);
    console.log('Current time:', new Date());
  } else {
    console.log('No OTP found with criteria:');
    console.log('- Identifier:', identifier);
    console.log('- Purpose:', purpose);
    console.log('- isVerified: false');
    console.log('- Not expired');
    
    // Check if there are any OTPs for this identifier
    const allOTPs = await this.find(query);
    console.log('All OTPs for this identifier:', allOTPs.length);
    allOTPs.forEach((doc, index) => {
      console.log(`OTP ${index + 1}:`, {
        otp: doc.otp,
        purpose: doc.purpose,
        isVerified: doc.isVerified,
        expiresAt: doc.expiresAt,
        expired: doc.expiresAt < new Date()
      });
    });
  }
  
  if (!otpDoc) {
    return { success: false, message: 'OTP not found or expired' };
  }
  
  // Increment attempts
  otpDoc.attempts += 1;
  await otpDoc.save();
  
  if (otpDoc.attempts > 5) {
    await otpDoc.deleteOne();
    return { success: false, message: 'Too many failed attempts' };
  }
  
  if (otpDoc.otp !== otp) {
    return { success: false, message: 'Invalid OTP' };
  }
  
  // Mark as verified and delete
  otpDoc.isVerified = true;
  await otpDoc.save();
  await otpDoc.deleteOne();
  
  return { success: true, message: 'OTP verified successfully' };
};

module.exports = mongoose.model('OTP', otpSchema);
