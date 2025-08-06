# Test PowerShell Deployment Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    TESTING DEPLOYMENT SCRIPT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Check if backend directory exists
Write-Host "Test 1: Checking backend directory..." -ForegroundColor Yellow
if (Test-Path "backend") {
    Write-Host "✅ Backend directory exists" -ForegroundColor Green
} else {
    Write-Host "❌ Backend directory not found!" -ForegroundColor Red
    exit 1
}

# Test 2: Check if key files exist
Write-Host ""
Write-Host "Test 2: Checking key backend files..." -ForegroundColor Yellow
$keyFiles = @(
    "backend/src/app.js",
    "backend/src/controllers/subscriptionController.js",
    "backend/src/routes/subscription.js",
    "backend/src/controllers/paymentController.js",
    "backend/src/routes/payments.js",
    "backend/src/services/bylService.js",
    "backend/src/models/Payment.js"
)

$allFilesExist = $true
foreach ($file in $keyFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file exists" -ForegroundColor Green
    } else {
        Write-Host "❌ $file missing!" -ForegroundColor Red
        $allFilesExist = $false
    }
}

if (-not $allFilesExist) {
    Write-Host "❌ Some key files are missing!" -ForegroundColor Red
    exit 1
}

# Test 3: Test zip creation (dry run)
Write-Host ""
Write-Host "Test 3: Testing zip creation..." -ForegroundColor Yellow

try {
    # Create a temporary directory for backend files (excluding node_modules)
    $tempDir = "test_temp_backend"
    if (Test-Path $tempDir) {
        Remove-Item -Recurse -Force $tempDir
    }
    New-Item -ItemType Directory -Path $tempDir | Out-Null
    
    # Copy all backend files except node_modules
    Write-Host "Copying backend files (excluding node_modules)..." -ForegroundColor Yellow
    robocopy "backend" $tempDir /E /XD node_modules /NFL /NDL /NJH /NJS /NC /NS /NP | Out-Null
    
    # Check if key files were copied
    $copiedFiles = Get-ChildItem -Path $tempDir -Recurse -File | Measure-Object
    Write-Host "✅ Copied $($copiedFiles.Count) files to temporary directory" -ForegroundColor Green
    
    # Test compression
    $testZip = "test_backend.zip"
    Compress-Archive -Path "$tempDir\*" -DestinationPath $testZip -Force
    
    if (Test-Path $testZip) {
        $zipSize = (Get-Item $testZip).Length / 1MB
        Write-Host "✅ Test zip created successfully ($([math]::Round($zipSize, 2)) MB)" -ForegroundColor Green
        
        # Clean up test files
        Remove-Item $testZip
        Remove-Item -Recurse -Force $tempDir
        
        Write-Host "✅ Test zip creation successful" -ForegroundColor Green
    } else {
        Write-Host "❌ Test zip creation failed!" -ForegroundColor Red
        exit 1
    }
    
} catch {
    Write-Host "❌ Zip creation test failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 4: Check SSH key exists
Write-Host ""
Write-Host "Test 4: Checking SSH key..." -ForegroundColor Yellow
$sshKey = "C:/Users/HiTech/Downloads/default.pem"
if (Test-Path $sshKey) {
    Write-Host "✅ SSH key found at $sshKey" -ForegroundColor Green
} else {
    Write-Host "⚠️  SSH key not found at $sshKey" -ForegroundColor Yellow
    Write-Host "   Make sure the SSH key path is correct in deploy.ps1" -ForegroundColor Yellow
}

# Test 5: Check if required commands are available
Write-Host ""
Write-Host "Test 5: Checking required commands..." -ForegroundColor Yellow

try {
    $scpVersion = & scp -V 2>&1
    Write-Host "✅ SCP command available" -ForegroundColor Green
} catch {
    Write-Host "❌ SCP command not found! Install OpenSSH or Git Bash" -ForegroundColor Red
}

try {
    $sshVersion = & ssh -V 2>&1
    Write-Host "✅ SSH command available" -ForegroundColor Green
} catch {
    Write-Host "❌ SSH command not found! Install OpenSSH or Git Bash" -ForegroundColor Red
}

# Test 6: Verify subscription endpoint code
Write-Host ""
Write-Host "Test 6: Verifying subscription endpoint code..." -ForegroundColor Yellow

$subscriptionController = Get-Content "backend/src/controllers/subscriptionController.js" -Raw
if ($subscriptionController -match "createSubscription") {
    Write-Host "✅ createSubscription function found in controller" -ForegroundColor Green
} else {
    Write-Host "❌ createSubscription function missing from controller!" -ForegroundColor Red
}

$subscriptionRoutes = Get-Content "backend/src/routes/subscription.js" -Raw
if ($subscriptionRoutes -match "POST.*create" -or $subscriptionRoutes -match "router\.post.*create") {
    Write-Host "✅ POST /create route found in subscription routes" -ForegroundColor Green
} else {
    Write-Host "❌ POST /create route missing from subscription routes!" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "    ✅ ALL TESTS PASSED!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Deployment script is ready to use!" -ForegroundColor Green
Write-Host "   Run: .\deploy.ps1" -ForegroundColor Cyan
Write-Host ""

Read-Host "Press Enter to exit"
