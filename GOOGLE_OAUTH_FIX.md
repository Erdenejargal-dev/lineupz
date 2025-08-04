# Fix Google Calendar OAuth "access_denied" Error

## 🚨 **Issue Identified**

The error you're seeing:
```
Error 403: access_denied
```

This happens because your Google OAuth app is in **Testing mode** and only allows specific test users to authenticate. Other email addresses get blocked.

## 🔧 **Solution Options**

### **Option 1: Add Test Users (Quick Fix)**

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Select your "Tabi Calendar Integration" project

2. **Navigate to OAuth Consent Screen**
   - Go to APIs & Services → OAuth consent screen

3. **Add Test Users**
   - Scroll down to "Test users" section
   - Click "Add users"
   - Add email addresses that need access:
     ```
     your-email@gmail.com
     test-user@gmail.com
     any-other-email@gmail.com
     ```

4. **Save Changes**
   - Click "Save" to update test users list

### **Option 2: Publish Your App (Recommended for Production)**

1. **Complete App Information**
   - In OAuth consent screen, fill out all required fields:
     - App name: `Tabi`
     - User support email: `info@tabi.mn`
     - App logo: Upload Tabi logo (optional)
     - App domain: `tabi.mn`
     - Developer contact: `info@tabi.mn`

2. **Add Required Scopes**
   - Ensure these scopes are added:
     - `https://www.googleapis.com/auth/calendar`
     - `https://www.googleapis.com/auth/calendar.events`

3. **Submit for Verification**
   - Click "Publish App"
   - For calendar access, verification is usually quick
   - App will work for all users once approved

### **Option 3: Use Internal App (If You Have Google Workspace)**

1. **Change User Type**
   - In OAuth consent screen, change from "External" to "Internal"
   - This only works if you have Google Workspace domain

## 🎯 **Recommended Quick Fix**

For immediate testing, use **Option 1**:

### **Steps to Add Test Users:**

1. **Google Cloud Console** → Your Project
2. **APIs & Services** → **OAuth consent screen**
3. **Scroll to "Test users"** section
4. **Click "Add users"**
5. **Add these emails:**
   ```
   info@tabi.mn
   your-personal-email@gmail.com
   any-test-email@gmail.com
   ```
6. **Save changes**

### **Test the Fix:**
- Try Google Calendar connection with added email addresses
- Should work immediately after adding to test users

## 🚀 **Production Solution**

For production (all users), you need to **publish your app**:

### **App Information Required:**
```
App name: Tabi
User support email: info@tabi.mn
App domain: tabi.mn
Developer contact information: info@tabi.mn
Privacy policy URL: https://tabi.mn/privacy (create if needed)
Terms of service URL: https://tabi.mn/terms (create if needed)
```

### **Scopes Justification:**
```
Calendar scope: "Tabi needs calendar access to sync appointments 
and prevent double-booking for queue management system."
```

## 🔍 **Current OAuth Configuration**

Your current setup:
```
Client ID: 901939284027-opqagdv2058ljmt9pm2araop4elpnv61.apps.googleusercontent.com
Redirect URI: https://api.tabi.mn/api/google-calendar/callback
Scopes: calendar, calendar.events
```

This configuration is correct - the issue is just the test user restriction.

## ⚡ **Immediate Action**

**Right now, add test users:**

1. Go to https://console.cloud.google.com/
2. Select your project
3. APIs & Services → OAuth consent screen
4. Add test users section
5. Add the email addresses you want to test with
6. Save

**The Google Calendar integration will work immediately for added test users!**

## 🎉 **After Fix**

Once you add test users or publish the app:
- ✅ Google Calendar connection will work for all specified users
- ✅ Appointments will sync automatically to Google Calendar
- ✅ Calendar conflict detection will work
- ✅ Users will see appointments in their Google Calendar with reminders

The OAuth flow and calendar integration code is working perfectly - it's just the Google app permissions that need to be updated.
