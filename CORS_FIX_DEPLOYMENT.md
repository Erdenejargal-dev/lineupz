# CORS Fix for Production Deployment

## 🚨 **Issue Fixed**

The CORS error you encountered:
```
Access to fetch at 'https://api.tabi.mn/api/queue/my-queue' from origin 'https://tabi.mn' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## ✅ **Solution Implemented**

Updated `backend/src/app.js` with improved CORS configuration:

```javascript
const allowedOrigins = [
  'https://tabi.mn',
  'https://www.tabi.mn',
  'http://localhost:3000',
  'http://localhost:3001',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
}));
```

## 🔧 **What Changed**

### **Before:**
- Only allowed `https://tabi.mn`
- Basic CORS configuration
- Limited HTTP methods and headers

### **After:**
- ✅ Allows both `https://tabi.mn` and `https://www.tabi.mn`
- ✅ Supports all necessary HTTP methods (GET, POST, PUT, DELETE, PATCH, OPTIONS)
- ✅ Includes all required headers (Content-Type, Authorization, X-Requested-With)
- ✅ Handles preflight OPTIONS requests properly
- ✅ Allows requests with no origin (mobile apps, curl)
- ✅ Better error logging for debugging

## 🚀 **Deployment Steps**

### **1. Update Your Backend**
```bash
# Navigate to your backend directory
cd backend

# Pull the latest changes (if using git)
git pull origin main

# Or manually update the backend/src/app.js file with the new CORS configuration

# Restart your backend server
pm2 restart tabi-api
# OR
npm restart
# OR
node server.js
```

### **2. Environment Variables**
Make sure your backend has the correct environment variable:
```bash
# In your backend .env file
FRONTEND_URL=https://tabi.mn
```

### **3. Verify the Fix**
After deployment, test these endpoints:
- `https://api.tabi.mn/api/queue/my-queue`
- `https://api.tabi.mn/api/subscription/current`
- `https://api.tabi.mn/api/lines/my-lines`

## 🔍 **Debugging CORS Issues**

### **Check Server Logs**
The new configuration logs blocked origins:
```bash
# Check your server logs for:
CORS blocked origin: https://some-domain.com
```

### **Test CORS Manually**
```bash
# Test preflight request
curl -X OPTIONS https://api.tabi.mn/api/queue/my-queue \
  -H "Origin: https://tabi.mn" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Authorization" \
  -v

# Should return:
# Access-Control-Allow-Origin: https://tabi.mn
# Access-Control-Allow-Methods: GET,POST,PUT,DELETE,PATCH,OPTIONS
# Access-Control-Allow-Headers: Content-Type,Authorization,X-Requested-With
```

## 🛡️ **Security Considerations**

### **Allowed Origins**
Currently allows:
- `https://tabi.mn` (your main domain)
- `https://www.tabi.mn` (www subdomain)
- `http://localhost:3000` (development)
- `http://localhost:3001` (development)
- Any domain set in `FRONTEND_URL` environment variable

### **Production Security**
For maximum security in production, you can:
1. Remove localhost origins
2. Only allow your specific domains
3. Set `FRONTEND_URL` to your exact domain

## 🚨 **Common CORS Issues**

### **1. Subdomain Issues**
If you use subdomains, add them to `allowedOrigins`:
```javascript
const allowedOrigins = [
  'https://tabi.mn',
  'https://www.tabi.mn',
  'https://app.tabi.mn',  // Add subdomains
  'https://admin.tabi.mn'
];
```

### **2. HTTPS vs HTTP**
Make sure your origins match exactly:
- ❌ `http://tabi.mn` vs `https://tabi.mn`
- ✅ Both must be the same protocol

### **3. Port Numbers**
Include port numbers if needed:
```javascript
'https://tabi.mn:8080'  // If using custom port
```

## ✅ **Expected Result**

After deploying this fix:
- ✅ Frontend can successfully call API endpoints
- ✅ Subscription system works properly
- ✅ Queue management functions correctly
- ✅ All AJAX requests succeed
- ✅ No more CORS errors in browser console

## 📞 **If Issues Persist**

1. **Check server logs** for CORS blocked messages
2. **Verify domain spelling** in allowedOrigins array
3. **Confirm HTTPS/HTTP** protocol matches
4. **Test with curl** to isolate the issue
5. **Check browser network tab** for exact error details

The CORS configuration is now production-ready and should resolve all cross-origin request issues!
