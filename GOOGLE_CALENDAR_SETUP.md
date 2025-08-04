# Google Calendar Integration Setup Guide

## 🎯 **Overview**

To make the Google Calendar integration functional, you need to obtain Google OAuth2 credentials from the Google Cloud Console. This guide will walk you through the complete setup process.

## 📋 **Prerequisites**

- Google account (Gmail account)
- Access to Google Cloud Console
- Your Tabi application domain/URL

## 🚀 **Step-by-Step Setup**

### **Step 1: Create a Google Cloud Project**

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create a New Project**
   - Click "Select a project" dropdown at the top
   - Click "New Project"
   - Enter project name: `Tabi Calendar Integration`
   - Click "Create"

3. **Select Your Project**
   - Make sure your new project is selected in the dropdown

### **Step 2: Enable Google Calendar API**

1. **Navigate to APIs & Services**
   - In the left sidebar, click "APIs & Services" → "Library"

2. **Search for Calendar API**
   - In the search box, type "Google Calendar API"
   - Click on "Google Calendar API" from the results

3. **Enable the API**
   - Click the "Enable" button
   - Wait for the API to be enabled

### **Step 3: Configure OAuth Consent Screen**

1. **Go to OAuth Consent Screen**
   - In the left sidebar, click "APIs & Services" → "OAuth consent screen"

2. **Choose User Type**
   - Select "External" (unless you have a Google Workspace account)
   - Click "Create"

3. **Fill App Information**
   ```
   App name: Tabi
   User support email: your-email@gmail.com
   App logo: (optional - upload your Tabi logo)
   App domain: your-domain.com (e.g., tabi.mn)
   Developer contact information: your-email@gmail.com
   ```

4. **Add Scopes**
   - Click "Add or Remove Scopes"
   - Search for and add these scopes:
     - `https://www.googleapis.com/auth/calendar`
     - `https://www.googleapis.com/auth/calendar.events`
   - Click "Update"

5. **Add Test Users (for development)**
   - Add your email and any test user emails
   - Click "Save and Continue"

### **Step 4: Create OAuth2 Credentials**

1. **Go to Credentials**
   - In the left sidebar, click "APIs & Services" → "Credentials"

2. **Create Credentials**
   - Click "Create Credentials" → "OAuth client ID"

3. **Configure OAuth Client**
   - Application type: "Web application"
   - Name: "Tabi Calendar Integration"

4. **Add Authorized JavaScript Origins and Redirect URIs**
   
   **Authorized JavaScript origins** (no paths, no trailing slash):
   ```
   https://tabi.mn
   https://api.tabi.mn
   ```
   
   **Authorized redirect URIs** (with full path):
   ```
   https://api.tabi.mn/api/google-calendar/callback
   ```
   
   For development (optional):
   ```
   JavaScript origins: http://localhost:3000, http://localhost:5000
   Redirect URIs: http://localhost:5000/api/google-calendar/callback
   ```

5. **Create and Download**
   - Click "Create"
   - **IMPORTANT**: Copy the Client ID and Client Secret immediately
   - Download the JSON file for backup

## 🔧 **Environment Configuration**

### **Backend Environment Variables**

Add these to your `backend/.env` file:

```env
# Google Calendar Integration (PRODUCTION CONFIGURATION)
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=https://api.tabi.mn/api/google-calendar/callback

# Frontend URL
FRONTEND_URL=https://tabi.mn
```

### **Example Configuration**

```env
# Example (replace with your actual values from Google Cloud Console)
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnopqrstuvwxyz
GOOGLE_REDIRECT_URI=https://api.tabi.mn/api/google-calendar/callback
FRONTEND_URL=https://tabi.mn
```

## 🛠 **Installation & Dependencies**

### **Backend Dependencies**

The `googleapis` package is already added to your `package.json`. Install it:

```bash
cd backend
npm install
```

### **Verify Installation**

Check that `googleapis` is in your `backend/package.json`:

```json
{
  "dependencies": {
    "googleapis": "^144.0.0"
  }
}
```

## 🧪 **Testing the Integration**

### **1. Start Your Backend**

```bash
cd backend
npm run dev
```

### **2. Test OAuth Flow**

1. **Get Auth URL**
   ```bash
   curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
        http://localhost:5000/api/google-calendar/auth-url
   ```

2. **Check Response**
   ```json
   {
     "success": true,
     "authUrl": "https://accounts.google.com/oauth/authorize?..."
   }
   ```

### **3. Test Calendar Status**

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:5000/api/google-calendar/status
```

## 🔒 **Security Considerations**

### **Environment Variables Security**

1. **Never commit credentials to Git**
   - Add `.env` to your `.gitignore`
   - Use environment variables in production

2. **Use Different Credentials for Different Environments**
   - Development: `localhost` redirect URIs
   - Production: Your actual domain redirect URIs

### **OAuth Security**

1. **State Parameter**: Already implemented for CSRF protection
2. **HTTPS in Production**: Always use HTTPS for production OAuth flows
3. **Token Storage**: Tokens are securely stored in your database

## 🌐 **Production Deployment**

### **Update Redirect URIs**

When deploying to production:

1. **Go back to Google Cloud Console**
2. **Edit your OAuth client**
3. **Add production redirect URIs**:
   ```
   https://your-domain.com/api/google-calendar/callback
   https://api.your-domain.com/google-calendar/callback
   ```

### **Update Environment Variables**

```env
GOOGLE_REDIRECT_URI=https://api.your-domain.com/google-calendar/callback
```

## 🎯 **OAuth Flow Explanation**

### **How It Works**

1. **User clicks "Connect Google Calendar"**
2. **Backend generates OAuth URL** with your client ID
3. **User is redirected to Google** for authorization
4. **Google redirects back** with authorization code
5. **Backend exchanges code** for access/refresh tokens
6. **Tokens are stored** in user's database record
7. **Calendar sync is enabled** automatically

### **User Experience**

1. **In Onboarding**: Users can connect during step 5
2. **In Dashboard**: Users can connect anytime via settings
3. **Automatic Sync**: New appointments appear in Google Calendar
4. **Conflict Detection**: Prevents double-booking

## 🔧 **Troubleshooting**

### **Common Issues**

1. **"redirect_uri_mismatch" Error**
   - Check that your redirect URI exactly matches what's in Google Console
   - Include the full path: `/api/google-calendar/callback`

2. **"invalid_client" Error**
   - Verify your Client ID and Client Secret are correct
   - Check that they're properly set in environment variables

3. **"access_denied" Error**
   - User declined authorization
   - Make sure OAuth consent screen is properly configured

### **Debug Steps**

1. **Check Environment Variables**
   ```bash
   echo $GOOGLE_CLIENT_ID
   echo $GOOGLE_CLIENT_SECRET
   ```

2. **Check API Logs**
   - Look at your backend console for error messages
   - Check Google Cloud Console logs

3. **Verify API is Enabled**
   - Ensure Google Calendar API is enabled in your project

## 📞 **Support**

### **Google Documentation**
- [Google Calendar API](https://developers.google.com/calendar/api)
- [OAuth 2.0 for Web Applications](https://developers.google.com/identity/protocols/oauth2/web-server)

### **Testing Credentials**

For development/testing, you can use these test values (replace with real ones):

```env
# TEST CREDENTIALS (NOT FUNCTIONAL - REPLACE WITH REAL ONES)
GOOGLE_CLIENT_ID=123456789-example.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-example_secret_key
GOOGLE_REDIRECT_URI=http://localhost:5000/api/google-calendar/callback
```

## ✅ **Setup Complete Checklist**

- [ ] Created Google Cloud Project
- [ ] Enabled Google Calendar API
- [ ] Configured OAuth consent screen
- [ ] Created OAuth2 credentials
- [ ] Added redirect URIs
- [ ] Set environment variables
- [ ] Installed dependencies
- [ ] Tested OAuth flow
- [ ] Verified calendar integration

Once you complete these steps, your Google Calendar integration will be fully functional!
