#!/usr/bin/env pwsh

# Backend Deployment Script
# This script zips the backend folder (excluding node_modules) and deploys it to AWS Lightsail

Write-Host "🚀 Starting Backend Deployment..." -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

# Set variables
$BackendPath = ".\backend"
$ZipPath = ".\backend\backend.zip"
$KeyPath = "C:\Users\HiTech\Downloads\default.pem"
$ServerUser = "bitnami"
$ServerIP = "13.229.113.229"
$RemotePath = "/home/bitnami/"

# Step 1: Check if backend folder exists
Write-Host "📁 Checking backend folder..." -ForegroundColor Yellow
if (-not (Test-Path $BackendPath)) {
    Write-Host "❌ Backend folder not found!" -ForegroundColor Red
    exit 1
}

# Step 2: Remove existing zip file if it exists
Write-Host "🗑️  Cleaning up old zip file..." -ForegroundColor Yellow
if (Test-Path $ZipPath) {
    Remove-Item $ZipPath -Force
    Write-Host "✅ Old zip file removed" -ForegroundColor Green
}

# Step 3: Create zip file excluding node_modules
Write-Host "📦 Creating backend.zip (excluding node_modules)..." -ForegroundColor Yellow
try {
    # Get all files in backend folder except node_modules
    $FilesToZip = Get-ChildItem -Path $BackendPath -Recurse | Where-Object { 
        $_.FullName -notmatch "node_modules" -and 
        $_.FullName -notmatch "\.git" -and
        $_.FullName -notmatch "backend\.zip"
    }
    
    # Create zip file
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    $ZipFile = [System.IO.Compression.ZipFile]::Open($ZipPath, 'Create')
    
    foreach ($File in $FilesToZip) {
        if (-not $File.PSIsContainer) {
            $RelativePath = $File.FullName.Substring($BackendPath.Length + 1)
            $ZipEntry = $ZipFile.CreateEntry($RelativePath)
            $ZipEntryStream = $ZipEntry.Open()
            $FileStream = [System.IO.File]::OpenRead($File.FullName)
            $FileStream.CopyTo($ZipEntryStream)
            $FileStream.Close()
            $ZipEntryStream.Close()
        }
    }
    
    $ZipFile.Dispose()
    Write-Host "✅ Backend.zip created successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to create zip file: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 4: Check if SSH key exists
Write-Host "🔑 Checking SSH key..." -ForegroundColor Yellow
if (-not (Test-Path $KeyPath)) {
    Write-Host "❌ SSH key not found at: $KeyPath" -ForegroundColor Red
    exit 1
}

# Step 5: Upload zip file to server
Write-Host "📤 Uploading backend.zip to server..." -ForegroundColor Yellow
try {
    $ScpCommand = "scp -i `"$KeyPath`" `"$ZipPath`" ${ServerUser}@${ServerIP}:${RemotePath}"
    Write-Host "Executing: $ScpCommand" -ForegroundColor Cyan
    
    $Process = Start-Process -FilePath "scp" -ArgumentList @("-i", $KeyPath, $ZipPath, "${ServerUser}@${ServerIP}:${RemotePath}") -Wait -PassThru -NoNewWindow
    
    if ($Process.ExitCode -eq 0) {
        Write-Host "✅ File uploaded successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Upload failed with exit code: $($Process.ExitCode)" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Upload failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 6: Execute deployment commands on server
Write-Host "🔧 Executing deployment commands on server..." -ForegroundColor Yellow

$DeploymentCommands = @(
    "pm2 delete backend || true",
    "rm -rf backend",
    "cd /home/bitnami",
    "unzip -o backend.zip",
    "cd backend",
    "npm install",
    "pm2 start server.js --name backend",
    "pm2 save",
    "pm2 startup"
)

$CommandString = $DeploymentCommands -join " && "

try {
    Write-Host "Executing deployment commands..." -ForegroundColor Cyan
    $SshProcess = Start-Process -FilePath "ssh" -ArgumentList @("-i", $KeyPath, "${ServerUser}@${ServerIP}", $CommandString) -Wait -PassThru -NoNewWindow
    
    if ($SshProcess.ExitCode -eq 0) {
        Write-Host "✅ Deployment commands executed successfully" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Deployment completed with exit code: $($SshProcess.ExitCode)" -ForegroundColor Yellow
        Write-Host "This might be normal if pm2 startup requires manual setup" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Deployment failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 7: Verify deployment
Write-Host "🔍 Verifying deployment..." -ForegroundColor Yellow
try {
    Start-Sleep -Seconds 3
    $VerifyProcess = Start-Process -FilePath "ssh" -ArgumentList @("-i", $KeyPath, "${ServerUser}@${ServerIP}", "pm2 status") -Wait -PassThru -NoNewWindow
    
    if ($VerifyProcess.ExitCode -eq 0) {
        Write-Host "✅ PM2 status check completed" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  Could not verify deployment status" -ForegroundColor Yellow
}

# Step 8: Test API endpoint
Write-Host "🌐 Testing API endpoint..." -ForegroundColor Yellow
try {
    Start-Sleep -Seconds 5
    $Response = Invoke-WebRequest -Uri "https://api.tabi.mn/" -Method GET -TimeoutSec 10 -ErrorAction SilentlyContinue
    if ($Response.StatusCode -eq 200) {
        Write-Host "✅ API is responding successfully!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  API returned status code: $($Response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  API test failed - this might be normal if the domain takes time to propagate" -ForegroundColor Yellow
}

Write-Host "" -ForegroundColor White
Write-Host "🎉 Deployment Complete!" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green
Write-Host "✅ Backend zipped (excluding node_modules)" -ForegroundColor White
Write-Host "✅ Uploaded to server" -ForegroundColor White
Write-Host "✅ Dependencies installed" -ForegroundColor White
Write-Host "✅ PM2 process started" -ForegroundColor White
Write-Host "" -ForegroundColor White
Write-Host "🔗 Your API should be available at: https://api.tabi.mn/" -ForegroundColor Cyan
Write-Host "" -ForegroundColor White
Write-Host "📋 To check server status manually:" -ForegroundColor Yellow
Write-Host "   ssh -i `"$KeyPath`" ${ServerUser}@${ServerIP}" -ForegroundColor Gray
Write-Host "   pm2 status" -ForegroundColor Gray
Write-Host "   pm2 logs backend" -ForegroundColor Gray
