const crypto = require('crypto');

// Use node-fetch for older Node.js versions, or built-in fetch for Node.js 18+
let fetch;
try {
  fetch = globalThis.fetch;
} catch (e) {
  fetch = require('node-fetch');
}

class BylService {
  constructor() {
    this.apiUrl = process.env.BYL_API_URL || 'https://byl.mn/api/v1';
    this.apiToken = process.env.BYL_API_TOKEN;
    this.projectId = process.env.BYL_PROJECT_ID;
    this.webhookSecret = process.env.BYL_WEBHOOK_SECRET;
  }

  // Helper method to make API requests
  async makeRequest(endpoint, method = 'GET', data = null) {
    // Validate credentials
    if (!this.apiToken || !this.projectId) {
      throw new Error('BYL API credentials not configured. Please check BYL_API_TOKEN and BYL_PROJECT_ID environment variables.');
    }

    const url = `${this.apiUrl}/projects/${this.projectId}${endpoint}`;
    
    const options = {
      method,
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data);
    }

    try {
      console.log('BYL API Request:', method, url, data ? 'Data provided' : 'No data');
      const response = await fetch(url, options);
      
      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        console.error('Failed to parse BYL API response as JSON:', parseError);
        const responseText = await response.text();
        console.error('Raw response:', responseText);
        throw new Error(`BYL API returned invalid JSON: ${response.status} - ${responseText}`);
      }
      
      console.log('BYL API Response:', response.status, result);
      
      if (!response.ok) {
        const errorMessage = result.message || result.error || JSON.stringify(result);
        throw new Error(`BYL API Error: ${response.status} - ${errorMessage}`);
      }
      
      return result;
    } catch (error) {
      console.error('BYL API Request failed:', error);
      throw error;
    }
  }

  // Create an invoice
  async createInvoice({ amount, description, autoAdvance = true }) {
    const data = {
      amount: Math.round(amount), // Ensure integer
      description,
      auto_advance: autoAdvance
    };

    return await this.makeRequest('/invoices', 'POST', data);
  }

  // Get invoice details
  async getInvoice(invoiceId) {
    return await this.makeRequest(`/invoices/${invoiceId}`, 'GET');
  }

  // Void an invoice
  async voidInvoice(invoiceId) {
    return await this.makeRequest(`/invoices/${invoiceId}/void`, 'POST');
  }

  // Delete an invoice
  async deleteInvoice(invoiceId) {
    return await this.makeRequest(`/invoices/${invoiceId}`, 'DELETE');
  }

  // Create a checkout session
  async createCheckout({
    items,
    successUrl,
    cancelUrl,
    customerEmail,
    clientReferenceId,
    phoneNumberCollection = true,
    deliveryAddressCollection = false,
    discounts = []
  }) {
    const data = {
      items,
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: customerEmail,
      client_reference_id: clientReferenceId,
      phone_number_collection: phoneNumberCollection,
      delivery_address_collection: deliveryAddressCollection
    };

    if (discounts.length > 0) {
      data.discounts = discounts;
    }

    return await this.makeRequest('/checkouts', 'POST', data);
  }

  // Get checkout details
  async getCheckout(checkoutId) {
    return await this.makeRequest(`/checkouts/${checkoutId}`, 'GET');
  }

  // Create checkout for subscription payment
  async createSubscriptionCheckout({
    planName,
    amount,
    customerEmail,
    clientReferenceId,
    successUrl,
    cancelUrl
  }) {
    const items = [{
      price_data: {
        unit_amount: Math.round(amount),
        product_data: {
          name: planName,
          client_reference_id: clientReferenceId
        }
      },
      quantity: 1
    }];

    return await this.createCheckout({
      items,
      successUrl,
      cancelUrl,
      customerEmail,
      clientReferenceId,
      phoneNumberCollection: true
    });
  }

  // Create checkout for appointment payment
  async createAppointmentCheckout({
    appointmentId,
    serviceName,
    amount,
    customerEmail,
    successUrl,
    cancelUrl
  }) {
    const items = [{
      price_data: {
        unit_amount: Math.round(amount),
        product_data: {
          name: `Appointment: ${serviceName}`,
          client_reference_id: appointmentId
        }
      },
      quantity: 1
    }];

    return await this.createCheckout({
      items,
      successUrl,
      cancelUrl,
      customerEmail,
      clientReferenceId: appointmentId,
      phoneNumberCollection: true
    });
  }

  // Verify webhook signature
  verifyWebhookSignature(payload, signature) {
    if (!this.webhookSecret) {
      console.warn('BYL webhook secret not configured');
      return false;
    }

    const computedSignature = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(payload)
      .digest('hex');

    return computedSignature === signature;
  }

  // Process webhook event
  processWebhookEvent(event) {
    const { type, data } = event;
    
    switch (type) {
      case 'invoice.paid':
        return this.handleInvoicePaid(data.object);
      case 'checkout.completed':
        return this.handleCheckoutCompleted(data.object);
      default:
        console.log(`Unhandled webhook event type: ${type}`);
        return null;
    }
  }

  // Handle invoice paid event
  handleInvoicePaid(invoice) {
    return {
      type: 'invoice_paid',
      invoiceId: invoice.id,
      amount: invoice.amount,
      status: invoice.status,
      description: invoice.description,
      projectId: invoice.project_id
    };
  }

  // Handle checkout completed event
  handleCheckoutCompleted(checkout) {
    return {
      type: 'checkout_completed',
      checkoutId: checkout.id,
      clientReferenceId: checkout.client_reference_id,
      amount: checkout.amount_total,
      customerEmail: checkout.customer_email,
      phoneNumber: checkout.phone_number,
      paymentMethod: checkout.payment_method,
      items: checkout.items,
      status: checkout.status
    };
  }

  // Helper method to format amount for BYL (convert to integer)
  formatAmount(amount) {
    return Math.round(parseFloat(amount));
  }

  // Helper method to create success/cancel URLs
  createUrls(baseUrl, type, referenceId) {
    return {
      successUrl: `${baseUrl}/payment/success?type=${type}&ref=${referenceId}`,
      cancelUrl: `${baseUrl}/payment/cancel?type=${type}&ref=${referenceId}`
    };
  }
}

module.exports = new BylService();
