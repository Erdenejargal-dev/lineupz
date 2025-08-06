# BYL Webhook Configuration Guide 🔗

## 🎯 **Current BYL Dashboard Settings**

You currently have:
- **URL:** `https://tabi.mn/`
- **Hash Key:** `ajxwrEu54Vm7gqESwQvgZz9WNnafxkRV`

## ✅ **Recommended Configuration**

### **Option 1: Frontend Webhook (Recommended)**
Since our new solution uses Next.js API routes, use the **frontend domain**:

```
URL: https://tabi.mn/api/byl-webhook
Hash Key: ajxwrEu54Vm7gqESwQvgZz9WNnafxkRV
```

### **Option 2: Backend Webhook (If Backend Works)**
If you fix the backend deployment issues later:

```
URL: https://api.tabi.mn/api/payments/webhook
Hash Key: ajxwrEu54Vm7gqESwQvgZz9WNnafxkRV
```

## 🔧 **BYL Dashboard Configuration Steps**

### **Step 1: Update Webhook URL**
In your BYL dashboard:
1. Go to **Webhook Settings**
2. Change URL from: `https://tabi.mn/`
3. Change URL to: `https://tabi.mn/api/byl-webhook`
4. Keep the same Hash Key: `ajxwrEu54Vm7gqESwQvgZz9WNnafxkRV`

### **Step 2: Environment Variables**
Add to your `.env.local`:
```env
BYL_API_TOKEN=your_byl_api_token
BYL_PROJECT_ID=your_byl_project_id
BYL_WEBHOOK_SECRET=ajxwrEu54Vm7gqESwQvgZz9WNnafxkRV
```

## 📋 **Webhook Events Handled**

Our webhook endpoint handles these BYL events:

### **1. checkout.completed**
- Triggered when user completes payment
- Updates subscription status
- Sends confirmation email

### **2. invoice.paid**
- Triggered when invoice is paid
- Updates payment records
- Activates subscription

### **3. payment.succeeded**
- Triggered on successful payment
- Updates user plan
- Sends success notification

### **4. payment.failed**
- Triggered on failed payment
- Sends failure notification
- Updates subscription status

## 🔒 **Security Features**

### **Signature Verification**
```javascript
// Webhook verifies BYL signature
const computedSignature = crypto
  .createHmac('sha256', BYL_WEBHOOK_SECRET)
  .update(body)
  .digest('hex');

if (computedSignature !== signature) {
  return 401; // Unauthorized
}
```

### **Event Processing**
```javascript
// Handles different webhook events
switch (event.type) {
  case 'checkout.completed':
    await handleCheckoutCompleted(event.data.object);
    break;
  case 'payment.succeeded':
    await handlePaymentSucceeded(event.data.object);
    break;
}
```

## 🧪 **Testing Webhook**

### **1. Test Webhook URL**
```bash
curl -X POST https://tabi.mn/api/byl-webhook \
  -H "Content-Type: application/json" \
  -H "x-byl-signature: test_signature" \
  -d '{"type": "test", "data": {"object": {"id": "test_123"}}}'
```

### **2. Check Logs**
Monitor your Vercel/Next.js logs for webhook events:
```
BYL Webhook received: checkout.completed ch_123456
Processing checkout completion: ch_123456
Checkout completed successfully: {...}
```

## 🎯 **Recommendation**

**Use the frontend webhook URL:**
```
https://tabi.mn/api/byl-webhook
```

**Why?**
- ✅ Works immediately (no backend deployment issues)
- ✅ Uses our new direct BYL integration
- ✅ Handles all payment events properly
- ✅ Secure signature verification
- ✅ Comprehensive event logging

## 🚀 **Complete Payment Flow**

### **1. User Payment**
```
User clicks "Get Started" 
→ Frontend creates BYL checkout
→ User pays via QPay
→ BYL sends webhook to tabi.mn/api/byl-webhook
```

### **2. Webhook Processing**
```
Webhook receives payment confirmation
→ Verifies signature
→ Updates subscription status
→ Sends confirmation email
→ Activates user's plan
```

## 📝 **Action Required**

**Update your BYL dashboard webhook URL to:**
```
https://tabi.mn/api/byl-webhook
```

**Keep the same hash key:**
```
ajxwrEu54Vm7gqESwQvgZz9WNnafxkRV
```

This will complete your BYL payment integration! 🎉
