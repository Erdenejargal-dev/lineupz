# IMMEDIATE DEPLOYMENT COMMANDS - BUSINESS ROUTES FIX

## Critical Issue
Backend is crashing with "TypeError: argument handler must be a function" in business.js routes.

## Fix Applied
Fixed authentication middleware import in `backend/src/routes/business.js`:
- Changed from `const auth = require('../middleware/auth')` 
- To `const { authenticateToken } = require('../middleware/auth')`

## DEPLOY NOW - Manual Commands

### Step 1: Create Package
```bash
tar -czf backend-fix.tar.gz backend/
```

### Step 2: Upload to Server
```bash
scp backend-fix.tar.gz bitnami@api.tabi.mn:/home/bitnami/
```

### Step 3: Deploy on Server
```bash
ssh bitnami@api.tabi.mn
```

### Step 4: Run on Server
```bash
cd /home/bitnami

# Stop backend
pm2 stop backend

# Backup current code
cp -r src src_backup_$(date +%Y%m%d_%H%M%S)

# Deploy new code
tar -xzf backend-fix.tar.gz
cp -r backend/src/* src/

# Restart backend
pm2 start backend --name backend

# Check status
pm2 status
pm2 logs backend --lines 10
```

## Verification Commands
```bash
# Check for errors
pm2 logs backend --lines 20

# Test business endpoint
curl https://api.tabi.mn/api/business/plans

# Test subscription endpoint
curl -X POST https://api.tabi.mn/api/subscription/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"plan":"starter"}'
```

## Expected Results
- ✅ No "argument handler must be a function" errors
- ✅ Backend starts successfully
- ✅ Business routes work
- ✅ Subscription creation returns 200, not 404

## Alternative: Use Bash Script
```bash
./deploy.sh
```

## Files Fixed
- `backend/src/routes/business.js` - Authentication middleware import corrected

## Status
🔴 **CRITICAL** - Backend is down, needs immediate deployment
⚡ **READY** - Fix is prepared and ready to deploy
