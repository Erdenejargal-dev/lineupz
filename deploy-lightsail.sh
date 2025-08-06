#!/bin/bash

# AWS Lightsail Backend Deployment Script
# This script automates the deployment of your backend to AWS Lightsail

set -e  # Exit on any error

# Configuration - UPDATE THESE VALUES
LIGHTSAIL_IP="YOUR_LIGHTSAIL_IP"           # e.g., "3.25.123.45"
LIGHTSAIL_USER="ubuntu"                     # or "ec2-user" depending on your instance
SSH_KEY_PATH="~/.ssh/your-key.pem"         # Path to your SSH key
REMOTE_APP_PATH="/home/ubuntu/tabi-backend" # Path on your Lightsail instance
LOCAL_BACKEND_PATH="./backend"              # Local backend directory

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting AWS Lightsail Backend Deployment...${NC}"

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
    
    echo "🔄 Stopping existing application..."
    sudo systemctl stop tabi-backend || echo "Service not running"
    
    echo "📁 Creating backup of current deployment..."
    if [ -d "$REMOTE_APP_PATH" ]; then
        sudo mv "$REMOTE_APP_PATH" "${REMOTE_APP_PATH}-backup-\$(date +%Y%m%d-%H%M%S)" || true
    fi
    
    echo "📦 Extracting new deployment..."
    sudo mkdir -p "$REMOTE_APP_PATH"
    cd "$REMOTE_APP_PATH"
    sudo tar -xzf "/tmp/$ARCHIVE_NAME"
    sudo chown -R $LIGHTSAIL_USER:$LIGHTSAIL_USER "$REMOTE_APP_PATH"
    
    echo "📦 Installing dependencies..."
    cd "$REMOTE_APP_PATH"
    npm install --production
    
    echo "🔧 Setting up environment..."
    # Copy environment file if it doesn't exist
    if [ ! -f ".env" ]; then
        echo "⚠️  .env file not found. Please create it manually."
    fi
    
    echo "🚀 Starting application..."
    sudo systemctl start tabi-backend
    sudo systemctl enable tabi-backend
    
    echo "✅ Deployment completed successfully!"
    
    # Clean up
    rm -f "/tmp/$ARCHIVE_NAME"
EOF

# Clean up local temp files
rm -rf "$TEMP_DIR"
rm -f "$TEMP_DIR/../$ARCHIVE_NAME"

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo -e "${BLUE}🔍 Checking service status...${NC}"

# Check if the service is running
ssh -i "$SSH_KEY_PATH" "$LIGHTSAIL_USER@$LIGHTSAIL_IP" "sudo systemctl status tabi-backend --no-pager"

echo -e "${GREEN}🎉 Backend deployment to AWS Lightsail completed!${NC}"
echo -e "${BLUE}📍 Your API should be available at: https://api.tabi.mn${NC}"
