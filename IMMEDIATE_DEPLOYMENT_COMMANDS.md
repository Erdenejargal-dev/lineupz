# IMMEDIATE DEPLOYMENT COMMANDS - BYL FIX

## Issue Confirmed ✅
- Production API has `/api/subscription/plans` ✅ (working)
- Production API missing `/api/subscription/create` ❌ (404 error)
- The updated subscription controller with BYL integration needs to be deployed

## Quick Deployment Options

### Option 1: Manual Upload (Fastest)
```bash
# 1. Create a zip of your backend folder
# 2. Upload to your Lightsail instance
# 3. Extract and restart PM2

# Commands to run on your Lightsail server:
cd /home/bitnami
pm2 stop backend
# Upload your backend.zip here
unzip -o backend.zip
npm install --production
pm2 start server.js --name backend
pm2 save
```

### Option 2: Automated Script (Recommended)
```bash
# Update the script with your details first:
# Edit deploy-lightsail-pm2.sh:
LIGHTSAIL_IP="YOUR_ACTUAL_IP"
SSH_KEY_PATH="~/.ssh/your-key.pem"

# Then run:
chmod +x deploy-lightsail-pm2.sh
./deploy-lightsail-pm2.sh
```

### Option 3: Direct SCP Upload
```bash
# Replace YOUR_IP and your-key.pem with actual values
scp -i ~/.ssh/your-key.pem -r backend/ bitnami@YOUR_IP:/tmp/backend-new
ssh -i ~/.ssh/your-key.pem bitnami@YOUR_IP "
  pm2 stop backend;
  cp -r /home/bitnami /home/bitnami-backup-$(date +%Y%m%d);
  rm -rf /home/bitnami/src /home/bitnami/*.js /home/bitnami/package*.json;
  cp -r /tmp/backend-new/* /home/bitnami/;
  cd /home/bitnami && npm install --production;
  pm2 start server.js --name backend;
  pm2 save;
  pm2 status
"
```

## What Files Need to be Deployed

### Critical Files with BYL Integration:
- `backend/src/controllers/subscriptionController.js` ✅ (has createSubscription with BYL)
- `backend/src/controllers/paymentController.js` ✅ (fixed response handling)
- `backend/src/services/bylService.js` ✅ (enhanced logging)
- `backend/src/routes/subscription.js` ✅ (has create route)
- `backend/src/app.js` ✅ (loads subscription routes)
- `backend/.env` ✅ (BYL credentials)

## Expected Result After Deployment
```bash
# This should return 401 (auth required) instead of 404 (route not found)
curl -X POST https://api.tabi.mn/api/subscription/create \
  -H "Content-Type: application/json" \
  -d '{"plan":"basic"}'
```

## Verification Commands
```bash
# Test the API after deployment:
curl https://api.tabi.mn/api/subscription/plans  # Should work
curl -X POST https://api.tabi.mn/api/subscription/create  # Should return 401, not 404
```

## Current Status
- ❌ Production backend missing BYL integration
- ✅ Local backend has complete BYL integration
- ⏳ Deployment needed to fix 404 error

---

**URGENT**: Deploy the updated backend to resolve the subscription creation 404 error.
