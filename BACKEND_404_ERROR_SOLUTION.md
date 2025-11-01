# Backend 404 Error Solution Guide

## Problem
The subscription creation endpoint `POST https://api.tabi.mn/api/subscription/create` is returning a 404 (Not Found) error, indicating that the backend API is either not running or not properly deployed.

## Root Cause Analysis
Based on the error logs and investigation:

1. ✅ **Frontend Code**: The frontend is correctly making requests to the right endpoint
2. ✅ **Backend Code**: The subscription routes and controller are properly implemented
3. ❌ **Backend Deployment**: The backend server at `https://api.tabi.mn/` is not accessible

## Immediate Solution

### Step 1: Use the Emergency Deployment Script

Run the emergency deployment script I created:

```powershell
.\fix-backend-deployment.ps1 -LightsailIP 'YOUR_LIGHTSAIL_IP' -SSHKeyPath 'PATH_TO_YOUR_SSH_KEY'
```

**Example:**
```powershell
.\fix-backend-deployment.ps1 -LightsailIP '18.142.54.123' -SSHKeyPath 'C:\Users\YourName\Downloads\your-key.pem'
```

### Step 2: If You Don't Have AWS Lightsail Details

1. **Find Your Lightsail IP:**
   - Go to [AWS Lightsail Console](https://lightsail.aws.amazon.com/)
   - Find your instance
   - Copy the public IP address

2. **Find Your SSH Key:**
   - Look for a `.pem` file you downloaded when creating the instance
   - Common locations: Downloads folder, Desktop, or Documents

### Step 3: Manual Deployment (If Script Fails)

If the automated script doesn't work, follow these manual steps:

1. **Connect to your server:**
```bash
ssh -i /path/to/your/key.pem bitnami@YOUR_LIGHTSAIL_IP
```

2. **Stop existing processes:**
```bash
pm2 delete all
```

3. **Create backend directory:**
```bash
mkdir -p /home/bitnami/backend/src/{controllers,routes,models,services,middleware}
```

4. **Upload files from your local machine:**
```bash
# From your local lineupz directory
scp -i /path/to/key.pem -r backend/* bitnami@YOUR_IP:/home/bitnami/backend/
```

5. **Install dependencies and start:**
```bash
cd /home/bitnami/backend
npm install
pm2 start server.js --name backend
pm2 save
```

## Verification Steps

After deployment, verify the fix:

### 1. Test Root Endpoint
```bash
curl https://api.tabi.mn/
```
Should return: `{"message":"Tabi API is running!","version":"1.0.0","status":"healthy"}`

### 2. Test Subscription Plans
```bash
curl https://api.tabi.mn/api/subscription/plans
```
Should return subscription plans data.

### 3. Test Subscription Create (Should require auth)
```bash
curl -X POST https://api.tabi.mn/api/subscription/create \
  -H "Content-Type: application/json" \
  -d '{"plan":"basic"}'
```
Should return 401 (Unauthorized) - this is correct behavior!

## Alternative Solutions

### Option 1: Local Development
If deployment is taking too long, you can run the backend locally:

```bash
cd backend
npm install
npm start
```

Then update your frontend to use `http://localhost:3001` instead of `https://api.tabi.mn/`

### Option 2: Use Different Hosting
Consider deploying to:
- **Heroku**: Easy deployment with git
- **Railway**: Simple Node.js hosting
- **DigitalOcean App Platform**: Managed hosting
- **Vercel**: For serverless functions

## Expected Results After Fix

Once the backend is properly deployed:

1. ✅ `https://api.tabi.mn/` should return API status
2. ✅ `https://api.tabi.mn/api/subscription/plans` should return plans
3. ✅ `https://api.tabi.mn/api/subscription/create` should return 401 (auth required)
4. ✅ Frontend subscription creation should work properly

## Troubleshooting Common Issues

### Issue: SSH Connection Failed
**Solution:** Check your IP address and SSH key permissions:
```bash
chmod 400 /path/to/your/key.pem
```

### Issue: PM2 Not Found
**Solution:** Install PM2 globally:
```bash
npm install -g pm2
```

### Issue: Port Already in Use
**Solution:** Kill existing processes:
```bash
sudo lsof -t -i:3001 | xargs kill -9
```

### Issue: Environment Variables Missing
**Solution:** Ensure `.env` file is uploaded with correct values:
```bash
cat /home/bitnami/backend/.env
```

## Contact Information

If you continue to experience issues:

1. Check the PM2 logs: `pm2 logs backend`
2. Verify the server status: `pm2 status`
3. Test the endpoints manually with curl
4. Check if the domain `api.tabi.mn` is properly configured to point to your Lightsail instance

## Summary

The 404 error is caused by the backend not being properly deployed or running. The solution is to redeploy the backend with all the subscription endpoints. Use the provided script for automated deployment or follow the manual steps if needed.
