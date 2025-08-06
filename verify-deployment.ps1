# Quick verification script to test if BYL integration is deployed
param(
    [Parameter(Mandatory=$true)]
    [string]$LightsailIP,
    
    [Parameter(Mandatory=$true)]
    [string]$SSHKeyPath,
    
    [string]$LightsailUser = "bitnami"
)

Write-Host "🔍 Verifying BYL Integration Deployment" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Test 1: Check if subscription routes are loaded in app.js
Write-Host "1. Checking if app.js loads subscription routes..." -ForegroundColor Yellow
$appJsCheck = ssh -i "$SSHKeyPath" "${LightsailUser}@${LightsailIP}" "grep -n 'subscription' /home/bitnami/src/app.js"
if ($appJsCheck) {
    Write-Host "   ✅ Found: $appJsCheck" -ForegroundColor Green
} else {
    Write-Host "   ❌ Subscription routes NOT found in app.js" -ForegroundColor Red
}

# Test 2: Check if createSubscription method exists
Write-Host "2. Checking if createSubscription method exists..." -ForegroundColor Yellow
$createSubCheck = ssh -i "$SSHKeyPath" "${LightsailUser}@${LightsailIP}" "grep -n 'createSubscription' /home/bitnami/src/controllers/subscriptionController.js"
if ($createSubCheck) {
    Write-Host "   ✅ Found: $createSubCheck" -ForegroundColor Green
} else {
    Write-Host "   ❌ createSubscription method NOT found" -ForegroundColor Red
}

# Test 3: Check if BYL service exists
Write-Host "3. Checking if BYL service exists..." -ForegroundColor Yellow
$bylServiceCheck = ssh -i "$SSHKeyPath" "${LightsailUser}@${LightsailIP}" "ls -la /home/bitnami/src/services/bylService.js"
if ($bylServiceCheck) {
    Write-Host "   ✅ BYL service exists" -ForegroundColor Green
} else {
    Write-Host "   ❌ BYL service NOT found" -ForegroundColor Red
}

# Test 4: Check PM2 status
Write-Host "4. Checking PM2 status..." -ForegroundColor Yellow
$pm2Status = ssh -i "$SSHKeyPath" "${LightsailUser}@${LightsailIP}" "pm2 status"
Write-Host "   PM2 Status:" -ForegroundColor Cyan
Write-Host $pm2Status

# Test 5: Test API endpoints
Write-Host "5. Testing API endpoints..." -ForegroundColor Yellow

Write-Host "   Testing plans endpoint..." -ForegroundColor Cyan
try {
    $plansResponse = Invoke-WebRequest -Uri "https://api.tabi.mn/api/subscription/plans" -Method GET -ErrorAction Stop
    Write-Host "   ✅ Plans endpoint: Status $($plansResponse.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Plans endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "   Testing create endpoint..." -ForegroundColor Cyan
try {
    $createResponse = Invoke-WebRequest -Uri "https://api.tabi.mn/api/subscription/create" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"plan":"basic"}' -ErrorAction Stop
    Write-Host "   ✅ Create endpoint: Status $($createResponse.StatusCode)" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "   ✅ Create endpoint: Returns 401 (auth required) - GOOD!" -ForegroundColor Green
    } elseif ($_.Exception.Response.StatusCode -eq 404) {
        Write-Host "   ❌ Create endpoint: Returns 404 (route not found) - BAD!" -ForegroundColor Red
    } else {
        Write-Host "   ⚠️  Create endpoint: Status $($_.Exception.Response.StatusCode)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "🔧 If create endpoint returns 404, run these commands on your server:" -ForegroundColor Yellow
Write-Host "   ssh -i $SSHKeyPath ${LightsailUser}@${LightsailIP}" -ForegroundColor Cyan
Write-Host "   pm2 stop backend && pm2 delete backend" -ForegroundColor Cyan
Write-Host "   pm2 start server.js --name backend" -ForegroundColor Cyan
Write-Host "   pm2 save" -ForegroundColor Cyan
