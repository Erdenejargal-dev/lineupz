# AWS Lightsail Backend Deployment Script (PowerShell)
# This script automates the deployment of your backend to AWS Lightsail

param(
    [string]$LightsailIP = "YOUR_LIGHTSAIL_IP",
    [string]$LightsailUser = "ubuntu",
    [string]$SSHKeyPath = "$env:USERPROFILE\.ssh\your-key.pem",
    [string]$RemoteAppPath = "/home/ubuntu/tabi-backend",
    [string]$LocalBackendPath = ".\backend"
)

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Cyan"

Write-Host "🚀 Starting AWS Lightsail Backend Deployment..." -ForegroundColor $Blue

# Check if required variables are set
if ($LightsailIP -eq "YOUR_LIGHTSAIL_IP") {
    Write-Host "❌ Please update LightsailIP parameter" -ForegroundColor $Red
    exit 1
}

# Check if SSH key exists
if (-not (Test-Path $SSHKeyPath)) {
    Write-Host "❌ SSH key not found at $SSHKeyPath" -ForegroundColor $Red
    exit 1
}

# Check if backend directory exists
if (-not (Test-Path $LocalBackendPath)) {
    Write-Host "❌ Backend directory not found at $LocalBackendPath" -ForegroundColor $Red
    exit 1
}

Write-Host "📦 Preparing deployment package..." -ForegroundColor $Yellow

# Create a temporary deployment directory
$TempDir = New-TemporaryFile | ForEach-Object { Remove-Item $_; New-Item -ItemType Directory -Path $_ }
Write-Host "Using temporary directory: $TempDir"

# Copy backend files to temp directory
Copy-Item -Path "$LocalBackendPath\*" -Destination $TempDir -Recurse -Force

# Remove node_modules to reduce upload size
$NodeModulesPath = Join-Path $TempDir "node_modules"
if (Test-Path $NodeModulesPath) {
    Write-Host "🗑️  Removing node_modules to reduce upload size..." -ForegroundColor $Yellow
    Remove-Item -Path $NodeModulesPath -Recurse -Force
}

# Create deployment archive
$ArchiveName = "backend-$(Get-Date -Format 'yyyyMMdd-HHmmss').tar.gz"
Write-Host "📦 Creating archive: $ArchiveName" -ForegroundColor $Yellow

# Use WSL or Git Bash to create tar.gz (Windows doesn't have native tar.gz support)
$ArchivePath = Join-Path $TempDir.Parent.FullName $ArchiveName
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

Write-Host "📤 Uploading to Lightsail instance..." -ForegroundColor $Blue

# Upload the archive using scp
if (Get-Command scp -ErrorAction SilentlyContinue) {
    scp -i "$SSHKeyPath" "$ArchivePath" "${LightsailUser}@${LightsailIP}:/tmp/"
} else {
    Write-Host "❌ scp command not found. Please install OpenSSH or Git Bash" -ForegroundColor $Red
    exit 1
}

Write-Host "🔧 Deploying on remote server..." -ForegroundColor $Blue

# Execute deployment commands on remote server
$DeploymentScript = @"
set -e

echo "🔄 Stopping existing application..."
sudo systemctl stop tabi-backend || echo "Service not running"

echo "📁 Creating backup of current deployment..."
if [ -d "$RemoteAppPath" ]; then
    sudo mv "$RemoteAppPath" "${RemoteAppPath}-backup-`$(date +%Y%m%d-%H%M%S)" || true
fi

echo "📦 Extracting new deployment..."
sudo mkdir -p "$RemoteAppPath"
cd "$RemoteAppPath"
sudo tar -xzf "/tmp/$ArchiveName"
sudo chown -R $LightsailUser`:$LightsailUser "$RemoteAppPath"

echo "📦 Installing dependencies..."
cd "$RemoteAppPath"
npm install --production

echo "🔧 Setting up environment..."
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Please create it manually."
fi

echo "🚀 Starting application..."
sudo systemctl start tabi-backend
sudo systemctl enable tabi-backend

echo "✅ Deployment completed successfully!"

# Clean up
rm -f "/tmp/$ArchiveName"
"@

if (Get-Command ssh -ErrorAction SilentlyContinue) {
    $DeploymentScript | ssh -i "$SSHKeyPath" "${LightsailUser}@${LightsailIP}" "bash -s"
} else {
    Write-Host "❌ ssh command not found. Please install OpenSSH or Git Bash" -ForegroundColor $Red
    exit 1
}

# Clean up local temp files
Remove-Item -Path $TempDir -Recurse -Force
Remove-Item -Path $ArchivePath -Force

Write-Host "✅ Deployment completed successfully!" -ForegroundColor $Green
Write-Host "🔍 Checking service status..." -ForegroundColor $Blue

# Check if the service is running
ssh -i "$SSHKeyPath" "${LightsailUser}@${LightsailIP}" "sudo systemctl status tabi-backend --no-pager"

Write-Host "🎉 Backend deployment to AWS Lightsail completed!" -ForegroundColor $Green
Write-Host "📍 Your API should be available at: https://api.tabi.mn" -ForegroundColor $Blue
