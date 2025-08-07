# Business Routes Authentication Fix

## Problem Identified

The backend was crashing with the following error:
```
TypeError: argument handler must be a function
    at Route.<computed> [as post] (/home/bitnami/node_modules/router/lib/route.js:228:15)
    at Router.<computed> [as post] (/home/bitnami/node_modules/router/index.js:448:19)
    at Object.<anonymous> (/home/bitnami/src/routes/business.js:20:8)
```

## Root Cause

The issue was in `backend/src/routes/business.js` where the authentication middleware was incorrectly imported:

**BEFORE (Incorrect):**
```javascript
const auth = require('../middleware/auth');
// ...
router.post('/register', auth, registerBusiness);
```

**AFTER (Fixed):**
```javascript
const { authenticateToken } = require('../middleware/auth');
// ...
router.post('/register', authenticateToken, registerBusiness);
```

## The Problem Explained

1. The `auth.js` middleware exports an object with multiple functions:
   ```javascript
   module.exports = {
     authenticateToken,
     optionalAuth,
     requirePhoneVerification,
     requireCreator
   };
   ```

2. The business routes were trying to use `auth` directly as a middleware function, but `auth` was actually an object, not a function.

3. This caused Express to receive an object instead of a function for the route handler, resulting in the "argument handler must be a function" error.

## Files Fixed

### 1. backend/src/routes/business.js
- Changed import from `const auth = require('../middleware/auth')` to `const { authenticateToken } = require('../middleware/auth')`
- Updated all route handlers to use `authenticateToken` instead of `auth`

## Deployment Instructions

### Option 1: Use the Fix Script
```powershell
.\fix-business-routes.ps1
```

### Option 2: Manual Deployment
```bash
# 1. Create deployment package
tar -czf backend-business-fix.tar.gz backend/

# 2. Upload to server
scp backend-business-fix.tar.gz bitnami@api.tabi.mn:/home/bitnami/

# 3. Deploy on server
ssh bitnami@api.tabi.mn
cd /home/bitnami

# Stop backend
pm2 stop backend

# Backup current code
cp -r src src_backup_business_fix

# Deploy new code
tar -xzf backend-business-fix.tar.gz
cp -r backend/src/* src/

# Restart backend
pm2 start backend --name backend

# Check status
pm2 status
pm2 logs backend --lines 10
```

### Option 3: Use Existing Deployment Script
```powershell
.\deploy-backend.ps1
```

## Verification Steps

After deployment, verify the fix:

1. **Check PM2 logs for errors:**
   ```bash
   pm2 logs backend --lines 20
   ```

2. **Test business plans endpoint:**
   ```bash
   curl https://api.tabi.mn/api/business/plans
   ```

3. **Verify no authentication errors:**
   - Look for absence of "argument handler must be a function" errors
   - Ensure business routes are accessible

4. **Test subscription creation:**
   ```bash
   curl -X POST https://api.tabi.mn/api/subscription/create \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -d '{"plan":"starter"}'
   ```

## Expected Results

- ✅ Backend starts without crashing
- ✅ No "argument handler must be a function" errors in logs
- ✅ Business routes respond correctly
- ✅ Subscription creation works (POST /api/subscription/create returns 200, not 404)
- ✅ Authentication middleware works properly on protected routes

## Related Issues Fixed

This fix resolves:
- Backend crashing on startup due to business routes
- 404 errors on subscription creation endpoints
- Authentication middleware not working on business routes
- PM2 process constantly restarting

## Technical Details

The authentication middleware in `backend/src/middleware/auth.js` exports multiple functions:
- `authenticateToken`: Main authentication function
- `optionalAuth`: Optional authentication for public/private routes
- `requirePhoneVerification`: Requires phone verification
- `requireCreator`: Requires creator status

All route files should import the specific function they need:
```javascript
const { authenticateToken } = require('../middleware/auth');
```

Not the entire module:
```javascript
const auth = require('../middleware/auth'); // ❌ Wrong
```

## Status

✅ **FIXED** - Business routes authentication middleware corrected
🔄 **PENDING DEPLOYMENT** - Needs to be deployed to production server

## Next Steps

1. Deploy the fix using one of the methods above
2. Monitor backend logs for stability
3. Test subscription creation functionality
4. Verify all business-related endpoints work correctly
