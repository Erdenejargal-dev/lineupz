#!/bin/bash

# Tabi Backend Deployment Script (Bash)
echo "========================================"
echo "    TABI BACKEND DEPLOYMENT SCRIPT"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Create or update backend.zip (excluding node_modules)
if [ -f "backend.zip" ]; then
    echo -e "${YELLOW}Updating backend.zip (excluding node_modules)...${NC}"
    rm backend.zip
else
    echo -e "${YELLOW}Creating backend.zip (excluding node_modules)...${NC}"
fi

if zip -r backend.zip backend/ -x "backend/node_modules/*" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ backend.zip created successfully (node_modules excluded)${NC}"
else
    echo -e "${RED}❌ Failed to create backend.zip${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}Uploading to server...${NC}"

# Upload to server
if scp -i "C:/Users/HiTech/Downloads/default.pem" backend.zip bitnami@13.229.113.229:/home/bitnami/; then
    echo -e "${GREEN}✅ Upload successful!${NC}"
else
    echo -e "${RED}❌ Upload failed!${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}Deploying on server...${NC}"

# Deploy on server
DEPLOY_COMMANDS="
pm2 delete backend 2>/dev/null || true
rm -rf backend
cd /home/bitnami
unzip -o backend.zip
cd backend
npm install
pm2 start server.js --name backend
pm2 save
echo 'Deployment completed successfully'
"

if ssh -i "C:/Users/HiTech/Downloads/default.pem" bitnami@13.229.113.229 "$DEPLOY_COMMANDS"; then
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}    ✅ DEPLOYMENT SUCCESSFUL!${NC}"
    echo -e "${GREEN}========================================${NC}"
else
    echo -e "${RED}❌ Deployment failed!${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}Testing backend health...${NC}"

# Test backend health
if curl -s https://api.tabi.mn/ | grep -q "Tabi API is running"; then
    echo -e "${GREEN}✅ Backend is healthy and running!${NC}"
else
    echo -e "${YELLOW}⚠️  Backend might still be starting up...${NC}"
fi

echo ""
echo -e "${CYAN}Deployment completed at $(date)${NC}"
echo ""
echo -e "${GREEN}🚀 Your Tabi platform is now deployed!${NC}"
echo -e "${CYAN}   Frontend: https://tabi.mn${NC}"
echo -e "${CYAN}   API: https://api.tabi.mn${NC}"
echo ""

read -p "Press Enter to exit..."
