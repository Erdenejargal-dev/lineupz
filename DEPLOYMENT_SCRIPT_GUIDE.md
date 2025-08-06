# Backend Deployment Script Guide

## 📋 Overview
The `deploy-backend.ps1` script automates the complete backend deployment process to your AWS Lightsail server.

## 🚀 What the Script Does

### 1. **Smart Zipping** 📦
- Creates `backend.zip` from your `/backend` folder
- **Automatically excludes:**
  - `node_modules` (saves time and bandwidth)
  - `.git` folders
  - Existing zip files
- Preserves all your source code, configs, and dependencies list

### 2. **Secure Upload** 📤
- Uses your SSH key: `C:/Users/HiTech/Downloads/default.pem`
- Uploads to: `bitnami@13.229.113.229:/home/bitnami/`
- Verifies upload success

### 3. **Automated Deployment** 🔧
Executes these commands on your server:
```bash
pm2 delete backend         # Stop existing process
rm -rf backend             # Remove old files
cd /home/bitnami          # Navigate to home
unzip -o backend.zip      # Extract new files
cd backend                # Enter backend folder
npm install               # Install dependencies
pm2 start server.js --name backend  # Start new process
pm2 save                  # Save PM2 config
pm2 startup               # Setup auto-restart
```

### 4. **Verification** ✅
- Checks PM2 process status
- Tests API endpoint at `https://api.tabi.mn/`
- Provides detailed success/failure feedback

## 🎯 How to Use

### Simple Usage:
```powershell
.\deploy-backend.ps1
```

### With Execution Policy (if needed):
```powershell
powershell -ExecutionPolicy Bypass -File "deploy-backend.ps1"
```

## 📊 Expected Output

```
🚀 Starting Backend Deployment...
=================================
📁 Checking backend folder...
🗑️  Cleaning up old zip file...
📦 Creating backend.zip (excluding node_modules)...
✅ Backend.zip created successfully
🔑 Checking SSH key...
📤 Uploading backend.zip to server...
✅ File uploaded successfully
🔧 Executing deployment commands on server...
✅ Deployment commands executed successfully
🔍 Verifying deployment...
✅ PM2 status check completed
🌐 Testing API endpoint...
✅ API is responding successfully!

🎉 Deployment Complete!
=================================
✅ Backend zipped (excluding node_modules)
✅ Uploaded to server
✅ Dependencies installed
✅ PM2 process started

🔗 Your API should be available at: https://api.tabi.mn/
```

## 🛠️ Prerequisites

### Required:
- ✅ PowerShell (Windows PowerShell or PowerShell Core)
- ✅ SSH client (usually built into Windows 10/11)
- ✅ SCP client (usually built into Windows 10/11)
- ✅ SSH key at: `C:/Users/HiTech/Downloads/default.pem`
- ✅ Backend folder in current directory

### File Structure:
```
lineupz/
├── backend/
│   ├── src/
│   ├── package.json
│   ├── server.js
│   └── ... (all your backend files)
└── deploy-backend.ps1
```

## 🔧 Troubleshooting

### Common Issues:

**1. SSH Key Not Found**
```
❌ SSH key not found at: C:/Users/HiTech/Downloads/default.pem
```
**Solution:** Ensure your SSH key is in the correct location

**2. Backend Folder Missing**
```
❌ Backend folder not found!
```
**Solution:** Run the script from the `lineupz` directory

**3. Upload Failed**
```
❌ Upload failed with exit code: 1
```
**Solution:** Check your internet connection and server accessibility

**4. API Test Failed**
```
⚠️  API test failed - this might be normal if the domain takes time to propagate
```
**Solution:** This is often normal - wait a few minutes and test manually

## 🔍 Manual Verification

After deployment, you can manually check:

```bash
# SSH into server
ssh -i "C:/Users/HiTech/Downloads/default.pem" bitnami@13.229.113.229

# Check PM2 status
pm2 status

# View logs
pm2 logs backend

# Test API locally on server
curl http://localhost:3001/
```

## 🌐 Testing Your API

After successful deployment, test these endpoints:

```bash
# Root endpoint
curl https://api.tabi.mn/

# Subscription plans
curl https://api.tabi.mn/api/subscription/plans

# Health check
curl https://api.tabi.mn/health
```

## ⚡ Quick Deploy Workflow

1. **Make your backend changes**
2. **Run the script:** `.\deploy-backend.ps1`
3. **Wait for completion** (usually 1-2 minutes)
4. **Test your API** at `https://api.tabi.mn/`

## 🎯 Benefits

- ⚡ **Fast**: No manual file copying or command typing
- 🛡️ **Safe**: Excludes unnecessary files (node_modules)
- 🔄 **Reliable**: Handles errors and provides clear feedback
- 📊 **Informative**: Shows progress and verifies success
- 🚀 **Complete**: Handles entire deployment pipeline

Your backend deployment is now just one command away! 🎉
