# Find Backend Directory on Server
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    FINDING BACKEND DIRECTORY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Checking server directory structure..." -ForegroundColor Yellow

$findCommand = @"
echo "=== Home directory contents ==="
ls -la /home/bitnami/

echo ""
echo "=== Looking for backend directories ==="
find /home/bitnami -name "*backend*" -type d 2>/dev/null

echo ""
echo "=== Looking for Node.js processes ==="
ps aux | grep node

echo ""
echo "=== PM2 status ==="
pm2 list

echo ""
echo "=== Looking for subscription files ==="
find /home/bitnami -name "*subscription*" 2>/dev/null

echo ""
echo "=== Current working directory ==="
pwd
"@

try {
    $result = & ssh -i "C:/Users/HiTech/Downloads/default.pem" bitnami@13.229.113.229 $findCommand 2>&1
    Write-Host $result -ForegroundColor White
} catch {
    Write-Host "❌ Failed to check server: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    SEARCH COMPLETE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Read-Host "Press Enter to exit"
