#!/bin/bash

# AWS Lightsail Backend Deployment Script (PM2 Version)
# This script automates the deployment of your backend to AWS Lightsail using PM2

set -e  # Exit on any error

# Configuration - UPDATE THESE VALUES
LIGHTSAIL_IP="YOUR_LIGHTSAIL_IP"           # e.g., "3.25.123.45"
LIGHTSAIL_USER="bitnami"                    # Your Lightsail user (bitnami for Bitnami instances)
SSH_KEY_PATH="~/.ssh/your-key.pem"         # Path to your SSH key
REMOTE_APP_PATH="/home/bitnami"             # Path on your Lightsail instance
LOCAL_BACKEND_PATH="./backend"              # Local backend directory
PM2_APP_NAME="backend"                      # PM2 application name

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting AWS Lightsail Backend Deployment (PM2)...${NC}"

# Check if required variables are set
if [ "$LIGHTSAIL_IP" = "YOUR_LIGHTSAIL_IP" ]; then
    echo -e "${RED}❌ Please update LIGHTSAIL_IP in the script${NC}"
    exit 1
fi

# Check if SSH key exists
if [ ! -f "$SSH_KEY_PATH" ]; then
    echo -e "${RED}❌ SSH key not found at $SSH_KEY_PATH${NC}"
    exit 1
fi

# Check if backend directory exists
if [ ! -d "$LOCAL_BACKEND_PATH" ]; then
    echo -e "${RED}❌ Backend directory not found at $LOCAL_BACKEND_PATH${NC}"
    exit 1
fi

echo -e "${YELLOW}📦 Preparing deployment package...${NC}"

# Create a temporary deployment directory
TEMP_DIR=$(mktemp -d)
echo "Using temporary directory: $TEMP_DIR"

# Copy backend files to temp directory
cp -r $LOCAL_BACKEND_PATH/* $TEMP_DIR/

# Remove node_modules to reduce upload size
if [ -d "$TEMP_DIR/node_modules" ]; then
    echo -e "${YELLOW}🗑️  Removing node_modules to reduce upload size...${NC}"
    rm -rf $TEMP_DIR/node_modules
fi

# Create deployment archive
ARCHIVE_NAME="backend-$(date +%Y%m%d-%H%M%S).tar.gz"
echo -e "${YELLOW}📦 Creating archive: $ARCHIVE_NAME${NC}"
cd $TEMP_DIR
tar -czf ../$ARCHIVE_NAME .
cd - > /dev/null

echo -e "${BLUE}📤 Uploading to Lightsail instance...${NC}"

# Upload the archive
scp -i "$SSH_KEY_PATH" "$TEMP_DIR/../$ARCHIVE_NAME" "$LIGHTSAIL_USER@$LIGHTSAIL_IP:/tmp/"

echo -e "${BLUE}🔧 Deploying on remote server...${NC}"

# Execute deployment commands on remote server
ssh -i "$SSH_KEY_PATH" "$LIGHTSAIL_USER@$LIGHTSAIL_IP" << EOF
    set -e
    
    echo "🔄 Stopping existing PM2 application..."
    pm2 stop $PM2_APP_NAME || echo "PM2 app not running"
    
    echo "📁 Creating backup of current deployment..."
    if [ -f "$REMOTE_APP_PATH/server.js" ]; then
        mkdir -p "$REMOTE_APP_PATH/backup-\$(date +%Y%m%d-%H%M%S)"
        cp -r $REMOTE_APP_PATH/*.js $REMOTE_APP_PATH/src $REMOTE_APP_PATH/package*.json "$REMOTE_APP_PATH/backup-\$(date +%Y%m%d-%H%M%S)/" 2>/dev/null || true
    fi
    
    echo "📦 Extracting new deployment..."
    cd "$REMOTE_APP_PATH"
    tar -xzf "/tmp/$ARCHIVE_NAME"
    
    echo "📦 Installing dependencies..."
    npm install --production
    
    echo "🔧 Setting up environment..."
    if [ ! -f ".env" ]; then
        echo "⚠️  .env file not found. Creating basic .env file..."
        cat > .env << 'ENVEOF'
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
ENVEOF
    fi
    
    echo "🚀 Starting application with PM2..."
    pm2 start server.js --name $PM2_APP_NAME || pm2 restart $PM2_APP_NAME
    pm2 save
    
    echo "✅ Deployment completed successfully!"
    
    # Clean up
    rm -f "/tmp/$ARCHIVE_NAME"
EOF

# Clean up local temp files
rm -rf "$TEMP_DIR"
rm -f "$TEMP_DIR/../$ARCHIVE_NAME"

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo -e "${BLUE}🔍 Checking PM2 status...${NC}"

# Check if the service is running
ssh -i "$SSH_KEY_PATH" "$LIGHTSAIL_USER@$LIGHTSAIL_IP" "pm2 status"

echo -e "${GREEN}🎉 Backend deployment to AWS Lightsail completed!${NC}"
echo -e "${BLUE}📍 Your API should be available at: https://api.tabi.mn${NC}"
echo -e "${YELLOW}💡 To view logs: ssh -i $SSH_KEY_PATH $LIGHTSAIL_USER@$LIGHTSAIL_IP 'pm2 logs $PM2_APP_NAME'${NC}"
