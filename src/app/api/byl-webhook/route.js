import { NextResponse } from 'next/server';
import crypto from 'crypto';

// BYL webhook configuration
const BYL_WEBHOOK_SECRET = process.env.BYL_WEBHOOK_SECRET;

export async function POST(request) {
  try {
    // Get the raw body for signature verification
    const body = await request.text();
    const signature = request.headers.get('x-byl-signature');

    // Verify webhook signature
    if (BYL_WEBHOOK_SECRET && signature) {
      const computedSignature = crypto
        .createHmac('sha256', BYL_WEBHOOK_SECRET)
        .update(body)
        .digest('hex');

      if (computedSignature !== signature) {
        console.error('Invalid webhook signature');
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        );
      }
    }

    // Parse the webhook event
    const event = JSON.parse(body);
    console.log('BYL Webhook received:', event.type, event.data?.object?.id);

    // Handle different webhook events
    switch (event.type) {
      case 'checkout.completed':
        await handleCheckoutCompleted(event.data.object);
        break;
      
      case 'invoice.paid':
        await handleInvoicePaid(event.data.object);
        break;
      
      case 'payment.succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      
      case 'payment.failed':
        await handlePaymentFailed(event.data.object);
        break;
      
      default:
        console.log(`Unhandled webhook event type: ${event.type}`);
    }

    // Return success response
    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Handle successful checkout completion
async function handleCheckoutCompleted(checkout) {
  try {
    console.log('Processing checkout completion:', checkout.id);
    
    const {
      id: checkoutId,
      client_reference_id: subscriptionId,
      customer_email: customerEmail,
      amount_total: amount,
      payment_method: paymentMethod,
      status
    } = checkout;

    // Here you would typically:
    // 1. Update subscription status in database
    // 2. Send confirmation email
    // 3. Activate user's plan
    
    console.log('Checkout completed successfully:', {
      checkoutId,
      subscriptionId,
      customerEmail,
      amount,
      paymentMethod,
      status
    });

    // For now, we'll log the successful payment
    // In a real implementation, you'd update your database here
    
  } catch (error) {
    console.error('Error handling checkout completion:', error);
    throw error;
  }
}

// Handle successful invoice payment
async function handleInvoicePaid(invoice) {
  try {
    console.log('Processing invoice payment:', invoice.id);
    
    const {
      id: invoiceId,
      amount,
      description,
      status,
      project_id: projectId
    } = invoice;

    console.log('Invoice paid successfully:', {
      invoiceId,
      amount,
      description,
      status,
      projectId
    });

    // Update subscription or payment status in your database
    
  } catch (error) {
    console.error('Error handling invoice payment:', error);
    throw error;
  }
}

// Handle successful payment
async function handlePaymentSucceeded(payment) {
  try {
    console.log('Processing payment success:', payment.id);
    
    // Handle successful payment
    // Update user subscription, send notifications, etc.
    
  } catch (error) {
    console.error('Error handling payment success:', error);
    throw error;
  }
}

// Handle failed payment
async function handlePaymentFailed(payment) {
  try {
    console.log('Processing payment failure:', payment.id);
    
    // Handle failed payment
    // Send notification, update subscription status, etc.
    
  } catch (error) {
    console.error('Error handling payment failure:', error);
    throw error;
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS(request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-byl-signature',
    },
  });
}
