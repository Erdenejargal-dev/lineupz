const Payment = require('../models/Payment');
const Subscription = require('../models/Subscription');
const Appointment = require('../models/Appointment');
const bylService = require('../services/bylService');

class PaymentController {
  // Create a payment for subscription
  async createSubscriptionPayment(req, res) {
    try {
      const { subscriptionId, planName, amount, customerEmail } = req.body;
      const userId = req.user?.id;

      // Validate required fields
      if (!subscriptionId || !planName || !amount) {
        return res.status(400).json({
          error: 'Missing required fields: subscriptionId, planName, amount'
        });
      }

      // Check if subscription exists
      const subscription = await Subscription.findById(subscriptionId);
      if (!subscription) {
        return res.status(404).json({ error: 'Subscription not found' });
      }

      // Create payment record
      const payment = new Payment({
        amount: bylService.formatAmount(amount),
        paymentType: 'subscription',
        referenceId: subscriptionId,
        customerEmail: customerEmail || req.user?.email,
        customerId: userId,
        description: `Subscription payment for ${planName}`,
        metadata: new Map([
          ['planName', planName],
          ['subscriptionId', subscriptionId]
        ])
      });

      await payment.save();

      // Create BYL checkout
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const { successUrl, cancelUrl } = bylService.createUrls(frontendUrl, 'subscription', payment._id);

      const bylResponse = await bylService.createSubscriptionCheckout({
        planName,
        amount: payment.amount,
        customerEmail: payment.customerEmail,
        clientReferenceId: payment._id.toString(),
        successUrl,
        cancelUrl
      });

      // Update payment with BYL data - handle response structure
      const checkoutData = bylResponse.data || bylResponse;
      payment.bylCheckoutId = checkoutData.id;
      payment.bylData = {
        checkoutUrl: checkoutData.url,
        bylProjectId: process.env.BYL_PROJECT_ID
      };
      await payment.save();

      res.json({
        success: true,
        payment: {
          id: payment._id,
          amount: payment.amount,
          status: payment.status,
          checkoutUrl: checkoutData.url
        }
      });

    } catch (error) {
      console.error('Create subscription payment error:', error);
      res.status(500).json({ error: 'Failed to create subscription payment' });
    }
  }

  // Create a payment for appointment
  async createAppointmentPayment(req, res) {
    try {
      const { appointmentId, serviceName, amount, customerEmail } = req.body;
      const userId = req.user?.id;

      // Validate required fields
      if (!appointmentId || !serviceName || !amount) {
        return res.status(400).json({
          error: 'Missing required fields: appointmentId, serviceName, amount'
        });
      }

      // Check if appointment exists
      const appointment = await Appointment.findById(appointmentId);
      if (!appointment) {
        return res.status(404).json({ error: 'Appointment not found' });
      }

      // Create payment record
      const payment = new Payment({
        amount: bylService.formatAmount(amount),
        paymentType: 'appointment',
        referenceId: appointmentId,
        customerEmail: customerEmail || req.user?.email,
        customerId: userId,
        description: `Appointment payment for ${serviceName}`,
        metadata: new Map([
          ['serviceName', serviceName],
          ['appointmentId', appointmentId]
        ])
      });

      await payment.save();

      // Create BYL checkout
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const { successUrl, cancelUrl } = bylService.createUrls(frontendUrl, 'appointment', payment._id);

      const bylResponse = await bylService.createAppointmentCheckout({
        appointmentId,
        serviceName,
        amount: payment.amount,
        customerEmail: payment.customerEmail,
        successUrl,
        cancelUrl
      });

      // Update payment with BYL data - handle response structure
      const checkoutData = bylResponse.data || bylResponse;
      payment.bylCheckoutId = checkoutData.id;
      payment.bylData = {
        checkoutUrl: checkoutData.url,
        bylProjectId: process.env.BYL_PROJECT_ID
      };
      await payment.save();

      res.json({
        success: true,
        payment: {
          id: payment._id,
          amount: payment.amount,
          status: payment.status,
          checkoutUrl: checkoutData.url
        }
      });

    } catch (error) {
      console.error('Create appointment payment error:', error);
      res.status(500).json({ error: 'Failed to create appointment payment' });
    }
  }

  // Create a simple invoice
  async createInvoice(req, res) {
    try {
      const { amount, description, customerEmail, paymentType = 'other', referenceId } = req.body;
      const userId = req.user?.id;

      // Validate required fields
      if (!amount || !description) {
        return res.status(400).json({
          error: 'Missing required fields: amount, description'
        });
      }

      // Create payment record
      const payment = new Payment({
        amount: bylService.formatAmount(amount),
        paymentType,
        referenceId: referenceId || 'manual',
        customerEmail: customerEmail || req.user?.email,
        customerId: userId,
        description
      });

      await payment.save();

      // Create BYL invoice
      const bylResponse = await bylService.createInvoice({
        amount: payment.amount,
        description: payment.description,
        autoAdvance: true
      });

      // Update payment with BYL data - handle response structure
      const invoiceData = bylResponse.data || bylResponse;
      payment.bylInvoiceId = invoiceData.id;
      payment.bylData = {
        invoiceNumber: invoiceData.number,
        invoiceUrl: invoiceData.url,
        dueDate: new Date(invoiceData.due_date),
        bylProjectId: process.env.BYL_PROJECT_ID
      };
      await payment.save();

      res.json({
        success: true,
        payment: {
          id: payment._id,
          amount: payment.amount,
          status: payment.status,
          invoiceUrl: invoiceData.url,
          invoiceNumber: invoiceData.number
        }
      });

    } catch (error) {
      console.error('Create invoice error:', error);
      res.status(500).json({ error: 'Failed to create invoice' });
    }
  }

  // Get payment details
  async getPayment(req, res) {
    try {
      const { paymentId } = req.params;
      const userId = req.user?.id;

      const payment = await Payment.findById(paymentId).populate('customerId', 'name email');
      
      if (!payment) {
        return res.status(404).json({ error: 'Payment not found' });
      }

      // Check if user has access to this payment
      if (payment.customerId && payment.customerId._id.toString() !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      res.json({
        success: true,
        payment
      });

    } catch (error) {
      console.error('Get payment error:', error);
      res.status(500).json({ error: 'Failed to get payment' });
    }
  }

  // Get user's payments
  async getUserPayments(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 10, status, paymentType } = req.query;

      const query = { customerId: userId };
      if (status) query.status = status;
      if (paymentType) query.paymentType = paymentType;

      const payments = await Payment.find(query)
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .populate('customerId', 'name email');

      const total = await Payment.countDocuments(query);

      res.json({
        success: true,
        payments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });

    } catch (error) {
      console.error('Get user payments error:', error);
      res.status(500).json({ error: 'Failed to get payments' });
    }
  }

  // Handle BYL webhook
  async handleWebhook(req, res) {
    try {
      const signature = req.headers['byl-signature'];
      const payload = JSON.stringify(req.body);

      // Verify webhook signature
      if (!bylService.verifyWebhookSignature(payload, signature)) {
        console.error('Invalid webhook signature');
        return res.status(400).json({ error: 'Invalid signature' });
      }

      const event = req.body;
      console.log('BYL Webhook received:', event.type, event.id);

      const processedEvent = bylService.processWebhookEvent(event);
      
      if (!processedEvent) {
        return res.status(200).json({ received: true });
      }

      // Handle different event types
      switch (processedEvent.type) {
        case 'invoice_paid':
          await this.handleInvoicePaid(processedEvent);
          break;
        case 'checkout_completed':
          await this.handleCheckoutCompleted(processedEvent);
          break;
        default:
          console.log(`Unhandled processed event type: ${processedEvent.type}`);
      }

      res.status(200).json({ received: true });

    } catch (error) {
      console.error('Webhook handling error:', error);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  }

  // Handle invoice paid webhook
  async handleInvoicePaid(eventData) {
    try {
      const payment = await Payment.findByBylInvoiceId(eventData.invoiceId);
      
      if (!payment) {
        console.error(`Payment not found for invoice ID: ${eventData.invoiceId}`);
        return;
      }

      await payment.markAsCompleted(eventData);
      console.log(`Payment ${payment._id} marked as completed via invoice`);

      // Handle post-payment actions based on payment type
      await this.handlePostPaymentActions(payment);

    } catch (error) {
      console.error('Handle invoice paid error:', error);
    }
  }

  // Handle checkout completed webhook
  async handleCheckoutCompleted(eventData) {
    try {
      const payment = await Payment.findByBylCheckoutId(eventData.checkoutId);
      
      if (!payment) {
        console.error(`Payment not found for checkout ID: ${eventData.checkoutId}`);
        return;
      }

      // Update payment with additional checkout data
      payment.customerPhone = eventData.phoneNumber;
      payment.paymentMethod = eventData.paymentMethod;
      
      await payment.markAsCompleted(eventData);
      console.log(`Payment ${payment._id} marked as completed via checkout`);

      // Handle post-payment actions based on payment type
      await this.handlePostPaymentActions(payment);

    } catch (error) {
      console.error('Handle checkout completed error:', error);
    }
  }

  // Handle actions after successful payment
  async handlePostPaymentActions(payment) {
    try {
      switch (payment.paymentType) {
        case 'subscription':
          await this.activateSubscription(payment);
          break;
        case 'appointment':
          await this.confirmAppointment(payment);
          break;
        default:
          console.log(`No post-payment action for type: ${payment.paymentType}`);
      }
    } catch (error) {
      console.error('Post-payment actions error:', error);
    }
  }

  // Activate subscription after payment
  async activateSubscription(payment) {
    try {
      const subscription = await Subscription.findById(payment.referenceId);
      if (subscription) {
        subscription.status = 'active';
        subscription.paidAt = new Date();
        await subscription.save();
        console.log(`Subscription ${subscription._id} activated`);
      }
    } catch (error) {
      console.error('Activate subscription error:', error);
    }
  }

  // Confirm appointment after payment
  async confirmAppointment(payment) {
    try {
      const appointment = await Appointment.findById(payment.referenceId);
      if (appointment) {
        appointment.paymentStatus = 'paid';
        appointment.status = 'confirmed';
        await appointment.save();
        console.log(`Appointment ${appointment._id} confirmed`);
      }
    } catch (error) {
      console.error('Confirm appointment error:', error);
    }
  }

  // Get payment statistics (admin only)
  async getPaymentStats(req, res) {
    try {
      const { startDate, endDate } = req.query;
      
      const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate) : new Date();

      const stats = await Payment.getPaymentStats(start, end);
      
      const totalPayments = await Payment.countDocuments({
        createdAt: { $gte: start, $lte: end }
      });

      const totalAmount = await Payment.aggregate([
        {
          $match: {
            createdAt: { $gte: start, $lte: end },
            status: 'completed'
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ]);

      res.json({
        success: true,
        stats: {
          byStatus: stats,
          totalPayments,
          totalAmount: totalAmount[0]?.total || 0,
          period: { start, end }
        }
      });

    } catch (error) {
      console.error('Get payment stats error:', error);
      res.status(500).json({ error: 'Failed to get payment statistics' });
    }
  }
}

module.exports = new PaymentController();
