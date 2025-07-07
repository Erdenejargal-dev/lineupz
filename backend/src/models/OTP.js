const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    trim: true
  },
  otp: {
    type: String,
    required: true
  },
  purpose: {
    type: String,
    enum: ['signup', 'login', 'phone_verification'],
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

// Create new OTP for phone number
otpSchema.statics.createOTP = async function(phone, purpose = 'signup') {
  console.log(`Creating OTP for: phone=${phone}, purpose=${purpose}`);
  
  // Delete any existing OTPs for this phone
  await this.deleteMany({ phone });
  console.log(`Deleted existing OTPs for ${phone}`);
  
  const otp = this.generateOTP();
  console.log(`Generated OTP: ${otp}`);
  
  const otpDoc = new this({
    phone,
    otp,
    purpose
  });
  
  await otpDoc.save();
  console.log(`Saved OTP to database for ${phone}`);
  return otp;
};

// Verify OTP
otpSchema.statics.verifyOTP = async function(phone, otp, purpose = 'signup') {
  console.log('=== OTP VERIFICATION DEBUG ===');
  console.log('Phone:', phone);
  console.log('OTP:', otp);
  console.log('Purpose:', purpose);
  
  const otpDoc = await this.findOne({ 
    phone, 
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
    console.log('- Phone:', phone);
    console.log('- Purpose:', purpose);
    console.log('- isVerified: false');
    console.log('- Not expired');
    
    // Check if there are any OTPs for this phone
    const allOTPs = await this.find({ phone });
    console.log('All OTPs for this phone:', allOTPs.length);
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