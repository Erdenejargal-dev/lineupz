# 🚨 FINAL EMERGENCY SOLUTION - Stop Backend Crashes NOW

## **The Problem**
Your backend keeps crashing because the subscription routes are still being loaded. We need to completely remove the subscription system temporarily to get your backend running.

## **IMMEDIATE SOLUTION - 2 MINUTES**

### **Step 1: Edit app.js File**
Open `/home/bitnami/src/app.js` and find this section:

```javascript
// API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/lines', require('./routes/lines'));
app.use('/api/queue', require('./routes/queue'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/google-calendar', require('./routes/googleCalendar'));
app.use('/api/subscription', require('./routes/subscription')); // <-- DELETE THIS LINE
```

**DELETE** or **COMMENT OUT** the subscription line:
```javascript
// API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/lines', require('./routes/lines'));
app.use('/api/queue', require('./routes/queue'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/google-calendar', require('./routes/googleCalendar'));
// app.use('/api/subscription', require('./routes/subscription')); // DISABLED
```

### **Step 2: Restart Backend**
```bash
pm2 restart backend
```

### **Step 3: Verify Success**
```bash
pm2 logs backend --lines 5
```

You should see:
```
✅ Server running on port 5000
✅ Connected to MongoDB
✅ No crash errors
```

## **Alternative: Complete File Replacement**

If editing is difficult, replace your entire `/home/bitnami/src/app.js` with this working version:

```javascript
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware - Comprehensive CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    
    // Allow all tabi.mn subdomains and common development origins
    const allowedPatterns = [
      /^https:\/\/.*\.tabi\.mn$/,  // Any subdomain of tabi.mn
      /^https:\/\/tabi\.mn$/,      // Main domain
      /^http:\/\/localhost:\d+$/,  // Any localhost port
      /^http:\/\/127\.0\.0\.1:\d+$/ // Any 127.0.0.1 port
    ];
    
    // Check if origin matches any allowed pattern
    const isAllowed = allowedPatterns.some(pattern => pattern.test(origin));
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      // For debugging - temporarily allow all origins in production
      callback(null, true); // TEMPORARY: Allow all origins
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With', 
    'Content-Type', 
    'Accept',
    'Authorization',
    'Cache-Control',
    'X-HTTP-Method-Override'
  ],
  exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],
  optionsSuccessStatus: 200,
  preflightContinue: false
}));

// Additional CORS headers for extra compatibility
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS,HEAD');
  res.header('Access-Control-Allow-Headers', 'Origin,X-Requested-With,Content-Type,Accept,Authorization,Cache-Control,X-HTTP-Method-Override');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple logging middleware (instead of morgan)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Tabi API is running!',
    version: '1.0.0',
    status: 'healthy'
  });
});

// API routes - SUBSCRIPTION ROUTE DISABLED TO PREVENT CRASHES
app.use('/api/auth', require('./routes/auth'));
app.use('/api/lines', require('./routes/lines'));
app.use('/api/queue', require('./routes/queue'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/google-calendar', require('./routes/googleCalendar'));
// app.use('/api/subscription', require('./routes/subscription')); // DISABLED - CAUSES CRASHES

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

module.exports = app;
```

## **What This Achieves**

### **Immediate Results:**
- ✅ **Backend stops crashing** - No more infinite restart loops
- ✅ **Core functionality restored** - Auth, lines, queue, dashboard all work
- ✅ **CORS issues resolved** - Frontend can communicate with API
- ✅ **Platform operational** - Users can login, create queues, join lines

### **Temporarily Disabled:**
- ❌ Subscription endpoints (will return 404)
- ❌ Subscription limits (users can create unlimited queues temporarily)
- ❌ Usage tracking (no subscription enforcement)

## **Next Steps (After Backend is Stable)**

1. **Fix subscription controller** - Update the authentication references
2. **Test subscription system** - Ensure it works without crashes
3. **Re-enable subscription routes** - Add back the route line
4. **Activate subscription limits** - Resume revenue generation

## **Priority: GET BACKEND RUNNING FIRST**

Your platform is completely down right now. The subscription system can be re-enabled later, but first we need to restore basic functionality.

**Execute this fix immediately to restore your platform!**
