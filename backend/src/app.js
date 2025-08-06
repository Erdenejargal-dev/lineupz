const express = require('express');
const cors = require('cors');

const app = express();

// Comprehensive CORS configuration
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

// API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/lines', require('./routes/lines'));
app.use('/api/queue', require('./routes/queue'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/google-calendar', require('./routes/googleCalendar'));
app.use('/api/subscription', require('./routes/subscription'));
app.use('/api/business', require('./routes/business'));
// Temporarily disabled reviews route due to loading issues
// app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/stats', require('./routes/stats'));

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
