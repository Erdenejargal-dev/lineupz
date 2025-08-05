const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  plan: {
    type: String,
    enum: ['free', 'basic', 'pro', 'enterprise'],
    default: 'free'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'cancelled', 'past_due', 'trialing'],
    default: 'active'
  },
  currentPeriodStart: {
    type: Date,
    default: Date.now
  },
  currentPeriodEnd: {
    type: Date,
    default: function() {
      const date = new Date();
      date.setMonth(date.getMonth() + 1);
      return date;
    }
  },
  cancelAtPeriodEnd: {
    type: Boolean,
    default: false
  },
  trialEnd: {
    type: Date,
    default: null
  },
  paymentMethod: {
    type: String,
    enum: ['bank_transfer', 'card', 'qpay', 'cash'],
    default: null
  },
  bankTransactionId: {
    type: String,
    default: null
  },
  lastPaymentDate: {
    type: Date,
    default: null
  },
  nextPaymentDate: {
    type: Date,
    default: function() {
      const date = new Date();
      date.setMonth(date.getMonth() + 1);
      return date;
    }
  },
  usage: {
    queuesUsed: {
      type: Number,
      default: 0
    },
    customersThisMonth: {
      type: Number,
      default: 0
    },
    appointmentsThisMonth: {
      type: Number,
      default: 0
    },
    lastResetDate: {
      type: Date,
      default: Date.now
    }
  },
  limits: {
    maxQueues: {
      type: Number,
      default: 1
    },
    maxCustomersPerMonth: {
      type: Number,
      default: 50
    },
    smsNotifications: {
      type: Boolean,
      default: false
    },
    emailNotifications: {
      type: Boolean,
      default: true
    },
    googleCalendarIntegration: {
      type: Boolean,
      default: false
    },
    analytics: {
      type: Boolean,
      default: false
    },
    prioritySupport: {
      type: Boolean,
      default: false
    },
    whiteLabel: {
      type: Boolean,
      default: false
    },
    apiAccess: {
      type: Boolean,
      default: false
    }
  },
  metadata: {
    upgradeRequested: {
      type: Boolean,
      default: false
    },
    requestedPlan: {
      type: String,
      default: null
    },
    notes: {
      type: String,
      default: ''
    }
  }
}, {
  timestamps: true
});

// Plan configurations
subscriptionSchema.statics.PLAN_CONFIGS = {
  free: {
    name: 'Free',
    price: 0,
    currency: 'MNT',
    limits: {
      maxQueues: 1,
      maxCustomersPerMonth: 50,
      smsNotifications: false,
      emailNotifications: true,
      googleCalendarIntegration: false,
      analytics: false,
      prioritySupport: false,
      whiteLabel: false,
      apiAccess: false
    },
    features: [
      '1 queue',
      '50 customers/month',
      'Basic email notifications',
      'Community support'
    ]
  },
  basic: {
    name: 'Basic',
    price: 69000,
    currency: 'MNT',
    limits: {
      maxQueues: 5,
      maxCustomersPerMonth: 500,
      smsNotifications: true,
      emailNotifications: true,
      googleCalendarIntegration: false,
      analytics: true,
      prioritySupport: false,
      whiteLabel: false,
      apiAccess: false
    },
    features: [
      '5 queues',
      '500 customers/month',
      'SMS & email notifications',
      'Basic analytics',
      'Email support'
    ]
  },
  pro: {
    name: 'Pro',
    price: 150000,
    currency: 'MNT',
    limits: {
      maxQueues: -1, // unlimited
      maxCustomersPerMonth: 5000,
      smsNotifications: true,
      emailNotifications: true,
      googleCalendarIntegration: true,
      analytics: true,
      prioritySupport: true,
      whiteLabel: false,
      apiAccess: false
    },
    features: [
      'Unlimited queues',
      '5,000 customers/month',
      'All notification types',
      'Advanced analytics',
      'Google Calendar integration',
      'Priority support'
    ]
  },
  enterprise: {
    name: 'Enterprise',
    price: 290000,
    currency: 'MNT',
    limits: {
      maxQueues: -1, // unlimited
      maxCustomersPerMonth: -1, // unlimited
      smsNotifications: true,
      emailNotifications: true,
      googleCalendarIntegration: true,
      analytics: true,
      prioritySupport: true,
      whiteLabel: true,
      apiAccess: true
    },
    features: [
      'Unlimited everything',
      'White-label options',
      'API access',
      'Custom integrations',
      'Dedicated support',
      'SLA guarantees'
    ]
  }
};

// Update limits based on plan
subscriptionSchema.methods.updateLimitsFromPlan = function() {
  const config = this.constructor.PLAN_CONFIGS[this.plan];
  if (config) {
    this.limits = { ...this.limits, ...config.limits };
  }
};

// Check if user can perform action
subscriptionSchema.methods.canCreateQueue = function() {
  if (this.limits.maxQueues === -1) return true;
  return this.usage.queuesUsed < this.limits.maxQueues;
};

subscriptionSchema.methods.canAddCustomer = function() {
  if (this.limits.maxCustomersPerMonth === -1) return true;
  return this.usage.customersThisMonth < this.limits.maxCustomersPerMonth;
};

// Reset monthly usage
subscriptionSchema.methods.resetMonthlyUsage = function() {
  const now = new Date();
  const lastReset = new Date(this.usage.lastResetDate);
  
  if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
    this.usage.customersThisMonth = 0;
    this.usage.appointmentsThisMonth = 0;
    this.usage.lastResetDate = now;
    return true;
  }
  return false;
};

// Pre-save middleware
subscriptionSchema.pre('save', function(next) {
  if (this.isModified('plan')) {
    this.updateLimitsFromPlan();
  }
  this.resetMonthlyUsage();
  next();
});

module.exports = mongoose.model('Subscription', subscriptionSchema);
