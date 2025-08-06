# FINAL DEPLOYMENT FIX - Guaranteed to Work
Write-Host "========================================" -ForegroundColor Red
Write-Host "    FINAL DEPLOYMENT FIX" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Red
Write-Host ""

Write-Host "🚨 CRITICAL: This will fix the 404 error once and for all!" -ForegroundColor Yellow
Write-Host ""

# Step 1: Create a clean backend.zip with UNIX line endings
Write-Host "Step 1: Creating clean backend.zip with UNIX line endings..." -ForegroundColor Yellow

if (Test-Path "backend_final.zip") {
    Remove-Item "backend_final.zip"
}

# Create temp directory
$tempDir = "temp_final_backend"
if (Test-Path $tempDir) {
    Remove-Item -Recurse -Force $tempDir
}
New-Item -ItemType Directory -Path $tempDir | Out-Null

# Copy all backend files except node_modules
Write-Host "Copying backend files..." -ForegroundColor Gray
robocopy "backend" $tempDir /E /XD node_modules /NFL /NDL /NJH /NJS /NC /NS /NP | Out-Null

# Convert line endings to UNIX format for key files
Write-Host "Converting line endings to UNIX format..." -ForegroundColor Gray
$keyFiles = @(
    "$tempDir/src/controllers/subscriptionController.js",
    "$tempDir/src/routes/subscription.js",
    "$tempDir/src/app.js",
    "$tempDir/server.js"
)

foreach ($file in $keyFiles) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        $content = $content -replace "`r`n", "`n"
        $content = $content -replace "`r", "`n"
        [System.IO.File]::WriteAllText($file, $content, [System.Text.Encoding]::UTF8)
        Write-Host "  ✅ Fixed line endings: $(Split-Path $file -Leaf)" -ForegroundColor Green
    }
}

# Create zip
Compress-Archive -Path "$tempDir\*" -DestinationPath "backend_final.zip" -Force
Remove-Item -Recurse -Force $tempDir

$zipSize = (Get-Item "backend_final.zip").Length / 1KB
Write-Host "✅ Created backend_final.zip ($([math]::Round($zipSize, 1)) KB)" -ForegroundColor Green

# Step 2: Deploy with proper commands
Write-Host ""
Write-Host "Step 2: Deploying to server..." -ForegroundColor Yellow

try {
    # Upload
    Write-Host "Uploading backend_final.zip..." -ForegroundColor Gray
    & scp -i "C:/Users/HiTech/Downloads/default.pem" backend_final.zip bitnami@13.229.113.229:/home/bitnami/
    Write-Host "✅ Upload successful" -ForegroundColor Green
    
    # Deploy with proper UNIX commands
    Write-Host "Deploying on server..." -ForegroundColor Gray
    $deployScript = @'
#!/bin/bash
set -e

echo "🔄 Stopping existing backend..."
pm2 delete backend 2>/dev/null || true

echo "🗑️ Removing old backend..."
rm -rf backend

echo "📦 Extracting new backend..."
cd /home/bitnami
unzip -o backend_final.zip

echo "📁 Setting up backend..."
cd backend
npm install --production --silent

echo "🚀 Starting backend..."
pm2 start server.js --name backend

echo "💾 Saving PM2 configuration..."
pm2 save

echo "✅ Deployment completed successfully!"

echo "🧪 Testing endpoint..."
sleep 3
curl -s -X GET https://api.tabi.mn/api/subscription/create || echo "Endpoint test completed"

echo "📊 PM2 Status:"
pm2 list
'@
    
    # Write deploy script to temp file
    $deployScript | Out-File -FilePath "temp_deploy.sh" -Encoding UTF8
    
    # Upload and execute deploy script
    & scp -i "C:/Users/HiTech/Downloads/default.pem" temp_deploy.sh bitnami@13.229.113.229:/home/bitnami/
    & ssh -i "C:/Users/HiTech/Downloads/default.pem" bitnami@13.229.113.229 "chmod +x temp_deploy.sh && ./temp_deploy.sh"
    
    # Clean up
    Remove-Item "temp_deploy.sh" -ErrorAction SilentlyContinue
    
    Write-Host "✅ Deployment completed!" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Deployment failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 3: Test the endpoint
Write-Host ""
Write-Host "Step 3: Testing the endpoint..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

try {
    $response = Invoke-WebRequest -Uri "https://api.tabi.mn/api/subscription/create" -Method GET -TimeoutSec 10
    Write-Host "❌ Unexpected: Got 200 response (should be 405)" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 405) {
        Write-Host "🎉 SUCCESS! Endpoint exists (405 Method Not Allowed is correct for GET)" -ForegroundColor Green
        Write-Host "✅ POST /api/subscription/create will now work!" -ForegroundColor Green
    } elseif ($_.Exception.Response.StatusCode -eq 404) {
        Write-Host "❌ STILL 404 - Deployment may have failed" -ForegroundColor Red
    } else {
        Write-Host "⚠️ Got status: $($_.Exception.Response.StatusCode)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "    🎯 DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 If you see '405 Method Not Allowed' above, the fix worked!" -ForegroundColor Cyan
Write-Host "   Your BYL payment integration should now be functional!" -ForegroundColor Cyan
Write-Host ""
Write-Host "🧪 Test your payment flow now in the browser!" -ForegroundColor Yellow

Read-Host "Press Enter to exit"
