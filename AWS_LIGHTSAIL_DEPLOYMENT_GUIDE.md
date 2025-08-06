# AWS Lightsail Automated Deployment Guide 🚀

## Overview
This guide provides automated deployment scripts for your Tabi backend to AWS Lightsail, eliminating the need for manual uploads.

## Prerequisites

### 1. Local Machine Requirements
- **Windows**: PowerShell 5.1+ with WSL or Git Bash
- **macOS/Linux**: Bash shell
- SSH client (OpenSSH)
- Your AWS Lightsail SSH key file

### 2. AWS Lightsail Instance Requirements
- Ubuntu 20.04+ or Amazon Linux 2
- Node.js 18+ installed
- systemd service manager
- SSH access configured

## Setup Instructions

### Step 1: Configure Your SSH Key
1. Download your Lightsail SSH key from AWS console
2. Place it in `~/.ssh/` directory (Windows: `%USERPROFILE%\.ssh\`)
3. Set proper permissions:
   ```bash
   # Linux/macOS
   chmod 600 ~/.ssh/your-key.pem
   
   # Windows (PowerShell as Admin)
   icacls "%USERPROFILE%\.ssh\your-key.pem" /inheritance:r /grant:r "%USERNAME%:R"
   ```

### Step 2: Update Deployment Scripts

#### For Linux/macOS (deploy-lightsail.sh):
```bash
# Edit the configuration section
LIGHTSAIL_IP="YOUR_ACTUAL_IP"           # e.g., "3.25.123.45"
LIGHTSAIL_USER="ubuntu"                 # or "ec2-user" for Amazon Linux
SSH_KEY_PATH="~/.ssh/your-key.pem"     # Path to your SSH key
REMOTE_APP_PATH="/home/ubuntu/tabi-backend"
LOCAL_BACKEND_PATH="./backend"
```

#### For Windows (deploy-lightsail.ps1):
```powershell
# Run with parameters
.\deploy-lightsail.ps1 -LightsailIP "3.25.123.45" -SSHKeyPath "$env:USERPROFILE\.ssh\your-key.pem"
```

### Step 3: One-Time Server Setup

#### 3.1 Install systemd Service
SSH into your Lightsail instance and run:

```bash
# Copy the service file to your server
scp -i ~/.ssh/your-key.pem tabi-backend.service ubuntu@YOUR_IP:/tmp/

# SSH into server
ssh -i ~/.ssh/your-key.pem ubuntu@YOUR_IP

# Install the service
sudo cp /tmp/tabi-backend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable tabi-backend
```

#### 3.2 Create Environment File
```bash
# Create .env file on server
sudo mkdir -p /home/ubuntu/tabi-backend
sudo chown ubuntu:ubuntu /home/ubuntu/tabi-backend
cd /home/ubuntu/tabi-backend

# Create .env file with your production settings
cat > .env << 'EOF'
PORT=5000
MONGODB_URI=mongodb+srv://erjanaam:tabimn20@tabi.5xjzfgt.mongodb.net/tabi
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=production

# SMS Service
SMS_API_URL=https://smstabi.tabisms.online
SMS_API_KEY=512037a7-d978-4ac2-b083-94624981862d

# Google Calendar
GOOGLE_CLIENT_ID=901939284027-opqagdv2058ljmt9pm2araop4elpnv61.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_REDIRECT_URI=https://api.tabi.mn/api/google-calendar/callback

# Frontend URL
FRONTEND_URL=https://tabi.mn

# Email Service
EMAIL_HOST=smtp.zoho.com
EMAIL_PORT=587
EMAIL_USER=info@tabi.mn
EMAIL_PASS=Tabi@mn20
EMAIL_FROM=info@tabi.mn
EMAIL_FROM_NAME=Tabi

# BYL Payment Integration
BYL_API_URL=https://byl.mn/api/v1
BYL_API_TOKEN=310|QvUrmbmP6FU9Zstv4MHI6RzqPmCQK8YrjsLKPDx4d4c10414
BYL_PROJECT_ID=230
BYL_WEBHOOK_SECRET=ajxwrEu54Vm7gqESwQvgZz9WNnafxkRV
EOF
```

## Deployment Commands

### Option 1: Linux/macOS
```bash
# Make script executable
chmod +x deploy-lightsail.sh

# Deploy
./deploy-lightsail.sh
```

### Option 2: Windows PowerShell
```powershell
# Set execution policy (run as Administrator)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Deploy with parameters
.\deploy-lightsail.ps1 -LightsailIP "YOUR_IP" -SSHKeyPath "$env:USERPROFILE\.ssh\your-key.pem"
```

### Option 3: Quick Deploy (Any Platform)
```bash
# One-liner deployment
scp -i ~/.ssh/your-key.pem -r backend/ ubuntu@YOUR_IP:/tmp/backend-new && \
ssh -i ~/.ssh/your-key.pem ubuntu@YOUR_IP "
  sudo systemctl stop tabi-backend;
  sudo rm -rf /home/ubuntu/tabi-backend-old;
  sudo mv /home/ubuntu/tabi-backend /home/ubuntu/tabi-backend-old;
  sudo mv /tmp/backend-new /home/ubuntu/tabi-backend;
  sudo chown -R ubuntu:ubuntu /home/ubuntu/tabi-backend;
  cd /home/ubuntu/tabi-backend && npm install --production;
  sudo systemctl start tabi-backend;
  sudo systemctl status tabi-backend
"
```

## What the Scripts Do

1. **📦 Package**: Creates a compressed archive of your backend code
2. **📤 Upload**: Transfers the archive to your Lightsail instance
3. **🔄 Backup**: Creates a backup of the current deployment
4. **📦 Extract**: Extracts the new code to the application directory
5. **📦 Install**: Runs `npm install --production`
6. **🚀 Restart**: Restarts the systemd service
7. **✅ Verify**: Checks that the service is running

## Monitoring & Management

### Check Service Status
```bash
ssh -i ~/.ssh/your-key.pem ubuntu@YOUR_IP "sudo systemctl status tabi-backend"
```

### View Logs
```bash
ssh -i ~/.ssh/your-key.pem ubuntu@YOUR_IP "sudo journalctl -u tabi-backend -f"
```

### Manual Service Control
```bash
# Stop service
sudo systemctl stop tabi-backend

# Start service
sudo systemctl start tabi-backend

# Restart service
sudo systemctl restart tabi-backend

# View logs
sudo journalctl -u tabi-backend --since "1 hour ago"
```

## Troubleshooting

### Common Issues

#### 1. Permission Denied (SSH Key)
```bash
# Fix SSH key permissions
chmod 600 ~/.ssh/your-key.pem
```

#### 2. Service Won't Start
```bash
# Check logs
sudo journalctl -u tabi-backend -n 50

# Check if port is in use
sudo netstat -tlnp | grep :5000

# Manually test the app
cd /home/ubuntu/tabi-backend
node server.js
```

#### 3. Environment Variables Missing
```bash
# Check .env file exists
ls -la /home/ubuntu/tabi-backend/.env

# Verify environment variables
cd /home/ubuntu/tabi-backend && node -e "require('dotenv').config(); console.log(process.env.PORT)"
```

### Rollback Procedure
```bash
# SSH into server
ssh -i ~/.ssh/your-key.pem ubuntu@YOUR_IP

# Stop current service
sudo systemctl stop tabi-backend

# Restore backup (replace TIMESTAMP with actual backup folder)
sudo rm -rf /home/ubuntu/tabi-backend
sudo mv /home/ubuntu/tabi-backend-backup-TIMESTAMP /home/ubuntu/tabi-backend

# Start service
sudo systemctl start tabi-backend
```

## Advanced Features

### Automated Deployment with GitHub Actions
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Lightsail

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Deploy to Lightsail
      env:
        SSH_PRIVATE_KEY: ${{ secrets.SSH_PRIVATE_KEY }}
        LIGHTSAIL_IP: ${{ secrets.LIGHTSAIL_IP }}
      run: |
        echo "$SSH_PRIVATE_KEY" > private_key.pem
        chmod 600 private_key.pem
        ./deploy-lightsail.sh
```

### Health Check Endpoint
Add to your backend for monitoring:

```javascript
// Add to your backend routes
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});
```

## Security Considerations

1. **SSH Key Security**: Never commit SSH keys to version control
2. **Environment Variables**: Store sensitive data in `.env` file only on server
3. **Firewall**: Configure Lightsail firewall to only allow necessary ports
4. **Updates**: Regularly update your Lightsail instance and Node.js

## Next Steps

1. **Update the deployment script** with your actual Lightsail IP and SSH key path
2. **Run the one-time server setup** to install the systemd service
3. **Test the deployment** with the automated script
4. **Set up monitoring** to track your application health

Your BYL payment integration fix will be deployed automatically! 🎉
