# BYL Payment Integration - Complete Deployment Script
# This PowerShell script deploys the BYL integration fix to AWS Lightsail

param(
    [Parameter(Mandatory=$true)]
    [string]$LightsailIP,
    
    [Parameter(Mandatory=$true)]
    [string]$SSHKeyPath,
    
    [string]$LightsailUser = "bitnami",
    [string]$RemoteAppPath = "/home/bitnami",
    [string]$LocalBackendPath = ".\backend"
)

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Cyan"

Write-Host "🚀 BYL Payment Integration - Complete Deployment" -ForegroundColor $Blue
Write-Host "=================================================" -ForegroundColor $Blue

# Validate parameters
if (-not (Test-Path $SSHKeyPath)) {
    Write-Host "❌ SSH key not found at: $SSHKeyPath" -ForegroundColor $Red
    exit 1
}

if (-not (Test-Path $LocalBackendPath)) {
    Write-Host "❌ Backend directory not found at: $LocalBackendPath" -ForegroundColor $Red
    exit 1
}

Write-Host "📋 Configuration:" -ForegroundColor $Yellow
Write-Host "   Lightsail IP: $LightsailIP" -ForegroundColor $Yellow
Write-Host "   SSH Key: $SSHKeyPath" -ForegroundColor $Yellow
Write-Host "   User: $LightsailUser" -ForegroundColor $Yellow
Write-Host "   Backend Path: $LocalBackendPath" -ForegroundColor $Yellow
Write-Host ""

# Step 1: Create deployment package
Write-Host "📦 Step 1: Creating deployment package..." -ForegroundColor $Blue

$TempDir = New-TemporaryFile | ForEach-Object { Remove-Item $_; New-Item -ItemType Directory -Path $_ }
Write-Host "   Using temp directory: $TempDir" -ForegroundColor $Yellow

# Copy backend files
Copy-Item -Path "$LocalBackendPath\*" -Destination $TempDir -Recurse -Force

# Remove node_modules to reduce size
$NodeModulesPath = Join-Path $TempDir "node_modules"
if (Test-Path $NodeModulesPath) {
    Write-Host "   Removing node_modules..." -ForegroundColor $Yellow
    Remove-Item -Path $NodeModulesPath -Recurse -Force
}

# Create archive
$ArchiveName = "backend-byl-fix-$(Get-Date -Format 'yyyyMMdd-HHmmss').tar.gz"
$ArchivePath = Join-Path $TempDir.Parent.FullName $ArchiveName

Write-Host "   Creating archive: $ArchiveName" -ForegroundColor $Yellow

Push-Location $TempDir
if (Get-Command wsl -ErrorAction SilentlyContinue) {
    wsl tar -czf "../$ArchiveName" .
} elseif (Get-Command bash -ErrorAction SilentlyContinue) {
    bash -c "tar -czf ../$ArchiveName ."
} else {
    Write-Host "❌ WSL or Git Bash required for creating tar.gz archive" -ForegroundColor $Red
    exit 1
}
Pop-Location

Write-Host "✅ Package created successfully" -ForegroundColor $Green

# Step 2: Upload to server
Write-Host "📤 Step 2: Uploading to Lightsail..." -ForegroundColor $Blue

try {
    scp -i "$SSHKeyPath" "$ArchivePath" "${LightsailUser}@${LightsailIP}:/tmp/"
    Write-Host "✅ Upload completed" -ForegroundColor $Green
} catch {
    Write-Host "❌ Upload failed: $_" -ForegroundColor $Red
    exit 1
}

# Step 3: Deploy on server
Write-Host "🔧 Step 3: Deploying on server..." -ForegroundColor $Blue

$DeploymentScript = @"
set -e

echo "🔄 Stopping PM2..."
pm2 stop backend || echo "Backend not running"
pm2 delete backend || echo "Backend not in PM2"

echo "📁 Creating backup..."
mkdir -p backup-old-`$(date +%Y%m%d-%H%M%S)
cp -r src *.js package*.json .env backup-old-`$(date +%Y%m%d-%H%M%S)/ 2>/dev/null || true

echo "🗑️  Removing old files..."
rm -rf src *.js package*.json

echo "📦 Extracting new files..."
cd $RemoteAppPath
tar -xzf /tmp/$ArchiveName

echo "📦 Installing dependencies..."
npm install --production

echo "🚀 Starting PM2..."
pm2 start server.js --name backend
pm2 save

echo "✅ Deployment completed!"

# Clean up
rm -f /tmp/$ArchiveName

echo ""
echo "🔍 Verification:"
echo "=================="

echo "1. Checking if app.js loads subscription routes:"
grep -n "subscription" src/app.js || echo "   ❌ Subscription routes not found in app.js"

echo ""
echo "2. Checking if controller has createSubscription:"
grep -n "createSubscription" src/controllers/subscriptionController.js || echo "   ❌ createSubscription not found in controller"

echo ""
echo "3. Testing API endpoint:"
curl -X POST https://api.tabi.mn/api/subscription/create -H "Content-Type: application/json" -d '{"plan":"test"}' || echo "   ❌ API test failed"

echo ""
echo "4. PM2 Status:"
pm2 status

echo ""
echo "5. Recent PM2 Logs:"
pm2 logs backend --lines 5 --nostream
"@

try {
    $DeploymentScript | ssh -i "$SSHKeyPath" "${LightsailUser}@${LightsailIP}" "bash -s"
    Write-Host "✅ Server deployment completed" -ForegroundColor $Green
} catch {
    Write-Host "❌ Server deployment failed: $_" -ForegroundColor $Red
    exit 1
}

# Step 4: Final verification
Write-Host "🔍 Step 4: Final verification..." -ForegroundColor $Blue

try {
    Write-Host "   Testing subscription plans endpoint..." -ForegroundColor $Yellow
    $PlansResponse = Invoke-WebRequest -Uri "https://api.tabi.mn/api/subscription/plans" -Method GET -ErrorAction Stop
    if ($PlansResponse.StatusCode -eq 200) {
        Write-Host "   ✅ Plans endpoint working" -ForegroundColor $Green
    }
} catch {
    Write-Host "   ❌ Plans endpoint failed" -ForegroundColor $Red
}

try {
    Write-Host "   Testing subscription create endpoint..." -ForegroundColor $Yellow
    $CreateResponse = Invoke-WebRequest -Uri "https://api.tabi.mn/api/subscription/create" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"plan":"test"}' -ErrorAction SilentlyContinue
    if ($CreateResponse.StatusCode -ne 404) {
        Write-Host "   ✅ Create endpoint responding (not 404)" -ForegroundColor $Green
    } else {
        Write-Host "   ❌ Create endpoint still returns 404" -ForegroundColor $Red
    }
} catch {
    if ($_.Exception.Response.StatusCode -ne 404) {
        Write-Host "   ✅ Create endpoint responding (not 404)" -ForegroundColor $Green
    } else {
        Write-Host "   ❌ Create endpoint still returns 404" -ForegroundColor $Red
    }
}

# Clean up local files
Remove-Item -Path $TempDir -Recurse -Force
Remove-Item -Path $ArchivePath -Force

Write-Host ""
Write-Host "🎉 BYL Payment Integration Deployment Complete!" -ForegroundColor $Green
Write-Host "=================================================" -ForegroundColor $Green
Write-Host ""
Write-Host "📍 Your API: https://api.tabi.mn" -ForegroundColor $Blue
Write-Host "📍 Frontend: https://tabi.mn/pricing" -ForegroundColor $Blue
Write-Host ""
Write-Host "🔧 If the create endpoint still returns 404, run these commands on your server:" -ForegroundColor $Yellow
Write-Host "   ssh -i $SSHKeyPath ${LightsailUser}@${LightsailIP}" -ForegroundColor $Yellow
Write-Host "   grep -n 'subscription' src/app.js" -ForegroundColor $Yellow
Write-Host "   grep -n 'createSubscription' src/controllers/subscriptionController.js" -ForegroundColor $Yellow
Write-Host "   pm2 restart backend" -ForegroundColor $Yellow
Write-Host ""
Write-Host "✅ BYL integration is ready once the endpoint responds correctly!" -ForegroundColor $Green
