# Check Server Deployment Status
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    CHECKING SERVER DEPLOYMENT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if we can SSH to the server
Write-Host "Testing SSH connection..." -ForegroundColor Yellow
try {
    $sshTest = & ssh -i "C:/Users/HiTech/Downloads/default.pem" bitnami@13.229.113.229 "echo 'SSH connection successful'" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ SSH connection working" -ForegroundColor Green
    } else {
        Write-Host "❌ SSH connection failed" -ForegroundColor Red
        Write-Host $sshTest -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ SSH command failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Checking backend files on server..." -ForegroundColor Yellow

# Check if the subscription controller has the createSubscription function
$checkCommand = @"
cd /home/bitnami/backend/src/controllers
if [ -f subscriptionController.js ]; then
    echo "✅ subscriptionController.js exists"
    if grep -q "createSubscription" subscriptionController.js; then
        echo "✅ createSubscription function found"
    else
        echo "❌ createSubscription function NOT found"
    fi
else
    echo "❌ subscriptionController.js NOT found"
fi

cd /home/bitnami/backend/src/routes
if [ -f subscription.js ]; then
    echo "✅ subscription.js exists"
    if grep -q "POST.*create\|router\.post.*create" subscription.js; then
        echo "✅ POST /create route found"
    else
        echo "❌ POST /create route NOT found"
    fi
else
    echo "❌ subscription.js NOT found"
fi

echo ""
echo "PM2 status:"
pm2 list
echo ""
echo "Backend logs (last 10 lines):"
pm2 logs backend --lines 10 --nostream
"@

try {
    $result = & ssh -i "C:/Users/HiTech/Downloads/default.pem" bitnami@13.229.113.229 $checkCommand 2>&1
    Write-Host $result -ForegroundColor White
} catch {
    Write-Host "❌ Failed to check server: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    CHECK COMPLETE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Read-Host "Press Enter to exit"
