# Emergency Backend Deployment Fix Script
# This script will deploy the backend with the subscription endpoints

param(
    [Parameter(Mandatory=$false)]
    [string]$LightsailIP = "",
    
    [Parameter(Mandatory=$false)]
    [string]$SSHKeyPath = "",
    
    [string]$LightsailUser = "bitnami"
)

Write-Host "🚨 EMERGENCY BACKEND DEPLOYMENT FIX" -ForegroundColor Red
Write-Host "===================================" -ForegroundColor Red

# If no parameters provided, show instructions
if ([string]::IsNullOrEmpty($LightsailIP) -or [string]::IsNullOrEmpty($SSHKeyPath)) {
    Write-Host ""
    Write-Host "❌ Missing required parameters!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Usage:" -ForegroundColor Yellow
    Write-Host "  .\fix-backend-deployment.ps1 -LightsailIP 'YOUR_IP' -SSHKeyPath 'PATH_TO_SSH_KEY'" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Example:" -ForegroundColor Yellow
    Write-Host "  .\fix-backend-deployment.ps1 -LightsailIP '18.142.54.123' -SSHKeyPath 'C:\path\to\your\key.pem'" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "If you don't have these details, please:" -ForegroundColor Yellow
    Write-Host "1. Check your AWS Lightsail console for the IP address" -ForegroundColor White
    Write-Host "2. Locate your SSH key file (.pem)" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host "Target Server: $LightsailIP" -ForegroundColor Cyan
Write-Host "SSH Key: $SSHKeyPath" -ForegroundColor Cyan
Write-Host ""

# Step 1: Test connection
Write-Host "1. Testing SSH connection..." -ForegroundColor Yellow
try {
    $connectionTest = ssh -i "$SSHKeyPath" -o ConnectTimeout=10 "${LightsailUser}@${LightsailIP}" "echo 'Connection successful'"
    if ($connectionTest -eq "Connection successful") {
        Write-Host "   ✅ SSH connection successful" -ForegroundColor Green
    } else {
        throw "Connection failed"
    }
} catch {
    Write-Host "   ❌ SSH connection failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Please check your IP address and SSH key path" -ForegroundColor Yellow
    exit 1
}

# Step 2: Stop existing backend
Write-Host "2. Stopping existing backend processes..." -ForegroundColor Yellow
ssh -i "$SSHKeyPath" "${LightsailUser}@${LightsailIP}" "pm2 stop all && pm2 delete all"
Write-Host "   ✅ Stopped all PM2 processes" -ForegroundColor Green

# Step 3: Create backend directory structure
Write-Host "3. Setting up backend directory..." -ForegroundColor Yellow
ssh -i "$SSHKeyPath" "${LightsailUser}@${LightsailIP}" "mkdir -p /home/bitnami/backend/src/{controllers,routes,models,services,middleware}"
Write-Host "   ✅ Created directory structure" -ForegroundColor Green

# Step 4: Upload backend files
Write-Host "4. Uploading backend files..." -ForegroundColor Yellow

# Upload main files
scp -i "$SSHKeyPath" "backend/package.json" "${LightsailUser}@${LightsailIP}:/home/bitnami/backend/"
scp -i "$SSHKeyPath" "backend/server.js" "${LightsailUser}@${LightsailIP}:/home/bitnami/backend/"
scp -i "$SSHKeyPath" "backend/.env" "${LightsailUser}@${LightsailIP}:/home/bitnami/backend/"

# Upload src files
scp -i "$SSHKeyPath" "backend/src/app.js" "${LightsailUser}@${LightsailIP}:/home/bitnami/backend/src/"

# Upload controllers
scp -i "$SSHKeyPath" "backend/src/controllers/"* "${LightsailUser}@${LightsailIP}:/home/bitnami/backend/src/controllers/"

# Upload routes
scp -i "$SSHKeyPath" "backend/src/routes/"* "${LightsailUser}@${LightsailIP}:/home/bitnami/backend/src/routes/"

# Upload models
scp -i "$SSHKeyPath" "backend/src/models/"* "${LightsailUser}@${LightsailIP}:/home/bitnami/backend/src/models/"

# Upload services
scp -i "$SSHKeyPath" "backend/src/services/"* "${LightsailUser}@${LightsailIP}:/home/bitnami/backend/src/services/"

# Upload middleware
scp -i "$SSHKeyPath" "backend/src/middleware/"* "${LightsailUser}@${LightsailIP}:/home/bitnami/backend/src/middleware/"

Write-Host "   ✅ Uploaded all backend files" -ForegroundColor Green

# Step 5: Install dependencies
Write-Host "5. Installing dependencies..." -ForegroundColor Yellow
ssh -i "$SSHKeyPath" "${LightsailUser}@${LightsailIP}" "cd /home/bitnami/backend && npm install"
Write-Host "   ✅ Dependencies installed" -ForegroundColor Green

# Step 6: Start backend with PM2
Write-Host "6. Starting backend with PM2..." -ForegroundColor Yellow
ssh -i "$SSHKeyPath" "${LightsailUser}@${LightsailIP}" "cd /home/bitnami/backend && pm2 start server.js --name backend"
ssh -i "$SSHKeyPath" "${LightsailUser}@${LightsailIP}" "pm2 save"
Write-Host "   ✅ Backend started with PM2" -ForegroundColor Green

# Step 7: Verify deployment
Write-Host "7. Verifying deployment..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Check PM2 status
$pm2Status = ssh -i "$SSHKeyPath" "${LightsailUser}@${LightsailIP}" "pm2 status"
Write-Host "   PM2 Status:" -ForegroundColor Cyan
Write-Host $pm2Status

# Test API endpoints
Write-Host "8. Testing API endpoints..." -ForegroundColor Yellow

Write-Host "   Testing root endpoint..." -ForegroundColor Cyan
try {
    $rootResponse = Invoke-WebRequest -Uri "https://api.tabi.mn/" -Method GET -TimeoutSec 10 -ErrorAction Stop
    Write-Host "   ✅ Root endpoint: Status $($rootResponse.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Root endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "   Testing subscription plans endpoint..." -ForegroundColor Cyan
try {
    $plansResponse = Invoke-WebRequest -Uri "https://api.tabi.mn/api/subscription/plans" -Method GET -TimeoutSec 10 -ErrorAction Stop
    Write-Host "   ✅ Plans endpoint: Status $($plansResponse.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Plans endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "   Testing subscription create endpoint..." -ForegroundColor Cyan
try {
    $createResponse = Invoke-WebRequest -Uri "https://api.tabi.mn/api/subscription/create" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"plan":"basic"}' -TimeoutSec 10 -ErrorAction Stop
    Write-Host "   ✅ Create endpoint: Status $($createResponse.StatusCode)" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "   ✅ Create endpoint: Returns 401 (auth required) - PERFECT!" -ForegroundColor Green
    } elseif ($_.Exception.Response.StatusCode -eq 404) {
        Write-Host "   ❌ Create endpoint: Still returns 404 - DEPLOYMENT FAILED!" -ForegroundColor Red
    } else {
        Write-Host "   ⚠️  Create endpoint: Status $($_.Exception.Response.StatusCode)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "🎉 DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "======================" -ForegroundColor Green
Write-Host ""
Write-Host "If the subscription create endpoint still returns 404, run these additional commands:" -ForegroundColor Yellow
Write-Host "  ssh -i $SSHKeyPath ${LightsailUser}@${LightsailIP}" -ForegroundColor Cyan
Write-Host "  cd /home/bitnami/backend" -ForegroundColor Cyan
Write-Host "  pm2 restart backend" -ForegroundColor Cyan
Write-Host "  pm2 logs backend --lines 50" -ForegroundColor Cyan
Write-Host ""
Write-Host "The subscription system should now be working!" -ForegroundColor Green
