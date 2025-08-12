const emailService = require('./src/services/emailService');
require('dotenv').config();

async function testRealEmail() {
  console.log('🧪 Testing Email Verification to Real Email Address...\n');

  const testEmail = 'erdenejargale19@gmail.com';
  const testOTP = Math.floor(100000 + Math.random() * 900000).toString(); // Generate random 6-digit OTP
  
  console.log(`📧 Sending verification email to: ${testEmail}`);
  console.log(`🔢 Generated OTP: ${testOTP}\n`);

  try {
    console.log('🔗 Initializing email service...');
    
    // Test the email sending
    const result = await emailService.sendVerificationEmail(testEmail, testOTP);
    
    if (result.success) {
      if (result.messageId) {
        console.log('✅ EMAIL SENT SUCCESSFULLY!');
        console.log(`📨 Message ID: ${result.messageId}`);
        console.log(`📧 Email sent to: ${testEmail}`);
        console.log(`🔢 OTP Code: ${testOTP}`);
        console.log('\n🎉 Check your email inbox for the verification email!');
      } else if (result.fallback) {
        console.log('⚠️ EMAIL FAILED - Using fallback (console logging)');
        console.log(`🔢 OTP for ${testEmail}: ${testOTP}`);
        console.log(`❌ Error: ${result.error}`);
      } else {
        console.log('⚠️ EMAIL SERVICE NOT CONFIGURED');
        console.log(`🔢 OTP for ${testEmail}: ${testOTP}`);
        console.log('📝 Email service is not configured, but OTP is logged above');
      }
    } else {
      console.log('❌ FAILED TO SEND EMAIL');
      console.log(`Error: ${result.error || 'Unknown error'}`);
    }

    // Test connection separately
    console.log('\n🔍 Testing SMTP connection...');
    const connectionTest = await emailService.testConnection();
    
    if (connectionTest.success) {
      console.log('✅ SMTP Connection: SUCCESS');
    } else {
      console.log('❌ SMTP Connection: FAILED');
      console.log(`Error: ${connectionTest.message}`);
    }

  } catch (error) {
    console.log('❌ CRITICAL ERROR:', error.message);
    console.log(`🔢 Fallback OTP for ${testEmail}: ${testOTP}`);
  }

  console.log('\n📋 Email Configuration Status:');
  console.log(`EMAIL_HOST: ${process.env.EMAIL_HOST || 'Not set'}`);
  console.log(`EMAIL_PORT: ${process.env.EMAIL_PORT || 'Not set'}`);
  console.log(`EMAIL_USER: ${process.env.EMAIL_USER || 'Not set'}`);
  console.log(`EMAIL_PASS: ${process.env.EMAIL_PASS ? '***' : 'Not set'}`);
  console.log(`EMAIL_FROM: ${process.env.EMAIL_FROM || 'Not set'}`);

  console.log('\n💡 Next Steps:');
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    console.log('1. If email failed, check Zoho account for app password requirement');
    console.log('2. Verify SMTP is enabled in Zoho Mail settings');
    console.log('3. Check if 2FA is enabled (requires app password)');
    console.log('4. Try generating an app-specific password in Zoho');
  } else {
    console.log('1. Configure EMAIL_USER and EMAIL_PASS in .env file');
    console.log('2. Restart the backend service');
    console.log('3. Run this test again');
  }
}

testRealEmail().catch(console.error);
