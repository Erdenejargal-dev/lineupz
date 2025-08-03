# 📱 Cloud SMS Service Setup Guide

## 🚀 Quick Setup (Already Complete!)

Your system has been migrated to use a reliable cloud SMS service! Here's how it works:

### **Current Configuration:**
```env
SMS_API_URL=https://smstabi.tabisms.online
SMS_API_KEY=512037a7-d978-4ac2-b083-94624981862d
```

### **How It Works:**

**1. Smart Phone Number Formatting for Mongolia:**
```javascript
// Users can enter any format:
"99591829"        → "+97699591829"
"97699591829"     → "+97699591829" 
"+97699591829"    → "+97699591829"
"(976) 99-591-829" → "+97699591829"
```

**2. SMS Message Format:**
```json
{
  "to": "+97699591829",
  "message": "🎯 You've joined Coffee Shop! Your position: #3. Est. wait: 15min. Code: 123456"
}
```

## 📱 SMS Examples

### **Queue Notifications:**
```
🎯 You've joined Coffee Shop! Your position: #3. Est. wait: 15min. Code: 123456

📍 Queue update for Coffee Shop: You're now #2. Est. wait: 10min.

🔔 It's your turn at Coffee Shop! Please proceed to the service area. Code: 123456
```

### **Restaurant Notifications (Hybrid Lines):**
```
🍽️ Your table is ready at Restaurant! Please proceed to the host stand. Party size: 4

📍 Table assigned at Restaurant! Table #5. Please follow your server.

⏱️ Wait time update for Restaurant: Approximately 20 minutes for your party of 4.

🎉 Reservation confirmed at Restaurant! Date: 7/23/2025, 7:00 PM. Party size: 4.
```

### **Appointment Notifications:**
```
✅ Appointment confirmed at Hair Salon! Date: 7/23/2025, 2:00 PM. Duration: 45min. Code: 789012

📅 Reminder: You have an appointment at Hair Salon tomorrow at 2:00 PM. Duration: 45min.

⏰ Your appointment at Hair Salon is in 1 hour! Please arrive on time.
```

## 🔧 Current Status

### **Development Mode (Right Now):**
```javascript
// Without SMS_GATEWAY_URL configured - logs to console
console.log(`📱 SMS to +97699591829: Your table is ready!`);
// Output: 🔧 Development mode: SMS would be sent to +97699591829
```

### **Production Mode (Cloud SMS - Active Now!):**
```javascript
// With SMS_API_URL configured - sends real SMS via cloud service
POST https://smstabi.tabisms.online
{
  "to": "+97699591829",
  "message": "Your table is ready!"
}
// Output: ✅ SMS sent successfully via Cloud SMS
```

## ⚙️ SMS is Already Enabled!

✅ **Your system is ready to send SMS!** The cloud SMS service is already configured and active.

No additional setup required - all SMS notifications will work immediately.

## 🧪 Test SMS

Use the test endpoint to verify everything works:

```bash
POST /api/notifications/test
Authorization: Bearer your_jwt_token
{
  "phoneNumber": "99591829",
  "message": "Test SMS from Tabi!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "SMS sent successfully via Android Gateway",
  "messageId": "msg_12345"
}
```

## 📱 When SMS Gets Sent

### **Automatic Notifications:**

**1. OTP Authentication:**
- User requests login/signup → Instant OTP SMS
- Example: `Tabi: Your OTP code is 789431. Valid for 10 minutes. Do not share this code.`

**2. Queue Join:**
- User joins any queue → Instant SMS with position and wait time

**3. Restaurant (Hybrid Lines):**
- User joins waitlist → SMS with wait estimate
- Table ready → SMS to come to host stand
- Table assigned → SMS with table number

**4. Appointments:**
- Appointment booked → Confirmation SMS
- 24 hours before → Reminder SMS
- 1 hour before → Final reminder SMS
- Cancelled/rescheduled → Update SMS

### **Manual Notifications:**
- Business owners can send custom messages to all people in queue
- Test notifications for debugging

## 🛡️ Security Features

**1. Phone Number Validation:**
- Automatic +976 formatting for Mongolia
- Removes invalid characters
- Validates format before sending

**2. Authentication:**
- Basic Auth with your gateway credentials
- JWT tokens for API access
- Environment variable protection

**3. Error Handling:**
- Graceful fallback if SMS fails
- Detailed logging for debugging
- Non-blocking (app works even if SMS fails)

## 🚨 Troubleshooting

### **Common Issues:**

**"SMS not sending"**
- Check your gateway URL is accessible: `http://192.168.185.160:8080/message`
- Verify login/password in `.env` file
- Check server logs for detailed errors

**"Invalid phone number"**
- System auto-formats Mongolia numbers (+976)
- Users can enter: `99591829` or `97699591829` or `+97699591829`
- All formats work automatically

**"Gateway connection failed"**
- Ensure your Android device is on same network
- Check if gateway app is running on Android
- Verify port 8080 is accessible

### **Phone Number Examples:**
```javascript
✅ User enters: "99591829"     → System sends to: "+97699591829"
✅ User enters: "97699591829"  → System sends to: "+97699591829"
✅ User enters: "+97699591829" → System sends to: "+97699591829"
✅ User enters: "(976) 99-591-829" → System sends to: "+97699591829"
```

## 💰 Cost Benefits

**Android SMS Gateway vs Twilio:**
- **Android Gateway**: FREE (uses your phone plan)
- **Twilio**: ~$0.0075 per SMS + monthly fees
- **For 1000 SMS/month**: Save ~$7.50+ monthly

## 🎯 Next Steps

1. **Update your `.env`** with real gateway credentials
2. **Test with your phone number** using the test endpoint
3. **Launch your business** with automatic SMS notifications! 🚀

## 📊 SMS Analytics

Track SMS performance in your server logs:
```
📱 SMS to +97699591829: Your table is ready!
✅ SMS sent successfully to +97699591829
```

---

**Need Help?**
- Check server console logs for detailed error messages
- Verify your Android SMS Gateway app is running
- Test connectivity to `http://192.168.185.160:8080/message`
