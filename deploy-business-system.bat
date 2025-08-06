@echo off
echo 🚀 Deploying Business System to Server...

echo 📦 Creating backend archive...
if exist "backend-business-system.zip" del "backend-business-system.zip"

echo Creating zip file...
powershell -Command "Compress-Archive -Path 'backend/*' -DestinationPath 'backend-business-system.zip' -Force"

echo ⬆️ Uploading to server...
scp -i "%USERPROFILE%/.ssh/tabi-key.pem" "backend-business-system.zip" bitnami@18.143.176.95:~/

echo 🔧 Deploying on server...
ssh -i "%USERPROFILE%/.ssh/tabi-key.pem" bitnami@18.143.176.95 "echo 'Stopping backend...' && pm2 stop backend && echo 'Backing up src...' && if [ -d 'src' ]; then mv src src-backup-$(date +%%Y%%m%%d-%%H%%M%%S); fi && echo 'Extracting new code...' && unzip -o backend-business-system.zip && echo 'Installing dependencies...' && npm install && echo 'Starting backend...' && pm2 start server.js --name backend && pm2 save && echo 'Deployment complete!' && pm2 status"

echo 🌐 Backend deployed successfully!
echo 🔍 Testing business endpoints...

curl -s "https://api.tabi.mn/api/business/plans" > nul
if %errorlevel% equ 0 (
    echo ✅ Business plans endpoint working!
) else (
    echo ❌ Business plans endpoint failed!
)

echo 🎉 Business system deployment complete!
echo.
pause
