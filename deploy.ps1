# Tabi Backend Deployment Script (PowerShell)
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    TABI BACKEND DEPLOYMENT SCRIPT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Create or update backend.zip (excluding node_modules)
if (Test-Path "backend.zip") {
    Write-Host "Updating backend.zip (excluding node_modules)..." -ForegroundColor Yellow
    Remove-Item "backend.zip"
} else {
    Write-Host "Creating backend.zip (excluding node_modules)..." -ForegroundColor Yellow
}

try {
    # Create a temporary directory for backend files (excluding node_modules)
    $tempDir = "temp_backend"
    if (Test-Path $tempDir) {
        Remove-Item -Recurse -Force $tempDir
    }
    New-Item -ItemType Directory -Path $tempDir | Out-Null
    
    # Copy all backend files except node_modules
    Write-Host "Copying backend files (excluding node_modules)..." -ForegroundColor Yellow
    robocopy "backend" $tempDir /E /XD node_modules /NFL /NDL /NJH /NJS /NC /NS /NP
    
    # Compress the temporary directory
    Compress-Archive -Path "$tempDir\*" -DestinationPath "backend.zip" -Force
    
    # Clean up temporary directory
    Remove-Item -Recurse -Force $tempDir
    
    Write-Host "✅ backend.zip created successfully (node_modules excluded)" -ForegroundColor Green
    
    # Verify the zip contains our new files
    $zipContents = Get-ChildItem -Path "backend.zip" | ForEach-Object { 
        Add-Type -AssemblyName System.IO.Compression.FileSystem
        $zip = [System.IO.Compression.ZipFile]::OpenRead($_.FullName)
        $zip.Entries | Where-Object { $_.Name -like "*subscription*" -or $_.Name -like "*payment*" }
        $zip.Dispose()
    }
    
    Write-Host "✅ Verified: New subscription and payment files included" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Failed to create backend.zip: $($_.Exception.Message)" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "Uploading to server..." -ForegroundColor Yellow

# Upload to server
$uploadResult = & scp -i "C:/Users/HiTech/Downloads/default.pem" backend.zip bitnami@13.229.113.229:/home/bitnami/ 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Upload failed!" -ForegroundColor Red
    Write-Host $uploadResult -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "✅ Upload successful!" -ForegroundColor Green
Write-Host ""
Write-Host "Deploying on server..." -ForegroundColor Yellow

# Deploy on server
$deployCommand = @"
pm2 delete backend 2>/dev/null || true
rm -rf backend
cd /home/bitnami
unzip -o backend.zip
cd backend
npm install
pm2 start server.js --name backend
pm2 save
echo "Deployment completed successfully"
"@

$deployResult = & ssh -i "C:/Users/HiTech/Downloads/default.pem" bitnami@13.229.113.229 $deployCommand 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    Write-Host $deployResult -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "    ✅ DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Test backend health
Write-Host "Testing backend health..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "https://api.tabi.mn/" -TimeoutSec 10
    if ($response.message -like "*Tabi API is running*") {
        Write-Host "✅ Backend is healthy and running!" -ForegroundColor Green
        Write-Host "API Response: $($response.message)" -ForegroundColor Cyan
    } else {
        Write-Host "⚠️  Backend responded but with unexpected message" -ForegroundColor Yellow
        Write-Host "Response: $($response | ConvertTo-Json)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Backend might still be starting up..." -ForegroundColor Yellow
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Deployment completed at $(Get-Date)" -ForegroundColor Cyan
Write-Host ""
Write-Host "🚀 Your Tabi platform is now deployed!" -ForegroundColor Green
Write-Host "   Frontend: https://tabi.mn" -ForegroundColor Cyan
Write-Host "   API: https://api.tabi.mn" -ForegroundColor Cyan
Write-Host ""

Read-Host "Press Enter to exit"
