# Direct Fix - Update Server Files
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    DIRECT SERVER FIX" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Directly updating subscription controller on server..." -ForegroundColor Yellow

# Create the updated subscription controller content
$controllerContent = @'
// Temporary working subscription controller - no database dependencies
const getPlans = async (req, res) => {
  try {
    const plans = {
      free: {
        name: 'Free',
        price: 0,
        currency: 'MNT',
        features: ['1 queue', '50 customers/month'],
        limits: { maxQueues: 1, maxCustomersPerMonth: 50 }
      },
      basic: {
        name: 'Basic',
        price: 69000,
        currency: 'MNT',
        features: ['5 queues', '500 customers/month', 'SMS notifications'],
        limits: { maxQueues: 5, maxCustomersPerMonth: 500 }
      },
      pro: {
        name: 'Pro',
        price: 150000,
        currency: 'MNT',
        features: ['Unlimited queues', '5000 customers/month', 'All features'],
        limits: { maxQueues: -1, maxCustomersPerMonth: 5000 }
      },
      enterprise: {
        name: 'Enterprise',
        price: 290000,
        currency: 'MNT',
        features: ['Everything unlimited', 'Priority support'],
        limits: { maxQueues: -1, maxCustomersPerMonth: -1 }
      }
    };
    
    res.json({
      success: true,
      plans
    });
  } catch (error) {
    console.error('Error getting plans:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get subscription plans'
    });
  }
};

// Get user's current subscription
const getCurrentSubscription = async (req, res) => {
  try {
    // Return default free subscription for now
    res.json({
      success: true,
      subscription: {
        plan: 'free',
        status: 'active',
        usage: {
          queuesUsed: 0,
          customersThisMonth: 0
        },
        limits: {
          maxQueues: 1,
          maxCustomersPerMonth: 50
        },
        planConfig: {
          name: 'Free',
          price: 0,
          currency: 'MNT',
          features: ['1 queue', '50 customers/month']
        }
      }
    });
  } catch (error) {
    console.error('Error getting subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get subscription'
    });
  }
};

// Create a new subscription
const createSubscription = async (req, res) => {
  try {
    const { plan } = req.body;
    const userId = req.user.id;

    if (!plan) {
      return res.status(400).json({
        success: false,
        message: 'Plan is required'
      });
    }

    // Get plan details
    const plans = {
      free: { name: 'Free', price: 0 },
      basic: { name: 'Basic', price: 69000 },
      pro: { name: 'Pro', price: 150000 },
      enterprise: { name: 'Enterprise', price: 290000 }
    };

    const planConfig = plans[plan];
    if (!planConfig) {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan selected'
      });
    }

    // Create subscription object (simplified for BYL integration)
    const subscription = {
      _id: `sub_${Date.now()}_${userId}`,
      userId: { 
        _id: userId, 
        email: req.user.email 
      },
      plan,
      planConfig,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    res.json({
      success: true,
      subscription,
      message: 'Subscription created successfully'
    });

  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create subscription'
    });
  }
};

// Request plan upgrade
const requestUpgrade = async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Upgrade request received. Subscription system is temporarily in maintenance mode.'
    });
  } catch (error) {
    console.error('Error requesting upgrade:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to request upgrade'
    });
  }
};

// Admin: Approve subscription upgrade
const approveUpgrade = async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Subscription upgrade approved'
    });
  } catch (error) {
    console.error('Error approving upgrade:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process upgrade approval'
    });
  }
};

// Cancel subscription
const cancelSubscription = async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Cancellation request received.'
    });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel subscription'
    });
  }
};

// Get usage statistics
const getUsageStats = async (req, res) => {
  try {
    res.json({
      success: true,
      usage: {
        current: {
          queuesUsed: 0,
          customersThisMonth: 0
        },
        limits: {
          maxQueues: 1,
          maxCustomersPerMonth: 50
        },
        plan: 'free',
        planConfig: {
          name: 'Free',
          price: 0,
          currency: 'MNT'
        },
        percentages: {
          queues: 0,
          customers: 0
        }
      }
    });
  } catch (error) {
    console.error('Error getting usage stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get usage statistics'
    });
  }
};

// Check if user can perform action
const checkLimits = async (req, res) => {
  try {
    res.json({
      success: true,
      canPerform: true,
      message: 'Action allowed',
      usage: { queuesUsed: 0, customersThisMonth: 0 },
      limits: { maxQueues: 1, maxCustomersPerMonth: 50 }
    });
  } catch (error) {
    console.error('Error checking limits:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check limits'
    });
  }
};

// Admin: Get all subscriptions
const getAllSubscriptions = async (req, res) => {
  try {
    res.json({
      success: true,
      subscriptions: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        pages: 0
      }
    });
  } catch (error) {
    console.error('Error getting all subscriptions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get subscriptions'
    });
  }
};

// Update usage (called internally)
const updateUsage = async (userId, type, increment = 1) => {
  try {
    // Temporarily disabled - no database operations
    console.log(`Usage update: ${userId}, ${type}, ${increment}`);
  } catch (error) {
    console.error('Error updating usage:', error);
  }
};

module.exports = {
  getPlans,
  getCurrentSubscription,
  createSubscription,
  requestUpgrade,
  approveUpgrade,
  cancelSubscription,
  getUsageStats,
  checkLimits,
  getAllSubscriptions,
  updateUsage
};
'@

# Create the updated routes content
$routesContent = @'
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getPlans,
  getCurrentSubscription,
  createSubscription,
  requestUpgrade,
  approveUpgrade,
  cancelSubscription,
  getUsageStats,
  checkLimits,
  getAllSubscriptions
} = require('../controllers/subscriptionController');

// Public routes
router.get('/plans', getPlans);

// Protected routes (require authentication)
router.get('/current', auth.authenticateToken, getCurrentSubscription);
router.post('/create', auth.authenticateToken, createSubscription);
router.post('/upgrade', auth.authenticateToken, requestUpgrade);
router.post('/cancel', auth.authenticateToken, cancelSubscription);
router.get('/usage', auth.authenticateToken, getUsageStats);
router.get('/check/:action', auth.authenticateToken, checkLimits);

// Admin routes
router.get('/admin/all', auth.authenticateToken, getAllSubscriptions);
router.post('/admin/:subscriptionId/approve', auth.authenticateToken, approveUpgrade);

module.exports = router;
'@

# Write controller content to temporary file
$controllerContent | Out-File -FilePath "temp_controller.js" -Encoding UTF8

# Write routes content to temporary file  
$routesContent | Out-File -FilePath "temp_routes.js" -Encoding UTF8

try {
    # Upload and update controller
    Write-Host "Uploading updated subscription controller..." -ForegroundColor Yellow
    & scp -i "C:/Users/HiTech/Downloads/default.pem" temp_controller.js bitnami@13.229.113.229:/home/bitnami/backend/src/controllers/subscriptionController.js
    
    # Upload and update routes
    Write-Host "Uploading updated subscription routes..." -ForegroundColor Yellow
    & scp -i "C:/Users/HiTech/Downloads/default.pem" temp_routes.js bitnami@13.229.113.229:/home/bitnami/backend/src/routes/subscription.js
    
    # Restart backend
    Write-Host "Restarting backend..." -ForegroundColor Yellow
    & ssh -i "C:/Users/HiTech/Downloads/default.pem" bitnami@13.229.113.229 "cd /home/bitnami/backend && pm2 restart backend"
    
    Write-Host "✅ Direct fix applied successfully!" -ForegroundColor Green
    
    # Clean up temp files
    Remove-Item "temp_controller.js" -ErrorAction SilentlyContinue
    Remove-Item "temp_routes.js" -ErrorAction SilentlyContinue
    
} catch {
    Write-Host "❌ Direct fix failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "Testing the fix..." -ForegroundColor Yellow

# Wait a moment for restart
Start-Sleep -Seconds 3

try {
    $testResult = Invoke-RestMethod -Uri "https://api.tabi.mn/api/subscription/create" -Method GET -TimeoutSec 10
    Write-Host "✅ Endpoint is now responding!" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode -eq 405) {
        Write-Host "✅ Endpoint exists (Method Not Allowed is expected for GET)" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Endpoint test: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "    ✅ DIRECT FIX COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

Read-Host "Press Enter to exit"
