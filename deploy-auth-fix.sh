#!/bin/bash

echo "=== DEPLOYING AUTHENTICATION FIX ==="

# Create deployment package
echo "Creating deployment package..."
tar -czf backend-auth-fix.tar.gz backend/

echo "Package created: backend-auth-fix.tar.gz"

echo ""
echo "=== DEPLOYMENT COMMANDS ==="
echo "Run these commands to deploy:"
echo ""
echo "1. Upload package:"
echo "scp backend-auth-fix.tar.gz bitnami@api.tabi.mn:/home/bitnami/"
echo ""
echo "2. Deploy on server:"
echo "ssh bitnami@api.tabi.mn"
echo ""
echo "3. Run on server:"
echo "cd /home/bitnami"
echo "pm2 stop backend"
echo "cp -r src src_backup_\$(date +%Y%m%d_%H%M%S)"
echo "tar -xzf backend-auth-fix.tar.gz"
echo "cp -r backend/src/* src/"
echo "pm2 start backend --name backend"
echo "pm2 logs backend --lines 10"
echo ""
echo "4. Verify deployment:"
echo "curl https://api.tabi.mn/api/business/plans"
echo "curl https://api.tabi.mn/"
echo ""
echo "=== CRITICAL: DEPLOYMENT REQUIRED ==="
echo "The authentication fixes are ready but need to be deployed to the server."
echo "The backend is currently crashing due to authentication middleware errors."
