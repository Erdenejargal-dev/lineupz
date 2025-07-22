# 📱 Twilio SMS Setup Guide

## 🚀 Quick Setup (5 minutes)

### 1. Create Twilio Account
1. Go to [twilio.com](https://www.twilio.com) and sign up
2. Verify your email and phone number
3. You'll get **$15-20 in free trial credits** 🎉

### 2. Get Your Credentials
From your [Twilio Console](https://console.twilio.com):

**Account Info (top right):**
- **Account SID**: `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- **Auth Token**: Click "Show" to reveal (keep this secret!)

**Phone Number:**
- Go to **Phone Numbers** → **Manage** → **Active numbers**
- Copy your Twilio phone number (e.g., `+1234567890`)

### 3. Update Environment Variables
In your `backend/.env` file, replace the placeholder values:

```env
# Twilio SMS Configuration
TWILIO_SID=AC1234567890abcdef1234567890abcdef  # Your Account SID
TWILIO_TOKEN=your_actual_auth_token_here       # Your Auth Token  
TWILIO_PHONE=+1234567890                       # Your Twilio phone number
```

### 4. Test SMS (Optional)
Use the test endpoint to verify everything works:

```bash
POST /api/notifications/test
{
  "phoneNumber": "+1234567890",
  "message": "Test SMS from Tabi!"
}
```

## 💰 Pricing (Very Affordable)

**Trial Account:**
- **$15-20 free credits** when you sign up
- Perfect for testing and initial launch

**Production Pricing:**
- **SMS**: ~$0.0075 per message (less than 1 cent!)
- **Phone Number**: $1/month for your Twilio number
- **Example**: 1000 SMS messages = ~$7.50

## 🔧 How It Works

### Development Mode (No Twilio)
```javascript
// Without Twilio credentials - just logs to console
console.log(`📱 SMS to +1234567890: Your table is ready!`);
// Output: 🔧 Development mode: SMS would be sent to +1234567890
```

### Production Mode (With Twilio)
```javascript
// With Twilio credentials - sends real SMS
await client.messages.create({
  body: "🍽️ Your table is ready at Restaurant! Please proceed to the host stand.",
  from: process.env.TWILIO_PHONE,
  to: "+1234567890"
});
// Output: ✅ SMS sent successfully to +1234567890
```

## 📱 SMS Examples

### Queue Notifications
```
🎯 You've joined Coffee Shop! Your position: #3. Est. wait: 15min. Code: 123456

📍 Queue update for Coffee Shop: You're now #2. Est. wait: 10min.

🔔 It's your turn at Coffee Shop! Please proceed to the service area. Code: 123456
```

### Restaurant Notifications
```
🍽️ Your table is ready at Restaurant! Please proceed to the host stand. Party size: 4

📍 Table assigned at Restaurant! Table #5. Please follow your server.

⏱️ Wait time update for Restaurant: Approximately 20 minutes for your party of 4.
```

### Appointment Notifications
```
✅ Appointment confirmed at Hair Salon! Date: 7/23/2025, 2:00:00 PM. Duration: 45min. Code: 789012

⏰ Your appointment at Hair Salon is in 1 hour! Time: 7/23/2025, 2:00:00 PM. Please arrive on time.
```

## 🛡️ Security Best Practices

1. **Keep Auth Token Secret**: Never commit it to git
2. **Use Environment Variables**: Always use `.env` files
3. **Verify Phone Numbers**: Validate phone numbers before sending
4. **Rate Limiting**: Implement rate limits to prevent spam

## 🚨 Troubleshooting

### Common Issues:

**"SMS not sending"**
- Check your Twilio credentials are correct
- Verify phone number format (include country code: `+1234567890`)
- Check Twilio console for error logs

**"Invalid phone number"**
- Must include country code (e.g., `+1` for US)
- Remove spaces, dashes, parentheses
- Format: `+1234567890` not `(123) 456-7890`

**"Insufficient funds"**
- Add credits to your Twilio account
- Upgrade from trial to paid account if needed

### Phone Number Formats:
```javascript
✅ Correct: "+1234567890"
✅ Correct: "+976123456789" (Mongolia)
❌ Wrong: "123-456-7890"
❌ Wrong: "(123) 456-7890"
❌ Wrong: "1234567890" (missing country code)
```

## 🌍 International Support

Twilio supports SMS in **180+ countries**:
- **US/Canada**: `+1234567890`
- **Mongolia**: `+976123456789`
- **UK**: `+441234567890`
- **And many more...**

## 🎯 Next Steps

1. **Sign up for Twilio** (5 minutes)
2. **Update your `.env` file** with real credentials
3. **Test with a real phone number**
4. **Launch your restaurant/business** with SMS notifications! 🚀

---

**Need Help?** 
- [Twilio Documentation](https://www.twilio.com/docs/sms)
- [Twilio Console](https://console.twilio.com)
- Check server logs for detailed error messages
