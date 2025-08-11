const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    // Don't initialize in constructor, do it lazily
  }

  initializeTransporter() {
    // Only initialize if email credentials are provided and not already initialized
    if (this.transporter) {
      return; // Already initialized
    }
    
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        const config = {
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        };

        // Use custom SMTP configuration if provided (for Zoho, etc.)
        if (process.env.EMAIL_HOST) {
          config.host = process.env.EMAIL_HOST;
          config.port = parseInt(process.env.EMAIL_PORT) || 587;
          config.secure = process.env.EMAIL_PORT === '465'; // true for 465, false for other ports
          config.tls = {
            rejectUnauthorized: false // Accept self-signed certificates
          };
        } else {
          // Use service-based configuration (Gmail, etc.)
          config.service = process.env.EMAIL_SERVICE || 'gmail';
        }

        this.transporter = nodemailer.createTransport(config);
        console.log(`Email service initialized successfully with ${process.env.EMAIL_HOST ? 'custom SMTP' : (process.env.EMAIL_SERVICE || 'gmail')}`);
      } catch (error) {
        console.error('Failed to initialize email service:', error);
        this.transporter = null;
      }
    } else {
      console.log('Email service not configured - missing EMAIL_USER or EMAIL_PASS');
    }
  }

  async sendVerificationEmail(email, otp) {
    // Initialize transporter if not already done
    this.initializeTransporter();
    
    // If no transporter, return success but log that email wasn't sent
    if (!this.transporter) {
      console.log(`Email service not configured. OTP for ${email}: ${otp}`);
      return { 
        success: true, 
        message: 'Email service not configured - OTP logged to console' 
      };
    }

    const mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME || 'Tabi'} <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify Your Email - Tabi',
      html: this.getEmailTemplate(otp)
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log(`Verification email sent to ${email}:`, info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Email send error:', error);
      // Fallback: log OTP to console if email fails
      console.log(`Email failed, OTP for ${email}: ${otp}`);
      return { 
        success: true, // Don't fail the request if email fails
        error: error.message,
        fallback: true
      };
    }
  }

  getEmailTemplate(otp) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email - Tabi</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px;">
          <!-- Header -->
          <div style="text-align: center; padding: 20px 0; border-bottom: 1px solid #eee;">
            <h1 style="color: #333; margin: 0; font-size: 28px;">Tabi</h1>
            <p style="color: #666; margin: 5px 0 0 0;">Queue & Appointment Management</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 30px 0;">
            <h2 style="color: #333; margin: 0 0 20px 0;">Verify Your Email Address</h2>
            <p style="color: #555; line-height: 1.6; margin: 0 0 20px 0;">
              Thank you for signing up with Tabi! Please use the verification code below to verify your email address and complete your account setup.
            </p>
            
            <!-- OTP Code -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; margin: 30px 0; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
              <p style="color: white; margin: 0 0 10px 0; font-size: 16px;">Your verification code is:</p>
              <h1 style="color: white; font-size: 42px; margin: 0; letter-spacing: 8px; font-weight: bold;">${otp}</h1>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #007bff;">
              <p style="margin: 0; color: #555; font-size: 14px;">
                <strong>Important:</strong> This code will expire in 10 minutes for security reasons.
              </p>
            </div>
            
            <p style="color: #555; line-height: 1.6; margin: 20px 0 0 0;">
              If you didn't request this verification, please ignore this email. Your account will remain secure.
            </p>
          </div>
          
          <!-- Footer -->
          <div style="border-top: 1px solid #eee; padding: 20px 0; text-align: center;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              This email was sent by Tabi. Please do not reply to this email.
            </p>
            <p style="color: #999; font-size: 12px; margin: 5px 0 0 0;">
              © ${new Date().getFullYear()} Tabi. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Test email configuration
  async testConnection() {
    // Initialize transporter if not already done
    this.initializeTransporter();
    
    if (!this.transporter) {
      return { success: false, message: 'Email service not configured' };
    }

    try {
      await this.transporter.verify();
      return { success: true, message: 'Email service connection successful' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}

module.exports = new EmailService();
