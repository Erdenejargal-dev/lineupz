# Email Service Setup Guide for Tabi

## 🎯 **Overview**

To send email verification codes in production, you need to set up an email service. This guide covers multiple options from simple to advanced.

## 📧 **Email Service Options**

### **Option 1: Gmail SMTP (Easiest for Development)**

**Pros**: Free, easy setup, reliable
**Cons**: Limited to 500 emails/day, requires app password

#### **Setup Steps:**
1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. **Use Gmail SMTP settings**

### **Option 2: SendGrid (Recommended for Production)**

**Pros**: 100 free emails/day, professional, reliable
**Cons**: Requires account setup

#### **Setup Steps:**
1. **Sign up** at https://sendgrid.com/
2. **Verify your account** and domain
3. **Create API Key** in Settings → API Keys
4. **Get 100 free emails/day**

### **Option 3: Mailgun (Alternative)**

**Pros**: 5,000 free emails/month for 3 months
**Cons**: Requires credit card for verification

### **Option 4: Amazon SES (Enterprise)**

**Pros**: Very cheap, highly scalable
**Cons**: More complex setup, requires AWS account

## 🚀 **Quick Setup with Gmail (Development)**

### **1. Install Email Dependencies**

```bash
cd backend
npm install nodemailer
```

### **2. Add Environment Variables**

Add to your `backend/.env`:

```env
# Email Service Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com
EMAIL_FROM_NAME=Tabi
```

### **3. Create Email Service**

I'll create the email service file for you:

```javascript
// backend/src/services/emailService.js
const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendVerificationEmail(email, otp) {
    const mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: 'Verify Your Email - Tabi',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Verify Your Email Address</h2>
          <p>Thank you for signing up with Tabi! Please use the verification code below to verify your email address:</p>
          
          <div style="background: #f8f9fa; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
            <h1 style="color: #007bff; font-size: 32px; margin: 0; letter-spacing: 5px;">${otp}</h1>
          </div>
          
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this verification, please ignore this email.</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            This email was sent by Tabi. Please do not reply to this email.
          </p>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return { success: true };
    } catch (error) {
      console.error('Email send error:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();
```

## 🔧 **Production Setup with SendGrid**

### **1. Install SendGrid**

```bash
cd backend
npm install @sendgrid/mail
```

### **2. Environment Variables**

```env
# Email Service Configuration (Production)
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=your-sendgrid-api-key
EMAIL_FROM=noreply@tabi.mn
EMAIL_FROM_NAME=Tabi
```

### **3. SendGrid Email Service**

```javascript
// Alternative implementation for SendGrid
const sgMail = require('@sendgrid/mail');

class EmailService {
  constructor() {
    if (process.env.EMAIL_SERVICE === 'sendgrid') {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    }
  }

  async sendVerificationEmail(email, otp) {
    if (process.env.EMAIL_SERVICE === 'sendgrid') {
      return this.sendWithSendGrid(email, otp);
    } else {
      return this.sendWithSMTP(email, otp);
    }
  }

  async sendWithSendGrid(email, otp) {
    const msg = {
      to: email,
      from: {
        email: process.env.EMAIL_FROM,
        name: process.env.EMAIL_FROM_NAME
      },
      subject: 'Verify Your Email - Tabi',
      html: this.getEmailTemplate(otp)
    };

    try {
      await sgMail.send(msg);
      return { success: true };
    } catch (error) {
      console.error('SendGrid error:', error);
      return { success: false, error: error.message };
    }
  }
}
```

## 📋 **Current Status**

### **What Works Now (Development)**
- ✅ **OTP Generation**: Creates verification codes
- ✅ **OTP Storage**: Saves to database
- ✅ **OTP Validation**: Verifies codes
- ✅ **Development Display**: Shows OTP in console/response
- ❌ **Email Sending**: Not implemented yet

### **What You Need to Add**
1. **Email Service**: Choose Gmail, SendGrid, or other
2. **Environment Variables**: Email credentials
3. **Email Templates**: Professional HTML emails
4. **Error Handling**: Graceful email failures

## 🎯 **Recommended Approach**

### **For Development/Testing**
1. **Use Gmail SMTP** - easiest setup
2. **Keep console logging** - see OTPs in development
3. **Test with your own email**

### **For Production**
1. **Use SendGrid** - professional and reliable
2. **Set up proper domain** - noreply@tabi.mn
3. **Add email templates** - branded emails
4. **Monitor delivery rates**

## 🚀 **Quick Start (5 minutes)**

### **Option A: Skip Email for Now**
The system works without email sending:
- Users see OTP in development mode
- Email verification still functions
- You can add email service later

### **Option B: Quick Gmail Setup**
1. **Generate Gmail app password**
2. **Add to environment variables**
3. **Install nodemailer**
4. **Create email service**
5. **Update auth controller**

## 📞 **Next Steps**

Would you like me to:

1. **Create the email service** with Gmail SMTP?
2. **Set up SendGrid integration** for production?
3. **Keep it simple** and just show OTPs in development?
4. **Create a complete email system** with templates?

The email verification **works functionally** without actual email sending - users can see the OTP in development mode and verify successfully. Adding email sending is an enhancement for production user experience.
