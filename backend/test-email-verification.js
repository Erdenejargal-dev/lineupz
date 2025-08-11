const emailService = require('./src/services/emailService');
require('dotenv').config();

async function testEmailVerification() {
  console.log('🧪 Testing Email Verification System...\n');

  // Check environment variables
  console.log('📋 Email Configuration:');
  console.log(`EMAIL_HOST: ${process.env.EMAIL_HOST || 'Not set'}`);
  console.log(`EMAIL_PORT: ${process.env.EMAIL_PORT || 'Not set'}`);
  console.log(`EMAIL_USER: ${process.env.EMAIL_USER || 'Not set'}`);
  console.log(`EMAIL_PASS: ${process.env.EMAIL_PASS ? '***' : 'Not set'}`);
  console.log(`EMAIL_FROM: ${process.env.EMAIL_FROM || 'Not set'}`);
  console.log(`EMAIL_FROM_NAME: ${process.env.EMAIL_FROM_NAME || 'Not set'}\n`);

  // Test connection
  console.log('🔗 Testing email service connection...');
  try {
    const connectionTest = await emailService.testConnection();
    if (connectionTest.success) {
      console.log('✅ Email service connection successful');
    } else {
      console.log('❌ Email service connection failed:', connectionTest.message);
    }
  } catch (error) {
    console.log('❌ Email service connection error:', error.message);
  }

  console.log('\n📧 Testing verification email sending...');
  
  // Test sending verification email
  const testEmail = 'test@example.com';
  const testOTP = '123456';
  
  try {
    const result = await emailService.sendVerificationEmail(testEmail, testOTP);
    
    if (result.success) {
      console.log('✅ Verification email sent successfully');
      if (result.messageId) {
        console.log(`📨 Message ID: ${result.messageId}`);
      }
      if (result.fallback) {
        console.log('⚠️ Email failed but fallback to console logging worked');
      }
    } else {
      console.log('❌ Failed to send verification email:', result.error);
    }
  } catch (error) {
    console.log('❌ Error sending verification email:', error.message);
  }

  console.log('\n🔍 Diagnosis:');
  
  // Check if all required env vars are set
  const requiredVars = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASS', 'EMAIL_FROM'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.log('❌ Missing required environment variables:', missingVars.join(', '));
  } else {
    console.log('✅ All required environment variables are set');
  }

  // Check if email service is properly initialized
  if (!emailService.transporter) {
    console.log('❌ Email transporter not initialized - check credentials');
  } else {
    console.log('✅ Email transporter initialized');
  }

  console.log('\n💡 Recommendations:');
  console.log('1. Verify Zoho SMTP credentials are correct');
  console.log('2. Check if Zoho account allows SMTP access');
  console.log('3. Ensure EMAIL_PASS is an app-specific password, not regular password');
  console.log('4. Check firewall/network restrictions on port 587');
  console.log('5. Verify EMAIL_FROM matches EMAIL_USER for Zoho');
}

testEmailVerification().catch(console.error);
