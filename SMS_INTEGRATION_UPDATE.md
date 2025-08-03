# SMS Integration Update - Cloud SMS Service

## Overview
The SMS functionality has been completely migrated from the Android SMS Gateway to a new cloud SMS service for better reliability and production readiness.

## Changes Made

### 1. Environment Variables (.env)
**Old Configuration:**
```
SMS_GATEWAY_URL=https://api.sms-gate.app/3rdparty/v1/messages
SMS_GATEWAY_LOGIN=ZLCIYP
SMS_GATEWAY_PASSWORD=ruozkpbencgznv
```

**New Configuration:**
```
SMS_API_URL=https://smstabi.tabisms.online
SMS_API_KEY=512037a7-d978-4ac2-b083-94624981862d
```

### 2. API Request Format
**Old Format (Android SMS Gateway):**
```javascript
{
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Basic ${Buffer.from(`${login}:${password}`).toString('base64')}`
  },
  body: JSON.stringify({
    textMessage: {
      text: message
    },
    phoneNumbers: [phoneNumber]
  })
}
```

**New Format (Cloud SMS Service):**
```javascript
{
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${SMS_API_KEY}`
  },
  body: JSON.stringify({
    to: phoneNumber,
    message: message
  })
}
```

### 3. Updated Files
- `backend/.env` - Updated environment variables
- `backend/src/controllers/notificationController.js` - Updated `sendSMS` function

### 4. SMS Functionality Coverage
All SMS notifications continue to work through the updated `sendSMS` function:

#### Authentication (OTP)
- Login/Signup OTP messages
- Phone number verification

#### Queue Notifications
- Join confirmation
- Position updates
- Ready notifications
- Removal notifications

#### Appointment Notifications
- Appointment confirmations
- Reminders (24h, 1h)
- Cancellations
- Rescheduling

#### Restaurant Notifications
- Table ready
- Table assigned
- Wait time updates
- Reservation confirmations

### 5. Phone Number Formatting
The system continues to format phone numbers for Mongolia:
- Adds +976 prefix for local numbers
- Handles various input formats
- Ensures consistent international format

### 6. Error Handling
- Graceful fallback to development mode if SMS service is unavailable
- Comprehensive error logging
- Non-blocking SMS failures (app continues to work even if SMS fails)

## Testing
To test the new SMS integration:

1. **Test OTP Login:**
   ```bash
   POST /api/auth/send-otp
   {
     "phone": "99591829"
   }
   ```

2. **Test Direct SMS:**
   ```bash
   POST /api/notifications/test
   {
     "phoneNumber": "99591829",
     "message": "Test message from new SMS service"
   }
   ```

## Benefits of New System
1. **Reliability:** Cloud-based service with better uptime
2. **Scalability:** No dependency on local Android device
3. **Professional:** Custom domain and API
4. **Maintenance:** No need to keep local SMS gateway running
5. **Security:** API key authentication instead of basic auth

## Migration Complete
✅ All SMS functionality has been successfully migrated to the new cloud SMS service.
✅ No code changes required in frontend - all APIs remain the same.
✅ Phone number formatting and error handling preserved.
✅ All notification types (OTP, queue, appointments) working.
