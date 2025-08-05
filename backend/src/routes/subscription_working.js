const express = require('express');
const router = express.Router();

// Temporary working subscription routes - no controller dependencies
router.get('/plans', (req, res) => {
  res.json({
    success: true,
    plans: {
      free: {
        name: 'Free',
        price: 0,
        currency: 'MNT',
        features: ['1 queue', '50 customers/month']
      },
      basic: {
        name: 'Basic',
        price: 69000,
        currency: 'MNT',
        features: ['5 queues', '500 customers/month', 'SMS notifications']
      },
      pro: {
        name: 'Pro',
        price: 150000,
        currency: 'MNT',
        features: ['Unlimited queues', '5000 customers/month', 'All features']
      },
      enterprise: {
        name: 'Enterprise',
        price: 290000,
        currency: 'MNT',
        features: ['Everything unlimited', 'Priority support']
      }
    }
  });
});

router.get('/current', (req, res) => {
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
      }
    }
  });
});

router.post('/upgrade', (req, res) => {
  res.json({
    success: true,
    message: 'Upgrade request received. Subscription system is temporarily in maintenance mode.'
  });
});

router.post('/cancel', (req, res) => {
  res.json({
    success: true,
    message: 'Cancellation request received.'
  });
});

router.get('/usage', (req, res) => {
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
      plan: 'free'
    }
  });
});

router.get('/check/:action', (req, res) => {
  res.json({
    success: true,
    canPerform: true,
    message: 'Action allowed'
  });
});

router.get('/admin/all', (req, res) => {
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
});

router.post('/admin/:subscriptionId/approve', (req, res) => {
  res.json({
    success: true,
    message: 'Subscription approved'
  });
});

module.exports = router;
