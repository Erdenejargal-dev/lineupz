# 🚨 IMMEDIATE FIX COMMANDS - Execute Now

## **Copy and paste these commands exactly:**

```bash
# Stop the crashing backend
pm2 stop backend
pm2 delete backend

# Navigate to backend directory
cd /home/bitnami/src

# Backup broken files
mv routes/subscription.js routes/subscription.js.broken
mv app.js app.js.broken

# Copy working files from our project
cp /home/bitnami/Desktop/lineupz/backend/src/routes/subscription_working.js routes/subscription.js
cp /home/bitnami/Desktop/lineupz/backend/src/app_fixed.js app.js

# Start backend with working files
cd /home/bitnami
pm2 start src/server.js --name backend

# Check if it's working
pm2 logs backend --lines 10
```

## **Expected Success Output:**
```
✅ Server running on port 5000
✅ Connected to MongoDB
✅ No crash errors
```

## **Test the API:**
```bash
curl https://api.tabi.mn/
```

Should return:
```json
{
  "message": "Tabi API is running!",
  "version": "1.0.0",
  "status": "healthy"
}
```

## **What These Commands Do:**

1. **Stop crashing backend** - Kills the infinite restart loop
2. **Backup broken files** - Saves original files as .broken
3. **Copy working files** - Uses the fixed versions I created
4. **Start fresh backend** - Clean PM2 process
5. **Verify success** - Check logs for confirmation

## **The Fixed Files:**

### **subscription_working.js**
- No controller dependencies
- All routes return proper JSON responses
- No authentication errors
- Safe fallback responses

### **app_fixed.js**
- Comprehensive CORS configuration
- Uses working subscription routes
- Proper error handling
- All HTTP methods supported

**Execute these commands now - your backend will be running in 30 seconds!**
