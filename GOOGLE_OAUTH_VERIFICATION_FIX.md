# Google OAuth Verification Fix - Remove "Unverified App" Warning

## Issue
Even though Google approved your OAuth app verification for project `901939284027` (tabi-calendar-integration), users still see "Google hasn't verified this app" warning when connecting Google Calendar.

## Root Cause
The OAuth consent screen is still in "Testing" mode or needs to be published after verification approval.

## Solution Steps

### Step 1: Access Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select project: **tabi-calendar-integration** (Project ID: 901939284027)

### Step 2: Update OAuth Consent Screen
1. Navigate to **APIs & Services** → **OAuth consent screen**
2. You should see your app with "Verification status: Verified" or similar

### Step 3: Publish the App
1. Look for **Publishing status** section
2. If it shows "Testing", click **PUBLISH APP** button
3. Confirm the publishing action

### Step 4: Verify App Information
Ensure these details are correct:
- **App name**: Tabi
- **User support email**: eegiitomah@gmail.com
- **Developer contact email**: eegiitomah@gmail.com
- **App domain**: tabi.mn
- **Authorized domains**: 
  - tabi.mn
  - api.tabi.mn

### Step 5: Check Scopes
Verify these scopes are approved:
- `https://www.googleapis.com/auth/calendar`
- `https://www.googleapis.com/auth/calendar.events`

### Step 6: Test the Integration
1. Clear browser cache/cookies
2. Try connecting Google Calendar from a different Gmail account
3. The warning should no longer appear

## Current Configuration (Verified)
```
GOOGLE_CLIENT_ID=901939284027-opqagdv2058ljmt9pm2araop4elpnv61.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_REDIRECT_URI=https://api.tabi.mn/api/google-calendar/callback
```

## If Still Shows Warning

### Option 1: Check Verification Status
1. In OAuth consent screen, look for "Verification status"
2. It should show "Verified" with a green checkmark
3. If not, the verification might still be processing

### Option 2: Re-submit for Verification (if needed)
1. Go to **OAuth consent screen** → **App verification**
2. Check if additional steps are required
3. Submit any missing documentation

### Option 3: Add Test Users (Temporary)
If publishing doesn't work immediately:
1. Go to **OAuth consent screen** → **Test users**
2. Add the Gmail accounts you want to test with
3. These users won't see the warning

## Expected Result
After publishing, users should see:
- "Tabi wants to access your Google Account"
- No "unverified app" warning
- Clean OAuth consent flow

## Troubleshooting

### If "PUBLISH APP" button is not available:
- Verification might still be processing
- Check for any pending requirements in the console
- Contact Google support if verification was approved but publishing is blocked

### If warning persists after publishing:
- Wait 24-48 hours for changes to propagate
- Clear browser cache completely
- Try incognito/private browsing mode
- Test with different Gmail accounts

## Notes
- Verification approval doesn't automatically publish the app
- Publishing is a separate step required to remove warnings
- Changes may take time to propagate across Google's systems
