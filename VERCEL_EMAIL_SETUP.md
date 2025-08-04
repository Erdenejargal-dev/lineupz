# Professional Email Setup for Tabi with Vercel Domain

## 🎯 **Best Free Options for info@tabi.mn (Vercel Domain)**

Since your `tabi.mn` domain is connected to Vercel, here are the best free email solutions that work without requiring DNS management through Cloudflare:

### **Option 1: Zoho Mail Free (Recommended for Vercel)**

**Pros**: 100% Free, 5 users, Professional interface, Works with any DNS provider
**Cons**: Limited to 5 users (perfect for small business)

#### **Complete Setup Steps:**

1. **Sign Up for Zoho Mail**
   - Go to https://www.zoho.com/mail/
   - Click "Get Started" → Choose "Free Plan"
   - Enter your details and verify account

2. **Add Your Domain**
   - In Zoho Mail admin panel, click "Add Domain"
   - Enter `tabi.mn`
   - Choose "I have a domain and want to use it with Zoho"

3. **Verify Domain Ownership**
   - Zoho will provide a TXT record for verification
   - Add this TXT record to your Vercel DNS settings:
     ```
     Name: @ (or leave blank)
     Type: TXT
     Value: zoho-verification=xxxxxxxx.zmverify.zoho.com
     ```

4. **Configure MX Records in Vercel**
   - Go to Vercel Dashboard → Your Project → Settings → Domains
   - Add these MX records for `tabi.mn`:
     ```
     Priority: 10, Value: mx.zoho.com
     Priority: 20, Value: mx2.zoho.com
     Priority: 50, Value: mx3.zoho.com
     ```

5. **Create Email Account**
   - In Zoho Mail, create user: `info@tabi.mn`
   - Set strong password
   - Complete setup

6. **Environment Variables**
   ```env
   EMAIL_HOST=smtp.zoho.com
   EMAIL_PORT=587
   EMAIL_USER=info@tabi.mn
   EMAIL_PASS=your-zoho-password
   EMAIL_FROM=info@tabi.mn
   EMAIL_FROM_NAME=Tabi
   ```

### **Option 2: ImprovMX + Gmail (Alternative)**

**Pros**: Free email forwarding, Works with Gmail, Simple setup
**Cons**: Forwarding only (not full hosting)

#### **Setup Steps:**

1. **Sign Up at ImprovMX**
   - Go to https://improvmx.com/
   - Sign up for free account
   - Add domain `tabi.mn`

2. **Configure MX Records in Vercel**
   ```
   Priority: 10, Value: mx1.improvmx.com
   Priority: 20, Value: mx2.improvmx.com
   ```

3. **Create Alias**
   - Create `info@tabi.mn` → forward to your Gmail
   - Verify setup

4. **Gmail Configuration**
   - Add `info@tabi.mn` as "Send mail as" in Gmail
   - Use Gmail SMTP for sending

### **Option 3: Yandex Mail (Free Alternative)**

**Pros**: Free, 1000 users, Professional features
**Cons**: Russian service (some may prefer alternatives)

### **Option 4: Gmail Workspace (Paid - $6/month)**

**Pros**: Professional, Reliable, Google ecosystem
**Cons**: Not free ($6/user/month)

## 🚀 **Recommended: Zoho Mail Setup with Vercel**

### **Step-by-Step Vercel DNS Configuration**

#### **1. Access Vercel DNS Settings**

1. **Go to Vercel Dashboard**
   - Visit https://vercel.com/dashboard
   - Select your Tabi project

2. **Navigate to Domain Settings**
   - Go to Settings → Domains
   - Find your `tabi.mn` domain

3. **Access DNS Records**
   - Click on your domain
   - Look for "DNS Records" or "Manage DNS" section

#### **2. Add Required DNS Records**

**Verification Record (TXT):**
```
Name: @ (or root)
Type: TXT
Value: zoho-verification=xxxxxxxx.zmverify.zoho.com
TTL: 3600
```

**MX Records for Email:**
```
Name: @ (or root)
Type: MX
Priority: 10
Value: mx.zoho.com
TTL: 3600

Name: @ (or root)
Type: MX
Priority: 20
Value: mx2.zoho.com
TTL: 3600

Name: @ (or root)
Type: MX
Priority: 50
Value: mx3.zoho.com
TTL: 3600
```

**SPF Record (TXT) - Optional but recommended:**
```
Name: @ (or root)
Type: TXT
Value: v=spf1 include:zoho.com ~all
TTL: 3600
```

#### **3. Wait for DNS Propagation**
- DNS changes can take 24-48 hours to propagate
- Use https://dnschecker.org/ to check propagation status
- Test with `nslookup -type=mx tabi.mn`

#### **4. Complete Zoho Setup**
- Return to Zoho Mail admin panel
- Verify domain (should work after DNS propagation)
- Create `info@tabi.mn` account
- Test sending/receiving emails

## 🔧 **Backend Configuration**

### **Update Environment Variables**

Add to your `backend/.env`:

```env
# Professional Email Configuration (Zoho Mail)
EMAIL_HOST=smtp.zoho.com
EMAIL_PORT=587
EMAIL_USER=info@tabi.mn
EMAIL_PASS=your-zoho-password
EMAIL_FROM=info@tabi.mn
EMAIL_FROM_NAME=Tabi

# Remove or comment out Gmail settings
# EMAIL_SERVICE=gmail
```

### **Install Required Dependencies**

```bash
cd backend
npm install nodemailer
```

## 🧪 **Testing Your Setup**

### **1. Test Email Receiving**
- Send test email to `info@tabi.mn`
- Check if it arrives in Zoho Mail inbox

### **2. Test Email Sending**
- Use the email verification in your onboarding flow
- Check if emails are sent successfully

### **3. Test SMTP Connection**
```javascript
// Add this test endpoint to your backend for testing
app.get('/test-email', async (req, res) => {
  try {
    const emailService = require('./src/services/emailService');
    const result = await emailService.testConnection();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## 💡 **Alternative: Quick Gmail Setup (No Domain Email)**

If you want to start immediately without domain email setup:

```env
# Simple Gmail Configuration (temporary)
EMAIL_SERVICE=gmail
EMAIL_USER=your-personal@gmail.com
EMAIL_PASS=your-gmail-app-password
EMAIL_FROM=your-personal@gmail.com
EMAIL_FROM_NAME=Tabi
```

This works immediately but emails come from your personal Gmail instead of `info@tabi.mn`.

## 🎯 **Recommended Timeline**

### **Immediate (5 minutes)**
- Use Gmail configuration for testing
- Email verification works right away

### **This Week (30 minutes)**
- Set up Zoho Mail with `info@tabi.mn`
- Professional email address for production

### **Benefits of Professional Email**
- ✅ **Brand credibility** - emails from info@tabi.mn
- ✅ **User trust** - professional appearance
- ✅ **Better deliverability** - domain reputation
- ✅ **Scalability** - add more email addresses later

## 🔧 **Troubleshooting**

### **Common Issues**

1. **DNS Propagation Delay**
   - Wait 24-48 hours for changes to take effect
   - Use DNS checker tools to verify

2. **Vercel DNS Limitations**
   - Some DNS record types might not be available
   - Contact Vercel support if needed

3. **Email Authentication**
   - Add SPF and DKIM records for better deliverability
   - Zoho provides these in their setup guide

## 📞 **Support Resources**

- **Zoho Mail Setup Guide**: https://www.zoho.com/mail/help/
- **Vercel DNS Documentation**: https://vercel.com/docs/concepts/projects/domains
- **DNS Propagation Checker**: https://dnschecker.org/

Would you like me to help you with:
1. **Setting up Zoho Mail** step by step?
2. **Configuring Vercel DNS records**?
3. **Quick Gmail setup** for immediate testing?

The Zoho Mail option gives you a professional `info@tabi.mn` email address completely free!
