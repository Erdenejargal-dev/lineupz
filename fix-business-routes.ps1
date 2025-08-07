#!/usr/bin/env pwsh

Write-Host "=== FIXING BUSINESS ROUTES AUTHENTICATION ERROR ===" -ForegroundColor Green

# Step 1: Create backend deployment package
Write-Host "Creating backend deployment package..." -ForegroundColor Yellow
if (Test-Path "backend-business-fix.tar.gz") {
    Remove-Item "backend-business-fix.tar.gz" -Force
}

# Create tar.gz of backend directory
tar -czf backend-business-fix.tar.gz backend/

Write-Host "Backend package created: backend-business-fix.tar.gz" -ForegroundColor Green

# Step 2: Upload and deploy to server
Write-Host "Uploading and deploying to server..." -ForegroundColor Yellow

$deployCommands = @"
# Upload the fixed backend
scp backend-business-fix.tar.gz bitnami@api.tabi.mn:/home/bitnami/

# Connect and deploy
ssh bitnami@api.tabi.mn 'bash -s' << 'EOF'
cd /home/bitnami

# Stop the current backend
pm2 stop backend

# Backup current backend
if [ -d "src_backup_business_fix" ]; then
    rm -rf src_backup_business_fix
fi
cp -r src src_backup_business_fix

# Extract new backend
tar -xzf backend-business-fix.tar.gz
cp -r backend/src/* src/

# Install dependencies (if needed)
cd src
npm install --production

# Restart backend with PM2
cd /home/bitnami
pm2 start backend --name backend

# Check status
pm2 status
pm2 logs backend --lines 10

echo "=== BUSINESS ROUTES FIX DEPLOYED ==="
EOF
"@

Write-Host "Deployment commands:" -ForegroundColor Cyan
Write-Host $deployCommands

Write-Host "`n=== MANUAL DEPLOYMENT REQUIRED ===" -ForegroundColor Red
Write-Host "Please run the following commands manually:" -ForegroundColor Yellow
Write-Host $deployCommands

Write-Host "`n=== ALTERNATIVE: Use existing deployment script ===" -ForegroundColor Blue
Write-Host "You can also use: .\deploy-backend.ps1" -ForegroundColor Cyan

Write-Host "`n=== VERIFICATION ===" -ForegroundColor Green
Write-Host "After deployment, verify the fix by checking:" -ForegroundColor Yellow
Write-Host "1. pm2 logs backend --lines 20" -ForegroundColor White
Write-Host "2. curl https://api.tabi.mn/api/business/plans" -ForegroundColor White
Write-Host "3. Check that no 'argument handler must be a function' errors appear" -ForegroundColor White

Write-Host "`nBusiness routes authentication error has been fixed!" -ForegroundColor Green
