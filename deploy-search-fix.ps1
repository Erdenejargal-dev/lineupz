# Deploy Business Search Fix
# This script deploys the fixed Business model to resolve the 500 error in search endpoint

Write-Host "🚀 Deploying Business Search Fix..." -ForegroundColor Green

# Check if we're in the right directory
if (-not (Test-Path "backend/src/models/Business.js")) {
    Write-Host "❌ Error: Please run this script from the project root directory" -ForegroundColor Red
    exit 1
}

Write-Host "📋 Fix Summary:" -ForegroundColor Yellow
Write-Host "- Fixed Business model currentArtistCount virtual property" -ForegroundColor White
Write-Host "- Added null check for artists array to prevent 500 errors" -ForegroundColor White
Write-Host "- Business search endpoint will now work correctly" -ForegroundColor White

# Create backup
Write-Host "📦 Creating backup..." -ForegroundColor Blue
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupDir = "backup_search_fix_$timestamp"
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
Copy-Item "backend/src/models/Business.js" "$backupDir/Business.js.backup"
Write-Host "✅ Backup created: $backupDir" -ForegroundColor Green

# Test the fix locally first
Write-Host "🧪 Testing fix locally..." -ForegroundColor Blue
try {
    $testResult = & node backend/test-search-endpoint.js 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Local test passed!" -ForegroundColor Green
    } else {
        Write-Host "❌ Local test failed!" -ForegroundColor Red
        Write-Host $testResult -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Error running local test: $_" -ForegroundColor Red
    exit 1
}

# Deploy to production
Write-Host "🚀 Deploying to production..." -ForegroundColor Blue

# Option 1: Deploy via Git (recommended)
Write-Host "📤 Committing changes..." -ForegroundColor Blue
try {
    git add backend/src/models/Business.js
    git commit -m "Fix: Business search 500 error - add null check for artists array"
    git push origin main
    Write-Host "✅ Changes pushed to repository" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Git deployment failed, trying alternative method..." -ForegroundColor Yellow
}

# Option 2: Direct file deployment (if needed)
Write-Host "📋 Alternative deployment commands:" -ForegroundColor Yellow
Write-Host "If automatic deployment failed, run these commands on your server:" -ForegroundColor White
Write-Host ""
Write-Host "# SSH into your server" -ForegroundColor Gray
Write-Host "ssh your-server" -ForegroundColor Gray
Write-Host ""
Write-Host "# Navigate to your app directory" -ForegroundColor Gray
Write-Host "cd /path/to/your/app" -ForegroundColor Gray
Write-Host ""
Write-Host "# Pull latest changes" -ForegroundColor Gray
Write-Host "git pull origin main" -ForegroundColor Gray
Write-Host ""
Write-Host "# Restart the backend service" -ForegroundColor Gray
Write-Host "pm2 restart tabi-backend" -ForegroundColor Gray
Write-Host "# OR if using systemctl:" -ForegroundColor Gray
Write-Host "sudo systemctl restart tabi-backend" -ForegroundColor Gray

Write-Host ""
Write-Host "🎯 Expected Results:" -ForegroundColor Green
Write-Host "✅ Business search endpoint will return 200 instead of 500" -ForegroundColor White
Write-Host "✅ Users can search for businesses: 'hair', 'tabi', 'salon', etc." -ForegroundColor White
Write-Host "✅ Search results will show business details and subscription plans" -ForegroundColor White

Write-Host ""
Write-Host "🧪 Test the fix:" -ForegroundColor Blue
Write-Host "1. Open your app: https://tabi.mn/profile" -ForegroundColor White
Write-Host "2. Try searching for businesses in the search box" -ForegroundColor White
Write-Host "3. Search terms to test: 'hair', 'tabi', 'salon', 'medical'" -ForegroundColor White

Write-Host ""
Write-Host "🔍 Monitoring:" -ForegroundColor Blue
Write-Host "- Check server logs for any remaining errors" -ForegroundColor White
Write-Host "- Monitor the /api/business/search endpoint" -ForegroundColor White
Write-Host "- Verify search results are returned correctly" -ForegroundColor White

Write-Host ""
Write-Host "✅ Business Search Fix Deployment Complete!" -ForegroundColor Green
Write-Host "The 500 Internal Server Error should now be resolved." -ForegroundColor White
