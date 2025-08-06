# Restart Backend Script
Write-Host "🔄 Restarting Backend Server..." -ForegroundColor Yellow

# SSH into the server and restart PM2
ssh -i "~/.ssh/tabi-key.pem" bitnami@18.143.176.95 "pm2 restart backend"

Write-Host "✅ Backend restarted successfully!" -ForegroundColor Green
Write-Host "🔍 Checking backend status..." -ForegroundColor Blue

# Check if backend is running
ssh -i "~/.ssh/tabi-key.pem" bitnami@18.143.176.95 "pm2 status backend"

Write-Host "🌐 Backend should now be running with the latest code!" -ForegroundColor Green
