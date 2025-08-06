# Deploy Business System to Server
Write-Host "🚀 Deploying Business System to Server..." -ForegroundColor Yellow

# Create backend archive with latest code
Write-Host "📦 Creating backend archive..." -ForegroundColor Blue
if (Test-Path "backend-business-system.zip") {
    Remove-Item "backend-business-system.zip" -Force
}

# Create zip of backend directory
Compress-Archive -Path "backend/*" -DestinationPath "backend-business-system.zip" -Force

# Upload to server
Write-Host "⬆️ Uploading to server..." -ForegroundColor Blue
scp -i "~/.ssh/tabi-key.pem" "backend-business-system.zip" bitnami@18.143.176.95:~/

# Deploy on server
Write-Host "🔧 Deploying on server..." -ForegroundColor Blue
ssh -i "~/.ssh/tabi-key.pem" bitnami@18.143.176.95 @"
    echo '🛑 Stopping backend...'
    pm2 stop backend || true
    
    echo '📂 Backing up current src...'
    if [ -d "src" ]; then
        mv src src-backup-$(date +%Y%m%d-%H%M%S)
    fi
    
    echo '📦 Extracting new code...'
    unzip -o backend-business-system.zip
    
    echo '📋 Installing dependencies...'
    npm install
    
    echo '🚀 Starting backend...'
    pm2 start server.js --name backend
    pm2 save
    
    echo '✅ Deployment complete!'
    pm2 status
"@

Write-Host "🌐 Backend deployed successfully!" -ForegroundColor Green
Write-Host "🔍 Testing business endpoints..." -ForegroundColor Blue

# Test business endpoints
$baseUrl = "https://api.tabi.mn"
Write-Host "Testing: $baseUrl/api/business/plans" -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/business/plans" -Method GET
    Write-Host "✅ Business plans endpoint working!" -ForegroundColor Green
} catch {
    Write-Host "❌ Business plans endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "🎉 Business system deployment complete!" -ForegroundColor Green

# Keep window open
Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
