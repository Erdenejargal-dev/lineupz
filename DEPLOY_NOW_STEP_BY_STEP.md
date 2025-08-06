# DEPLOY NOW - Step by Step Guide 🚨

## Current Issue
The production backend at `api.tabi.mn` is still missing the `/api/subscription/create` endpoint, causing the 404 error.

## Step-by-Step Deployment

### Step 1: Create Backend Archive
```bash
# In your project root directory
cd backend
zip -r ../backend-fixed.zip . -x node_modules/\*
cd ..
```

### Step 2: Upload to Your Lightsail Instance
```bash
# Replace YOUR_IP and your-key.pem with your actual values
scp -i ~/.ssh/your-key.pem backend-fixed.zip bitnami@YOUR_IP:/tmp/
```

### Step 3: Deploy on Server
```bash
# SSH into your server
ssh -i ~/.ssh/your-key.pem bitnami@YOUR_IP

# Run these commands on your server:
cd /home/bitnami

# Stop PM2
pm2 stop backend

# Backup current files
mkdir -p backup-$(date +%Y%m%d-%H%M%S)
cp -r src *.js package*.json .env backup-$(date +%Y%m%d-%H%M%S)/ 2>/dev/null || true

# Extract new files
unzip -o /tmp/backend-fixed.zip

# Install dependencies
npm install --production

# Start PM2
pm2 start server.js --name backend
pm2 save

# Check status
pm2 status
```

### Step 4: Verify Deployment
```bash
# Test the API endpoints
curl https://api.tabi.mn/api/subscription/plans
curl -X POST https://api.tabi.mn/api/subscription/create -H "Content-Type: application/json" -d '{"plan":"basic"}'
```

## Alternative: Manual File Upload

If you prefer manual upload:

1. **Zip your backend folder**
2. **Upload via your Lightsail console or FTP**
3. **SSH into server and run:**
```bash
cd /home/bitnami
pm2 stop backend
unzip -o backend-fixed.zip
npm install --production
pm2 start server.js --name backend
pm2 save
```

## Key Files That Must Be Deployed

Make sure these files are included in your deployment:

### ✅ Critical Files:
- `src/controllers/subscriptionController.js` (has createSubscription method)
- `src/routes/subscription.js` (has POST /create route)
- `src/app.js` (loads subscription routes)
- `src/services/bylService.js` (BYL integration)
- `src/controllers/paymentController.js` (fixed response handling)
- `.env` (BYL credentials)

## Verification Commands

After deployment, run these to verify:

```bash
# Should return subscription plans (working)
curl https://api.tabi.mn/api/subscription/plans

# Should return 401 Unauthorized (not 404 Route not found)
curl -X POST https://api.tabi.mn/api/subscription/create \
  -H "Content-Type: application/json" \
  -d '{"plan":"basic"}'
```

## If Still Getting 404

Check these on your server:

```bash
# SSH into server
ssh -i ~/.ssh/your-key.pem bitnami@YOUR_IP

# Check if files exist
ls -la /home/bitnami/src/controllers/subscriptionController.js
ls -la /home/bitnami/src/routes/subscription.js

# Check PM2 logs
pm2 logs backend

# Check if routes are loaded
grep -r "subscription/create" /home/bitnami/src/
```

## Emergency: Direct File Copy

If the above doesn't work, copy the specific files:

```bash
# Copy just the critical files
scp -i ~/.ssh/your-key.pem backend/src/controllers/subscriptionController.js bitnami@YOUR_IP:/home/bitnami/src/controllers/
scp -i ~/.ssh/your-key.pem backend/src/routes/subscription.js bitnami@YOUR_IP:/home/bitnami/src/routes/
scp -i ~/.ssh/your-key.pem backend/src/services/bylService.js bitnami@YOUR_IP:/home/bitnami/src/services/
scp -i ~/.ssh/your-key.pem backend/.env bitnami@YOUR_IP:/home/bitnami/

# Then restart PM2
ssh -i ~/.ssh/your-key.pem bitnami@YOUR_IP "pm2 restart backend"
```

---

**The 404 error will persist until the updated backend code is deployed to your production server.**
