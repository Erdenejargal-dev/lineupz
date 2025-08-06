// Direct BYL API integration for frontend
class BylDirectService {
  constructor() {
    // These should be public/frontend-safe values
    this.apiUrl = 'https://byl.mn/api/v1';
    // Note: In production, you'd get these from your backend or environment
    this.projectId = process.env.NEXT_PUBLIC_BYL_PROJECT_ID || 'your-project-id';
  }

  // Create checkout session directly
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
          name: `Tabi ${planName} Subscription`,
          description: `Monthly subscription to Tabi ${planName} plan`
        }
      },
      quantity: 1
    }];

    const checkoutData = {
      items,
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: customerEmail,
      client_reference_id: clientReferenceId,
      phone_number_collection: true,
      delivery_address_collection: false
    };

    try {
      // Since we can't make direct API calls from frontend due to CORS,
      // we'll create a temporary solution using a working endpoint
      const response = await fetch('/api/byl-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(checkoutData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('BYL checkout creation failed:', error);
      throw error;
    }
  }

  // Format amount for BYL (convert to integer)
  formatAmount(amount) {
    return Math.round(parseFloat(amount));
  }

  // Create success/cancel URLs
  createUrls(baseUrl, type, referenceId) {
    return {
      successUrl: `${baseUrl}/payment/success?type=${type}&ref=${referenceId}`,
      cancelUrl: `${baseUrl}/payment/cancel?type=${type}&ref=${referenceId}`
    };
  }
}

export default new BylDirectService();
