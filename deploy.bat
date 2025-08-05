@echo off
echo ========================================
echo    TABI BACKEND DEPLOYMENT SCRIPT
echo ========================================
echo.

REM Check if backend.zip exists
if not exist "backend.zip" (
    echo Creating backend.zip (excluding node_modules)...
    cd backend
    powershell -Command "Get-ChildItem -Path '.' -Exclude 'node_modules' | Compress-Archive -DestinationPath '..\backend.zip' -Force"
    cd ..
    echo ✅ backend.zip created
) else (
    echo Updating backend.zip (excluding node_modules)...
    del backend.zip
    cd backend
    powershell -Command "Get-ChildItem -Path '.' -Exclude 'node_modules' | Compress-Archive -DestinationPath '..\backend.zip' -Force"
    cd ..
    echo ✅ backend.zip updated
)

echo.
echo Uploading to server...
scp -i "C:/Users/HiTech/Downloads/default.pem" backend.zip bitnami@13.229.113.229:/home/bitnami/

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Upload failed!
    pause
    exit /b 1
)

echo ✅ Upload successful!
echo.
echo Deploying on server...

ssh -i "C:/Users/HiTech/Downloads/default.pem" bitnami@13.229.113.229 "pm2 delete backend 2>/dev/null || true && rm -rf backend && cd /home/bitnami && unzip -o backend.zip && cd backend && npm install && pm2 start server.js --name backend && pm2 save"

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Deployment failed!
    pause
    exit /b 1
)

echo.
echo ========================================
echo    ✅ DEPLOYMENT SUCCESSFUL!
echo ========================================
echo.
echo Testing backend health...
curl -s https://api.tabi.mn/ | findstr "Tabi API is running"

if %ERRORLEVEL% EQU 0 (
    echo ✅ Backend is healthy and running!
) else (
    echo ⚠️  Backend might still be starting up...
)

echo.
echo Deployment completed at %date% %time%
pause
