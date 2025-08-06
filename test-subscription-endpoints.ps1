# Test Subscription Endpoints After Deployment
Write-Host "🧪 Testing Subscription Endpoints" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# Test 1: Root API endpoint
Write-Host "1. Testing root API endpoint..." -ForegroundColor Yellow
try {
    $rootResponse = Invoke-WebRequest -Uri "https://api.tabi.mn/" -Method GET -TimeoutSec 10 -ErrorAction Stop
    Write-Host "   ✅ Root endpoint: Status $($rootResponse.StatusCode)" -ForegroundColor Green
    $rootContent = $rootResponse.Content | ConvertFrom-Json
    Write-Host "   📝 Response: $($rootContent.message)" -ForegroundColor Cyan
} catch {
    Write-Host "   ❌ Root endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Subscription plans endpoint
Write-Host "2. Testing subscription plans endpoint..." -ForegroundColor Yellow
try {
    $plansResponse = Invoke-WebRequest -Uri "https://api.tabi.mn/api/subscription/plans" -Method GET -TimeoutSec 10 -ErrorAction Stop
    Write-Host "   ✅ Plans endpoint: Status $($plansResponse.StatusCode)" -ForegroundColor Green
    $plansContent = $plansResponse.Content | ConvertFrom-Json
    Write-Host "   📝 Available plans: $($plansContent.plans.PSObject.Properties.Name -join ', ')" -ForegroundColor Cyan
} catch {
    Write-Host "   ❌ Plans endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Subscription create endpoint (should require auth)
Write-Host "3. Testing subscription create endpoint..." -ForegroundColor Yellow
try {
    $createResponse = Invoke-WebRequest -Uri "https://api.tabi.mn/api/subscription/create" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"plan":"basic"}' -TimeoutSec 10 -ErrorAction Stop
    Write-Host "   ⚠️  Create endpoint: Status $($createResponse.StatusCode) - Unexpected success!" -ForegroundColor Yellow
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 401) {
        Write-Host "   ✅ Create endpoint: Returns 401 (Unauthorized) - PERFECT!" -ForegroundColor Green
        Write-Host "   📝 This means the endpoint exists and requires authentication" -ForegroundColor Cyan
    } elseif ($statusCode -eq 404) {
        Write-Host "   ❌ Create endpoint: Still returns 404 - DEPLOYMENT ISSUE!" -ForegroundColor Red
    } else {
        Write-Host "   ⚠️  Create endpoint: Status $statusCode - $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

# Test 4: Other subscription endpoints
Write-Host "4. Testing other subscription endpoints..." -ForegroundColor Yellow

$endpoints = @(
    @{url="https://api.tabi.mn/api/subscription/current"; name="Current subscription"},
    @{url="https://api.tabi.mn/api/subscription/usage"; name="Usage stats"},
    @{url="https://api.tabi.mn/api/subscription/check/create_line"; name="Check limits"}
)

foreach ($endpoint in $endpoints) {
    try {
        $response = Invoke-WebRequest -Uri $endpoint.url -Method GET -TimeoutSec 10 -ErrorAction Stop
        Write-Host "   ⚠️  $($endpoint.name): Status $($response.StatusCode) - Unexpected success!" -ForegroundColor Yellow
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode -eq 401) {
            Write-Host "   ✅ $($endpoint.name): Returns 401 (auth required) - Good!" -ForegroundColor Green
        } elseif ($statusCode -eq 404) {
            Write-Host "   ❌ $($endpoint.name): Returns 404 - Missing endpoint!" -ForegroundColor Red
        } else {
            Write-Host "   ⚠️  $($endpoint.name): Status $statusCode" -ForegroundColor Yellow
        }
    }
}

Write-Host ""
Write-Host "🎯 SUMMARY" -ForegroundColor Cyan
Write-Host "=========" -ForegroundColor Cyan
Write-Host "If you see ✅ for the create endpoint (401 status), the subscription system is working!" -ForegroundColor Green
Write-Host "If you see ❌ (404 status), there may still be deployment issues." -ForegroundColor Red
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. If endpoints return 401: The backend is working correctly!" -ForegroundColor White
Write-Host "2. If endpoints return 404: Check PM2 logs with 'pm2 logs backend'" -ForegroundColor White
Write-Host "3. Test the frontend subscription creation functionality" -ForegroundColor White
