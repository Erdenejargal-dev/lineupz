# Deploy BYL Payment Fix to Production Server

Write-Host "=== DEPLOYING BYL PAYMENT FIX ===" -ForegroundColor Green

# Create deployment package
Write-Host "Creating deployment package..." -ForegroundColor Yellow
$files = @(
    "backend/src/services/bylService.js"
    "backend/src/controllers/subscriptionController.js"
)

# Copy files to temp directory for deployment
$tempDir = "byl-fix-temp"
if (Test-Path $tempDir) {
    Remove-Item $tempDir -Recurse -Force
}
New-Item -ItemType Directory -Path $tempDir | Out-Null
New-Item -ItemType Directory -Path "$tempDir/backend/src/services" -Force | Out-Null
New-Item -ItemType Directory -Path "$tempDir/backend/src/controllers" -Force | Out-Null

Copy-Item "backend/src/services/bylService.js" "$tempDir/backend/src/services/"
Copy-Item "backend/src/controllers/subscriptionController.js" "$tempDir/backend/src/controllers/"

Write-Host "Files prepared for deployment" -ForegroundColor Green

Write-Host ""
Write-Host "=== MANUAL DEPLOYMENT COMMANDS ===" -ForegroundColor Cyan
Write-Host "Run these commands to deploy the BYL payment fix:" -ForegroundColor White
Write-Host ""
Write-Host "1. Upload the fixed files:" -ForegroundColor Yellow
Write-Host "scp backend/src/services/bylService.js bitnami@api.tabi.mn:/home/bitnami/src/services/"
Write-Host "scp backend/src/controllers/subscriptionController.js bitnami@api.tabi.mn:/home/bitnami/src/controllers/"
Write-Host ""
Write-Host "2. Restart the backend:" -ForegroundColor Yellow
Write-Host "ssh bitnami@api.tabi.mn"
Write-Host "pm2 restart backend"
Write-Host "pm2 logs backend --lines 10"
Write-Host ""
Write-Host "3. Test the payment flow:" -ForegroundColor Yellow
Write-Host "curl https://api.tabi.mn/api/subscription/plans"
Write-Host ""

Write-Host "=== WHAT WAS FIXED ===" -ForegroundColor Cyan
Write-Host "✅ Added better error handling in BYL service" -ForegroundColor Green
Write-Host "✅ Added credential validation" -ForegroundColor Green
Write-Host "✅ Improved error messages for debugging" -ForegroundColor Green
Write-Host "✅ Added detailed logging for BYL API calls" -ForegroundColor Green
Write-Host ""

Write-Host "=== EXPECTED RESULTS ===" -ForegroundColor Cyan
Write-Host "After deployment:" -ForegroundColor White
Write-Host "• Pricing page payment flow should work" -ForegroundColor Green
Write-Host "• Business registration payment should work" -ForegroundColor Green
Write-Host "• Better error messages if BYL API issues occur" -ForegroundColor Green
Write-Host "• Detailed logs for troubleshooting" -ForegroundColor Green
Write-Host ""

Write-Host "=== TROUBLESHOOTING ===" -ForegroundColor Cyan
Write-Host "If payment still fails after deployment:" -ForegroundColor White
Write-Host "1. Check server logs: pm2 logs backend --lines 20" -ForegroundColor Yellow
Write-Host "2. Verify BYL credentials are set in server .env file" -ForegroundColor Yellow
Write-Host "3. Test BYL API connectivity from server" -ForegroundColor Yellow
Write-Host ""

# Cleanup
Remove-Item $tempDir -Recurse -Force

Write-Host "🚀 READY FOR DEPLOYMENT!" -ForegroundColor Green
