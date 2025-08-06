# BYL Payment Integration - Complete Implementation

This document outlines the complete BYL payment integration implemented in the Tabi project.

## Overview

BYL (byl.mn) is a Mongolian payment gateway that supports QPay and other local payment methods. This integration allows users to pay for subscriptions and appointments through BYL's secure checkout system.

## Configuration

### Environment Variables

Add the following to your `backend/.env` file:

```env
# BYL Payment Integration
BYL_API_URL=https://byl.mn/api/v1
BYL_API_TOKEN=310|QvUrmbmP6FU9Zstv4MHI6RzqPmCQK8YrjsLKPDx4d4c10414
BYL_PROJECT_ID=230
BYL_WEBHOOK_SECRET=your_webhook_secret_here
```

### Frontend Environment Variables

Add to your `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Backend Implementation

### 1. BYL Service (`backend/src/services/bylService.js`)

Core service for interacting with BYL API:
- Create invoices and checkouts
- Handle webhook verification
- Process payment events
- Format amounts and URLs

### 2. Payment Model (`backend/src/models/Payment.js`)

MongoDB schema for tracking payments:
- Payment identification (BYL invoice/checkout IDs)
- Payment details (amount, status, method)
- Reference tracking (subscription, appointment)
- Customer information
- Webhook data storage

### 3. Payment Controller (`backend/src/controllers/paymentController.js`)

Handles all payment-related operations:
- `createSubscriptionPayment` - Create subscription payments
- `createAppointmentPayment` - Create appointment payments
- `createInvoice` - Create simple invoices
- `handleWebhook` - Process BYL webhooks
- `getUserPayments` - Get user payment history
- `getPaymentStats` - Admin payment statistics

### 4. Payment Routes (`backend/src/routes/payments.js`)

API endpoints:
- `POST /api/payments/webhook` - BYL webhook (public)
- `POST /api/payments/subscription` - Create subscription payment
- `POST /api/payments/appointment` - Create appointment payment
- `POST /api/payments/invoice` - Create invoice
- `GET /api/payments/user` - Get user payments
- `GET /api/payments/:paymentId` - Get payment details
- `GET /api/payments/admin/stats` - Payment statistics

## Frontend Implementation

### 1. Payment Success Page (`src/app/payment/success/page.jsx`)

Displays payment success confirmation:
- Dynamic success messages based on payment type
- Payment details display
- Navigation to relevant sections
- Email confirmation notice

### 2. Payment Cancel Page (`src/app/payment/cancel/page.jsx`)

Handles payment cancellation:
- Cancellation messages by payment type
- Retry payment options
- Support contact information
- Clear next steps

### 3. Updated Pricing Page (`src/app/pricing/page.tsx`)

Integrated with BYL payments:
- Direct BYL checkout integration
- Automatic subscription creation
- Seamless payment flow
- Error handling and user feedback

## Payment Flow

### Subscription Payment Flow

1. User selects a plan on pricing page
2. System creates subscription record
3. BYL checkout session is created
4. User is redirected to BYL payment page
5. User completes payment
6. BYL sends webhook to our system
7. System processes webhook and activates subscription
8. User is redirected to success page

### Appointment Payment Flow

1. User books an appointment
2. System creates appointment record
3. BYL checkout session is created for appointment
4. User completes payment through BYL
5. Webhook confirms payment
6. Appointment is confirmed
7. User receives confirmation

## Webhook Handling

### Webhook Security

- Signature verification using HMAC SHA256
- Webhook secret validation
- Request origin verification

### Supported Events

1. **invoice.paid** - Invoice payment completed
2. **checkout.completed** - Checkout session completed

### Webhook Processing

1. Verify webhook signature
2. Parse event data
3. Find corresponding payment record
4. Update payment status
5. Trigger post-payment actions (activate subscription, confirm appointment)
6. Send confirmation emails (if configured)

## Testing

### Test Webhook Locally

Use ngrok to expose your local server:

```bash
ngrok http 5000
```

Configure webhook URL in BYL dashboard:
```
https://your-ngrok-url.ngrok.io/api/payments/webhook
```

### Test Payment Flow

1. Start backend server: `npm run dev` (in backend directory)
2. Start frontend server: `npm run dev` (in root directory)
3. Navigate to pricing page
4. Select a plan and complete payment
5. Verify webhook processing in backend logs
6. Check payment success page

## Production Deployment

### 1. Environment Setup

Update production environment variables:
- Set correct `FRONTEND_URL`
- Configure production BYL credentials
- Set webhook secret

### 2. Webhook Configuration

Configure webhook URL in BYL dashboard:
```
https://api.tabi.mn/api/payments/webhook
```

### 3. SSL Certificate

Ensure your webhook endpoint has valid SSL certificate as BYL requires HTTPS.

## Error Handling

### Common Issues

1. **Invalid Signature**: Check webhook secret configuration
2. **Payment Not Found**: Verify payment ID mapping
3. **Network Errors**: Implement retry logic for API calls
4. **Webhook Timeout**: Ensure webhook endpoint responds quickly

### Logging

All payment operations are logged:
- Payment creation attempts
- Webhook events
- Error conditions
- Status changes

## Security Considerations

1. **API Token Security**: Store BYL API token securely
2. **Webhook Verification**: Always verify webhook signatures
3. **HTTPS Only**: Use HTTPS for all payment-related endpoints
4. **Input Validation**: Validate all payment amounts and data
5. **Rate Limiting**: Implement rate limiting on payment endpoints

## Monitoring

### Key Metrics

- Payment success rate
- Webhook processing time
- Failed payment attempts
- Revenue tracking

### Alerts

Set up alerts for:
- Failed webhook processing
- High payment failure rates
- API connection issues
- Unusual payment patterns

## Support

### BYL Documentation

- API Documentation: https://byl.mn/docs/api/
- Webhook Guide: https://byl.mn/docs/webhook.html
- Support: Contact BYL support team

### Internal Support

For integration issues:
1. Check backend logs for errors
2. Verify webhook signature validation
3. Test payment flow in development
4. Contact development team

## Future Enhancements

1. **Recurring Payments**: Implement subscription renewals
2. **Refund Support**: Add refund processing
3. **Multiple Currencies**: Support additional currencies
4. **Payment Analytics**: Enhanced payment reporting
5. **Mobile Integration**: Optimize for mobile payments

## Conclusion

This BYL payment integration provides a complete, secure, and scalable payment solution for the Tabi platform. It supports both subscription and appointment payments with proper webhook handling and comprehensive error management.
