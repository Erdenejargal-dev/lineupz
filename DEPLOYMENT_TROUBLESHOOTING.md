# Deployment Troubleshooting Guide

## Current Status
You've successfully deployed the backend using these commands:
```bash
ssh -i "C:/Users/HiTech/Downloads/default.pem" bitnami@13.229.113.229
pm2 delete backend         
rm -rf backend  
cd /home/bitnami
unzip -o backend.zip
npm install
pm2 start server.js --name backend
pm2 save
pm2 startup
```

## Issue: API Still Not Accessible
The API at `https://api.tabi.mn/` is still not responding, which suggests one of these issues:

### 1. Check PM2 Status
First, verify if your backend is actually running:

```bash
ssh -i "C:/Users/HiTech/Downloads/default.pem" bitnami@13.229.113.229
pm2 status
pm2 logs backend --lines 20
```

**Expected Output:**
- PM2 should show `backend` process as `online`
- Logs should show "Server running on port 3001" or similar

### 2. Check Port and Process
Verify the backend is listening on the correct port:

```bash
netstat -tlnp | grep :3001
ps aux | grep node
```

### 3. Domain Configuration Issue
The domain `api.tabi.mn` might not be pointing to your Lightsail instance.

**Check DNS:**
```bash
nslookup api.tabi.mn
```

**Should return:** `13.229.113.229` (your Lightsail IP)

### 4. Nginx/Apache Configuration
If you're using a reverse proxy, check the configuration:

```bash
# For Nginx
sudo nginx -t
sudo systemctl status nginx

# For Apache
sudo apache2ctl configtest
sudo systemctl status apache2
```

### 5. Firewall Issues
Ensure port 3001 is open:

```bash
sudo ufw status
sudo iptables -L
```

## Quick Fixes to Try

### Fix 1: Restart Everything
```bash
ssh -i "C:/Users/HiTech/Downloads/default.pem" bitnami@13.229.113.229
pm2 restart backend
sudo systemctl restart nginx  # or apache2
```

### Fix 2: Check Environment Variables
```bash
cd /home/bitnami/backend
cat .env
```

Ensure these variables are set:
- `PORT=3001`
- `NODE_ENV=production`
- Database connection strings
- BYL API keys

### Fix 3: Test Direct IP Access
Try accessing your backend directly via IP:

```bash
curl http://13.229.113.229:3001/
```

If this works, the issue is with domain configuration.

### Fix 4: Check Server Configuration
Look for reverse proxy configuration:

```bash
# Nginx sites
ls -la /etc/nginx/sites-enabled/
cat /etc/nginx/sites-enabled/default

# Apache sites
ls -la /etc/apache2/sites-enabled/
```

## Complete Redeployment Steps

If you need to redeploy from scratch:

### Step 1: Prepare Backend Zip
From your local machine:
```bash
cd C:/Users/HiTech/Desktop/lineupz
# Make sure backend.zip exists and contains all backend files
```

### Step 2: Upload and Deploy
```bash
# Upload the zip file to /home/bitnami/ (not /home/bitnami/backend)
scp -i "C:/Users/HiTech/Downloads/default.pem" C:/Users/HiTech/Desktop/lineupz/backend.zip bitnami@13.229.113.229:/home/bitnami/

# SSH into the server
ssh -i "C:/Users/HiTech/Downloads/default.pem" bitnami@13.229.113.229

# Clean up existing backend
pm2 delete backend || true
rm -rf backend

# Extract and setup
cd /home/bitnami
unzip -o backend.zip
cd backend

# Install dependencies
npm install

# Start with PM2
pm2 start server.js --name backend
pm2 save
pm2 startup
```

## Alternative Solutions

### Option 1: Use Direct IP (Temporary)
Update your frontend to use the direct IP:
- Change `https://api.tabi.mn/` to `http://13.229.113.229:3001/`
- This is temporary but will help test if the backend works

### Option 2: Redeploy with Different Approach
```bash
# Stop everything
pm2 stop all
pm2 delete all

# Start with explicit port
cd /home/bitnami/backend
PORT=3001 pm2 start server.js --name backend
pm2 save
```

### Option 3: Check SSL Certificate
If using HTTPS, ensure SSL is properly configured:

```bash
sudo certbot certificates
sudo nginx -t
```

## Testing Commands

Once you think it's fixed, test these endpoints:

```bash
# Test root endpoint
curl https://api.tabi.mn/

# Test subscription plans
curl https://api.tabi.mn/api/subscription/plans

# Test subscription create (should return 401)
curl -X POST https://api.tabi.mn/api/subscription/create \
  -H "Content-Type: application/json" \
  -d '{"plan":"basic"}'
```

## Expected Results After Fix

1. **Root endpoint** should return:
   ```json
   {"message":"Tabi API is running!","version":"1.0.0","status":"healthy"}
   ```

2. **Plans endpoint** should return subscription plans data

3. **Create endpoint** should return `401 Unauthorized` (this is correct!)

## Debugging Steps

### Check if backend.zip was uploaded correctly:
```bash
ssh -i "C:/Users/HiTech/Downloads/default.pem" bitnami@13.229.113.229
ls -la /home/bitnami/backend.zip
```

### Check if extraction worked:
```bash
ls -la /home/bitnami/backend/
ls -la /home/bitnami/backend/src/
```

### Check if all files are present:
```bash
cd /home/bitnami/backend
ls -la src/routes/subscription.js
ls -la src/controllers/subscriptionController.js
```

## Next Steps

1. **SSH into your server** and run the diagnostic commands above
2. **Check PM2 logs** to see if there are any errors: `pm2 logs backend`
3. **Verify domain configuration** if the backend is running but not accessible
4. **Test with direct IP** to isolate the issue: `curl http://13.229.113.229:3001/`
5. **Update frontend temporarily** to use direct IP if needed

## Contact Points

If you're still having issues:
1. Share the output of `pm2 logs backend`
2. Share the output of `pm2 status`
3. Check if `curl http://13.229.113.229:3001/` works
4. Verify domain DNS settings in your domain registrar

The subscription endpoints are properly implemented in your code - this is purely a deployment/infrastructure issue.
