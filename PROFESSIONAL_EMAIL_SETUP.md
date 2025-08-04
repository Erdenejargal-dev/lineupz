# Professional Email Setup for Tabi - info@tabi.mn

## 🎯 **Best Free Options for info@tabi.mn**

### **Option 1: Cloudflare Email Routing + Gmail (Recommended)**

**Pros**: 100% Free, Professional domain email, Unlimited forwarding
**Cons**: Sending requires Gmail SMTP (still free)

#### **Setup Steps:**

1. **Enable Cloudflare Email Routing**
   - Go to Cloudflare Dashboard → Email → Email Routing
   - Enable Email Routing for `tabi.mn`
   - Add destination email (your personal Gmail)

2. **Create Email Address**
   - Add custom address: `info@tabi.mn`
   - Forward to your Gmail: `your-email@gmail.com`

3. **Configure Gmail for Sending**
   - Gmail Settings → Accounts → "Send mail as"
   - Add `info@tabi.mn` as sending address
   - Use Gmail SMTP for outgoing emails

4. **Environment Variables**
   ```env
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-personal-gmail@gmail.com
   EMAIL_PASS=your-gmail-app-password
   EMAIL_FROM=info@tabi.mn
   EMAIL_FROM_NAME=Tabi
   ```

### **Option 2: Zoho Mail Free (5 Users)**

**Pros**: Full email hosting, Professional interface, 5GB storage
**Cons**: Limited to 5 users

#### **Setup Steps:**

1. **Sign up at Zoho Mail**
   - Go to https://www.zoho.com/mail/
   - Choose "Free Plan" (5 users, 5GB each)

2. **Add Your Domain**
   - Add `tabi.mn` as custom domain
   - Verify domain ownership via DNS

3. **Create Email Account**
   - Create `info@tabi.mn`
   - Set up password and recovery

4. **Configure DNS Records**
   ```
   MX Records (add to Cloudflare DNS):
   mx.zoho.com (Priority: 10)
   mx2.zoho.com (Priority: 20)
   mx3.zoho.com (Priority: 50)
   ```

5. **Environment Variables**
   ```env
   EMAIL_SERVICE=zoho
   EMAIL_HOST=smtp.zoho.com
   EMAIL_PORT=587
   EMAIL_USER=info@tabi.mn
   EMAIL_PASS=your-zoho-password
   EMAIL_FROM=info@tabi.mn
   EMAIL_FROM_NAME=Tabi
   ```

### **Option 3: ProtonMail Free + SMTP Bridge**

**Pros**: Privacy-focused, Secure, Professional
**Cons**: Requires ProtonMail Bridge for SMTP

### **Option 4: Migadu (Paid but Cheap - $19/year)**

**Pros**: Unlimited emails, Professional features, Great for business
**Cons**: Not free ($19/year for unlimited)

## 🚀 **Recommended: Cloudflare + Gmail Setup**

### **Step-by-Step Implementation**

#### **1. Cloudflare Email Routing Setup**

1. **Login to Cloudflare**
   - Go to https://dash.cloudflare.com/
   - Select your `tabi.mn` domain

2. **Enable Email Routing**
   - Go to Email → Email Routing
   - Click "Enable Email Routing"
   - Add your personal Gmail as destination

3. **Create Custom Address**
   - Click "Create address"
   - Custom address: `info@tabi.mn`
   - Destination: `your-personal@gmail.com`
   - Action: Forward

4. **Verify Setup**
   - Send test email to `info@tabi.mn`
   - Check if it arrives in your Gmail

#### **2. Gmail Sending Configuration**

1. **Gmail Settings**
   - Open Gmail → Settings (gear icon) → "See all settings"
   - Go to "Accounts and Import" tab

2. **Add Send-As Address**
   - Click "Add another email address"
   - Name: `Tabi`
   - Email: `info@tabi.mn`
   - Uncheck "Treat as an alias"

3. **SMTP Configuration**
   - SMTP Server: `smtp.gmail.com`
   - Port: `587`
   - Username: Your Gmail address
   - Password: Your Gmail app password
   - TLS: Yes

4. **Verify Address**
   - Gmail will send verification email to `info@tabi.mn`
   - Check your Gmail (forwarded email)
   - Click verification link

#### **3. Backend Configuration**

Update your `backend/.env`:

```env
# Email Service Configuration (Cloudflare + Gmail)
EMAIL_SERVICE=gmail
EMAIL_USER=your-personal-gmail@gmail.com
EMAIL_PASS=your-gmail-app-password
EMAIL_FROM=info@tabi.mn
EMAIL_FROM_NAME=Tabi
```

#### **4. Update Email Service (Optional Enhancement)**

I can update the email service to better handle custom domains:

```javascript
// Enhanced email service for custom domains
class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const config = {
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      };

      // Custom SMTP configuration for other providers
      if (process.env.EMAIL_HOST) {
        config.host = process.env.EMAIL_HOST;
        config.port = process.env.EMAIL_PORT || 587;
        config.secure = process.env.EMAIL_PORT === '465';
        delete config.service;
      }

      this.transporter = nodemailer.createTransporter(config);
    }
  }
}
```

## 💰 **Cost Comparison**

| Service | Cost | Features | Emails/Month |
|---------|------|----------|--------------|
| **Cloudflare + Gmail** | **FREE** | Professional domain, Gmail interface | Unlimited |
| **Zoho Mail Free** | **FREE** | 5 users, 5GB storage, Web interface | Unlimited |
| **SendGrid Free** | **FREE** | 100 emails/day | 3,000 |
| **Mailgun Free** | **FREE** | 5,000 emails/month (3 months) | 5,000 |
| **Migadu** | $19/year | Unlimited everything | Unlimited |

## 🎯 **Recommended Setup for Tabi**

### **For Development/Testing**
```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-personal@gmail.com
EMAIL_PASS=your-gmail-app-password
EMAIL_FROM=info@tabi.mn
EMAIL_FROM_NAME=Tabi
```

### **For Production**
```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-personal@gmail.com
EMAIL_PASS=your-gmail-app-password
EMAIL_FROM=info@tabi.mn
EMAIL_FROM_NAME=Tabi Support
```

## 🔧 **Implementation Benefits**

### **With info@tabi.mn Setup**
- ✅ **Professional appearance** - emails from `info@tabi.mn`
- ✅ **Brand consistency** - matches your domain
- ✅ **User trust** - professional email address
- ✅ **Free solution** - no monthly costs
- ✅ **Unlimited emails** - no sending limits
- ✅ **Easy management** - through Gmail interface

### **Email Templates Will Show**
```
From: Tabi <info@tabi.mn>
To: user@example.com
Subject: Verify Your Email - Tabi

[Beautiful branded email with verification code]
```

## 🚀 **Quick Start (15 minutes)**

1. **Enable Cloudflare Email Routing** (5 minutes)
2. **Configure Gmail sending** (5 minutes)
3. **Update environment variables** (2 minutes)
4. **Test email sending** (3 minutes)

Would you like me to:
1. **Update the email service** to better support custom domains?
2. **Create specific Zoho Mail configuration**?
3. **Set up the Cloudflare + Gmail solution** step by step?

The **Cloudflare + Gmail** option is perfect for Tabi - it's completely free, professional, and gives you unlimited email sending with your custom domain!
