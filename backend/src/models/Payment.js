const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  // Payment identification
  bylInvoiceId: {
    type: String,
    sparse: true // Allow null but unique when present
  },
  bylCheckoutId: {
    type: String,
    sparse: true // Allow null but unique when present
  },
  
  // Payment details
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'MNT'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['qpay', 'card', 'bank_transfer', 'cash'],
    default: 'qpay'
  },
  
  // Reference to what this payment is for
  paymentType: {
    type: String,
    enum: ['subscription', 'appointment', 'service', 'other'],
    required: true
  },
  referenceId: {
    type: String, // Can be subscription ID, appointment ID, etc.
    required: true
  },
  
  // Customer information
  customerEmail: String,
  customerPhone: String,
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // BYL specific data
  bylData: {
    invoiceNumber: String,
    invoiceUrl: String,
    checkoutUrl: String,
    dueDate: Date,
    paidAt: Date,
    bylProjectId: String
  },
  
  // Additional metadata
  description: String,
  metadata: {
    type: Map,
    of: String
  },
  
  // Webhook tracking
  webhookReceived: {
    type: Boolean,
    default: false
  },
  webhookData: {
    type: mongoose.Schema.Types.Mixed
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date,
  cancelledAt: Date
});

// Indexes for better query performance
paymentSchema.index({ bylInvoiceId: 1 });
paymentSchema.index({ bylCheckoutId: 1 });
paymentSchema.index({ referenceId: 1, paymentType: 1 });
paymentSchema.index({ customerId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ createdAt: -1 });

// Update the updatedAt field before saving
paymentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Instance methods
paymentSchema.methods.markAsCompleted = function(webhookData = null) {
  this.status = 'completed';
  this.completedAt = new Date();
  this.webhookReceived = true;
  if (webhookData) {
    this.webhookData = webhookData;
    if (webhookData.paidAt) {
      this.bylData.paidAt = new Date(webhookData.paidAt);
    }
  }
  return this.save();
};

paymentSchema.methods.markAsFailed = function(reason = null) {
  this.status = 'failed';
  if (reason) {
    this.metadata = this.metadata || new Map();
    this.metadata.set('failureReason', reason);
  }
  return this.save();
};

paymentSchema.methods.markAsCancelled = function() {
  this.status = 'cancelled';
  this.cancelledAt = new Date();
  return this.save();
};

// Static methods
paymentSchema.statics.findByBylInvoiceId = function(invoiceId) {
  return this.findOne({ bylInvoiceId: invoiceId });
};

paymentSchema.statics.findByBylCheckoutId = function(checkoutId) {
  return this.findOne({ bylCheckoutId: checkoutId });
};

paymentSchema.statics.findByReference = function(paymentType, referenceId) {
  return this.find({ paymentType, referenceId });
};

paymentSchema.statics.getPaymentStats = function(startDate, endDate) {
  const matchStage = {
    createdAt: {
      $gte: startDate,
      $lte: endDate
    }
  };

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }
    }
  ]);
};

// Virtual for formatted amount
paymentSchema.virtual('formattedAmount').get(function() {
  return new Intl.NumberFormat('mn-MN', {
    style: 'currency',
    currency: this.currency || 'MNT'
  }).format(this.amount);
});

// Ensure virtual fields are serialized
paymentSchema.set('toJSON', { virtuals: true });
paymentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Payment', paymentSchema);
