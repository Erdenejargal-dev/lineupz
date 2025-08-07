#!/usr/bin/env pwsh

Write-Host "=== DEPLOYING BUSINESS ROUTES FIX ===" -ForegroundColor Green

# Create deployment package
Write-Host "Creating deployment package..." -ForegroundColor Yellow
if (Test-Path "backend-fix.tar.gz") {
    Remove-Item "backend-fix.tar.gz" -Force
}

tar -czf backend-fix.tar.gz backend/

Write-Host "Package created: backend-fix.tar.gz" -ForegroundColor Green

Write-Host "`n=== MANUAL DEPLOYMENT COMMANDS ===" -ForegroundColor Red
Write-Host "Run these commands manually to deploy the fix:" -ForegroundColor Yellow

Write-Host "`n1. Upload the package:" -ForegroundColor Cyan
Write-Host "scp backend-fix.tar.gz bitnami@api.tabi.mn:/home/bitnami/" -ForegroundColor White

Write-Host "`n2. Deploy on server:" -ForegroundColor Cyan
Write-Host "ssh bitnami@api.tabi.mn" -ForegroundColor White

Write-Host "`n3. Run on server:" -ForegroundColor Cyan
$commands = @"
cd /home/bitnami
pm2 stop backend
cp -r src src_backup_$(date +%Y%m%d_%H%M%S)
tar -xzf backend-fix.tar.gz
cp -r backend/src/* src/
pm2 start backend --name backend
pm2 logs backend --lines 10
"@

Write-Host $commands -ForegroundColor White

Write-Host "`n=== VERIFICATION ===" -ForegroundColor Green
Write-Host "After deployment, check:" -ForegroundColor Yellow
Write-Host "pm2 logs backend --lines 20" -ForegroundColor White
Write-Host "curl https://api.tabi.mn/api/business/plans" -ForegroundColor White

Write-Host "`nDeployment package ready!" -ForegroundColor Green
