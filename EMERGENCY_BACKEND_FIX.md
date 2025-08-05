# 🚨 EMERGENCY BACKEND FIX - Immediate Action Required

## **The Issue**
Your backend is still crashing because the subscription controller file hasn't been updated on your server. The error persists at line 19 of `/home/bitnami/src/routes/subscription.js`.

## **IMMEDIATE TEMPORARY FIX**

### **Step 1: Disable Subscription Routes Temporarily**
Edit `/home/bitnami/src/app.js` and comment out the subscription route:

```javascript
// API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/lines', require('./routes/lines'));
app.use('/api/queue', require('./routes/queue'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/google-calendar', require('./routes/googleCalendar'));
// app.use('/api/subscription', require('./routes/subscription')); // TEMPORARILY DISABLED
```

### **Step 2: Restart Backend**
```bash
pm2 restart backend
```

### **Step 3: Verify Backend Starts**
```bash
pm2 logs backend --lines 5
```

You should see:
```
✅ Server running on port 5000
✅ Connected to MongoDB
```

## **PERMANENT FIX - After Backend is Running**

### **Step 1: Update Subscription Controller**
Replace `/home/bitnami/src/controllers/subscriptionController.js` with this corrected version:

```javascript
const Subscription = require('../models/Subscription');
const User = require('../models/User');
const Line = require('../models/Line');

// Get subscription plans
const getPlans = async (req, res) => {
  try {
    const plans = Subscription.PLAN_CONFIGS;
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
    const userId = req.userId; // FIXED: was req.user.userId
    
    let subscription = await Subscription.findOne({ userId }).populate('userId', 'name email phone');
    
    // Create default subscription if none exists
    if (!subscription) {
      subscription = new Subscription({
        userId,
        plan: 'free'
      });
      await subscription.save();
      await subscription.populate('userId', 'name email phone');
    }
    
    // Reset monthly usage if needed
    subscription.resetMonthlyUsage();
    await subscription.save();
    
    // Get plan config
    const planConfig = Subscription.PLAN_CONFIGS[subscription.plan];
    
    res.json({
      success: true,
      subscription: {
        ...subscription.toObject(),
        planConfig
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

// Request plan upgrade
const requestUpgrade = async (req, res) => {
  try {
    const userId = req.userId; // FIXED: was req.user.userId
    const { plan, paymentMethod, bankTransactionId } = req.body;
    
    // Validate plan
    if (!['basic', 'pro', 'enterprise'].includes(plan)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid subscription plan'
      });
    }
    
    // Validate payment method
    if (!['bank_transfer', 'card', 'qpay', 'cash'].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment method'
      });
    }
    
    let subscription = await Subscription.findOne({ userId });
    
    if (!subscription) {
      subscription = new Subscription({
        userId,
        plan: 'free'
      });
    }
    
    // Update subscription request
    subscription.metadata.upgradeRequested = true;
    subscription.metadata.requestedPlan = plan;
    subscription.paymentMethod = paymentMethod;
    
    if (bankTransactionId) {
      subscription.bankTransactionId = bankTransactionId;
    }
    
    subscription.metadata.notes = `Upgrade requested from ${subscription.plan} to ${plan} via ${paymentMethod}`;
    
    await subscription.save();
    
    res.json({
      success: true,
      message: 'Upgrade request submitted successfully. We will review and activate your subscription within 24 hours.',
      subscription
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
    const { subscriptionId } = req.params;
    const { approved, notes } = req.body;
    
    const subscription = await Subscription.findById(subscriptionId);
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }
    
    if (approved) {
      // Approve the upgrade
      subscription.plan = subscription.metadata.requestedPlan;
      subscription.status = 'active';
      subscription.lastPaymentDate = new Date();
      subscription.currentPeriodStart = new Date();
      
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      subscription.currentPeriodEnd = nextMonth;
      subscription.nextPaymentDate = nextMonth;
      
      subscription.metadata.upgradeRequested = false;
      subscription.metadata.requestedPlan = null;
      subscription.metadata.notes = notes || 'Subscription approved and activated';
      
      // Update limits based on new plan
      subscription.updateLimitsFromPlan();
    } else {
      // Reject the upgrade
      subscription.metadata.upgradeRequested = false;
      subscription.metadata.requestedPlan = null;
      subscription.metadata.notes = notes || 'Upgrade request rejected';
    }
    
    await subscription.save();
    
    res.json({
      success: true,
      message: approved ? 'Subscription upgrade approved' : 'Subscription upgrade rejected',
      subscription
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
    const userId = req.userId; // FIXED: was req.user.userId
    const { cancelAtPeriodEnd = true } = req.body;
    
    const subscription = await Subscription.findOne({ userId });
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }
    
    if (cancelAtPeriodEnd) {
      subscription.cancelAtPeriodEnd = true;
      subscription.metadata.notes = 'Subscription will be cancelled at the end of current period';
    } else {
      subscription.status = 'cancelled';
      subscription.plan = 'free';
      subscription.updateLimitsFromPlan();
      subscription.metadata.notes = 'Subscription cancelled immediately';
    }
    
    await subscription.save();
    
    res.json({
      success: true,
      message: cancelAtPeriodEnd ? 
        'Subscription will be cancelled at the end of your current billing period' : 
        'Subscription cancelled successfully',
      subscription
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
    const userId = req.userId; // FIXED: was req.user.userId
    
    const subscription = await Subscription.findOne({ userId });
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }
    
    // Get actual usage from database
    const queuesCount = await Line.countDocuments({ createdBy: userId });
    
    // Update subscription usage
    subscription.usage.queuesUsed = queuesCount;
    await subscription.save();
    
    const planConfig = Subscription.PLAN_CONFIGS[subscription.plan];
    
    res.json({
      success: true,
      usage: {
        current: subscription.usage,
        limits: subscription.limits,
        plan: subscription.plan,
        planConfig,
        percentages: {
          queues: subscription.limits.maxQueues === -1 ? 0 : 
            Math.round((subscription.usage.queuesUsed / subscription.limits.maxQueues) * 100),
          customers: subscription.limits.maxCustomersPerMonth === -1 ? 0 : 
            Math.round((subscription.usage.customersThisMonth / subscription.limits.maxCustomersPerMonth) * 100)
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
    const userId = req.userId; // FIXED: was req.user.userId
    const { action } = req.params; // 'create_queue', 'add_customer', etc.
    
    const subscription = await Subscription.findOne({ userId });
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }
    
    let canPerform = false;
    let message = '';
    
    switch (action) {
      case 'create_queue':
        canPerform = subscription.canCreateQueue();
        message = canPerform ? 
          'You can create a new queue' : 
          `You've reached your queue limit (${subscription.limits.maxQueues}). Please upgrade your plan.`;
        break;
      case 'add_customer':
        canPerform = subscription.canAddCustomer();
        message = canPerform ? 
          'You can add a new customer' : 
          `You've reached your monthly customer limit (${subscription.limits.maxCustomersPerMonth}). Please upgrade your plan.`;
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid action'
        });
    }
    
    res.json({
      success: true,
      canPerform,
      message,
      usage: subscription.usage,
      limits: subscription.limits
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
    const { page = 1, limit = 20, status, plan } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (plan) filter.plan = plan;
    
    const subscriptions = await Subscription.find(filter)
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Subscription.countDocuments(filter);
    
    res.json({
      success: true,
      subscriptions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
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
    const subscription = await Subscription.findOne({ userId });
    if (!subscription) return;
    
    subscription.resetMonthlyUsage();
    
    switch (type) {
      case 'customer':
        subscription.usage.customersThisMonth += increment;
        break;
      case 'appointment':
        subscription.usage.appointmentsThisMonth += increment;
        break;
      case 'queue':
        subscription.usage.queuesUsed += increment;
        break;
    }
    
    await subscription.save();
  } catch (error) {
    console.error('Error updating usage:', error);
  }
};

module.exports = {
  getPlans,
  getCurrentSubscription,
  requestUpgrade,
  approveUpgrade,
  cancelSubscription,
  getUsageStats,
  checkLimits,
  getAllSubscriptions,
  updateUsage
};
```

### **Step 2: Re-enable Subscription Routes**
Edit `/home/bitnami/src/app.js` and uncomment the subscription route:

```javascript
app.use('/api/subscription', require('./routes/subscription')); // RE-ENABLED
```

### **Step 3: Restart Backend**
```bash
pm2 restart backend
```

## **Priority Actions**

1. **FIRST:** Disable subscription routes to stop crashes
2. **SECOND:** Update subscription controller file
3. **THIRD:** Re-enable subscription routes
4. **FOURTH:** Test that backend starts without errors

This will get your backend running immediately, then properly fix the subscription system!
