# 💰 SERVICE CHARGE FLOW - COMPLETE CODE EXPLANATION

## 🔄 Complete Flow Overview

Here's the **step-by-step code flow** for how service charges work in Tabi, from line creation to payment processing:

```
1. Business creates paid line → 2. Customer joins line → 3. Price validation → 4. Payment generation → 5. Payment processing → 6. Service delivery
```

---

## 📝 **STEP 1: Line Creation with Pricing**

### **Frontend: CreateLineForm.jsx**
When business owner creates a line with pricing:

```javascript
// User enables paid service
const [formData, setFormData] = useState({
  pricing: {
    isPaid: false,        // Toggle to enable pricing
    price: 0,            // Price amount
    currency: 'MNT',     // Currency type
    paymentMethods: ['byl'], // Accepted payment methods
    description: '',     // Price description
    priceType: 'per_service' // Pricing model
  }
});

// When user checks "This is a paid service"
onChange={(e) => setFormData({
  ...formData,
  pricing: {
    ...formData.pricing,
    isPaid: e.target.checked,
    price: e.target.checked ? formData.pricing.price || 5000 : 0 // Default ₮5,000
  }
})}
```

### **Frontend Validation**
```javascript
// Price validation in validateForm()
if (formData.pricing.isPaid) {
  // Price must be greater than 0
  if (!formData.pricing.price || formData.pricing.price <= 0) {
    newErrors.price = 'Price must be greater than 0 for paid services';
  } 
  // Price cannot exceed 1,000,000
  else if (formData.pricing.price > 1000000) {
    newErrors.price = 'Price cannot exceed 1,000,000';
  }

  // At least one payment method required
  if (!formData.pricing.paymentMethods || formData.pricing.paymentMethods.length === 0) {
    newErrors.paymentMethods = 'At least one payment method must be selected';
  }
}
```

### **Backend: Line Model Validation**
```javascript
// backend/src/models/Line.js
pricing: {
  isPaid: { type: Boolean, default: false },
  price: {
    type: Number,
    min: [0, 'Price cannot be negative'],
    max: [1000000, 'Price cannot exceed 1,000,000'],
    validate: {
      validator: function(value) {
        // If isPaid is true, price must be greater than 0
        if (this.pricing?.isPaid && (!value || value <= 0)) {
          return false;
        }
        return true;
      },
      message: 'Price must be greater than 0 for paid services'
    }
  },
  currency: { type: String, enum: ['MNT', 'USD', 'EUR'], default: 'MNT' },
  paymentMethods: [{ type: String, enum: ['byl', 'cash', 'card', 'bank_transfer'] }],
  priceType: { type: String, enum: ['per_service', 'per_appointment', 'per_hour'] }
}
```

---

## 🔍 **STEP 2: Customer Discovers Line**

### **API Call: Get Line by Code**
```javascript
// Customer enters line code (e.g., "ABC123")
const response = await fetch(`${API_BASE_URL}/lines/code/ABC123`);
const data = await response.json();

// Response includes pricing information
{
  success: true,
  line: {
    title: "Premium Hair Salon",
    serviceType: "appointments",
    pricing: {
      isPaid: true,
      price: 25000,
      currency: "MNT",
      priceType: "per_appointment",
      paymentMethods: ["byl", "cash", "card"],
      description: "Includes wash, cut, and styling"
    }
  }
}
```

### **Frontend: Display Pricing to Customer**
```javascript
// In JoinLineForm.jsx (needs to be updated)
const LinePreviewStep = ({ lineInfo }) => {
  const { pricing } = lineInfo;
  
  return (
    <div>
      {/* Show line details */}
      <h3>{lineInfo.title}</h3>
      
      {/* Show pricing if it's a paid service */}
      {pricing?.isPaid && (
        <div className="pricing-info bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-medium text-yellow-900">💰 Service Charge</h4>
          <p className="text-lg font-bold text-yellow-800">
            {pricing.currency === 'MNT' ? '₮' : pricing.currency === 'USD' ? '$' : '€'}
            {pricing.price.toLocaleString()} {pricing.priceType.replace('_', ' ')}
          </p>
          {pricing.description && (
            <p className="text-sm text-yellow-700">{pricing.description}</p>
          )}
          <div className="mt-2">
            <span className="text-xs text-yellow-600">Payment methods: </span>
            {pricing.paymentMethods.map(method => (
              <span key={method} className="inline-block bg-yellow-100 px-2 py-1 rounded text-xs mr-1">
                {method === 'byl' ? '💳 BYL' : method === 'cash' ? '💵 Cash' : method === 'card' ? '💳 Card' : '🏦 Bank'}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
```

---

## 💳 **STEP 3: Payment Processing Flow**

### **Customer Chooses Payment Method**
```javascript
// Updated QueueJoinInterface for paid services
const QueueJoinInterface = ({ lineInfo, onSuccess, setStep }) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('byl');
  const [loading, setLoading] = useState(false);

  const handleJoinPaidQueue = async () => {
    const token = localStorage.getItem('token');
    
    if (lineInfo.pricing?.isPaid) {
      // For paid services, initiate payment first
      if (selectedPaymentMethod === 'byl') {
        await initiateBYLPayment();
      } else {
        await joinQueueWithPendingPayment();
      }
    } else {
      // Free service - join directly
      await joinQueueDirectly();
    }
  };

  const initiateBYLPayment = async () => {
    setLoading(true);
    
    try {
      // Calculate total amount
      const amount = calculateServiceAmount(lineInfo);
      
      // Create payment session
      const paymentResponse = await fetch('/api/byl-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          lineCode: lineInfo.lineCode,
          amount: amount,
          currency: lineInfo.pricing.currency,
          serviceType: 'queue_join',
          description: `Join queue: ${lineInfo.title}`
        })
      });

      const { checkoutUrl } = await paymentResponse.json();
      
      // Redirect to BYL payment
      window.location.href = checkoutUrl;
      
    } catch (error) {
      console.error('Payment initiation failed:', error);
      setError('Failed to initiate payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };
};
```

### **Amount Calculation Logic**
```javascript
// Calculate service amount based on pricing type
const calculateServiceAmount = (lineInfo) => {
  const { pricing, appointmentSettings } = lineInfo;
  
  switch (pricing.priceType) {
    case 'per_service':
    case 'per_appointment':
      return pricing.price; // Fixed price per service/appointment
      
    case 'per_hour':
      // For hourly rate, multiply by appointment duration
      const durationHours = appointmentSettings.duration / 60;
      return Math.ceil(pricing.price * durationHours);
      
    default:
      return pricing.price;
  }
};
```

---

## 🔄 **STEP 4: Backend Payment Processing**

### **BYL Checkout API Route**
```javascript
// src/app/api/byl-checkout/route.js
export async function POST(request) {
  try {
    const { lineCode, amount, currency, serviceType, description } = await request.json();
    
    // Get line information and validate pricing
    const line = await Line.findOne({ lineCode });
    if (!line) {
      return NextResponse.json({ error: 'Line not found' }, { status: 404 });
    }
    
    // Validate payment amount matches line pricing
    const expectedAmount = calculateExpectedAmount(line);
    if (amount !== expectedAmount) {
      return NextResponse.json({ 
        error: 'Payment amount does not match service price' 
      }, { status: 400 });
    }
    
    // Create BYL payment session
    const bylResponse = await fetch('https://api.byl.mn/v1/checkout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.BYL_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: amount,
        currency: currency,
        description: description,
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success?lineCode=${lineCode}`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/cancel?lineCode=${lineCode}`,
        metadata: {
          lineCode,
          serviceType,
          userId: user.id
        }
      })
    });
    
    const { checkout_url } = await bylResponse.json();
    
    return NextResponse.json({ checkoutUrl: checkout_url });
    
  } catch (error) {
    return NextResponse.json({ error: 'Payment creation failed' }, { status: 500 });
  }
}
```

### **Payment Validation Function**
```javascript
// Validate payment amount against line pricing
const calculateExpectedAmount = (line) => {
  if (!line.pricing?.isPaid) {
    return 0; // Free service
  }
  
  const { pricing } = line;
  
  switch (pricing.priceType) {
    case 'per_service':
    case 'per_appointment':
      return pricing.price;
      
    case 'per_hour':
      // For appointments, calculate based on duration
      const durationHours = line.appointmentSettings?.duration / 60 || 1;
      return Math.ceil(pricing.price * durationHours);
      
    default:
      return pricing.price;
  }
};
```

---

## ✅ **STEP 5: Payment Success Handling**

### **BYL Webhook Processing**
```javascript
// src/app/api/byl-webhook/route.js
export async function POST(request) {
  try {
    const event = await request.json();
    
    if (event.type === 'payment.succeeded') {
      const { metadata } = event.data;
      const { lineCode, serviceType, userId } = metadata;
      
      // Find the line
      const line = await Line.findOne({ lineCode });
      
      // Add customer to queue/appointment after successful payment
      if (serviceType === 'queue_join') {
        await addToQueue(userId, line._id, {
          paymentStatus: 'paid',
          paymentId: event.data.id,
          amountPaid: event.data.amount,
          currency: event.data.currency
        });
      } else if (serviceType === 'appointment_booking') {
        await createAppointment(userId, line._id, {
          paymentStatus: 'paid',
          paymentId: event.data.id,
          amountPaid: event.data.amount,
          currency: event.data.currency
        });
      }
      
      // Send confirmation notification
      await sendPaymentConfirmation(userId, line, event.data);
    }
    
    return NextResponse.json({ received: true });
    
  } catch (error) {
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
```

### **Queue/Appointment Creation with Payment**
```javascript
// Add customer to queue with payment information
const addToQueue = async (userId, lineId, paymentInfo) => {
  const queueEntry = new LineJoiner({
    user: userId,
    line: lineId,
    status: 'waiting',
    paymentStatus: paymentInfo.paymentStatus,
    paymentId: paymentInfo.paymentId,
    amountPaid: paymentInfo.amountPaid,
    currency: paymentInfo.currency,
    joinedAt: new Date()
  });
  
  await queueEntry.save();
  
  // Update line statistics
  await Line.findByIdAndUpdate(lineId, {
    $inc: { totalJoined: 1 }
  });
  
  return queueEntry;
};
```

---

## 🔒 **STEP 6: Payment Status Tracking**

### **Enhanced LineJoiner Model**
```javascript
// backend/src/models/LineJoiner.js - Add payment fields
const lineJoinerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  line: { type: mongoose.Schema.Types.ObjectId, ref: 'Line', required: true },
  status: { type: String, enum: ['waiting', 'served', 'cancelled'], default: 'waiting' },
  
  // Payment tracking fields
  paymentStatus: {
    type: String,
    enum: ['free', 'paid', 'pending', 'failed', 'refunded'],
    default: 'free'
  },
  paymentId: String,        // BYL payment ID
  amountPaid: Number,       // Amount paid
  currency: String,         // Payment currency
  paymentMethod: String,    // byl, cash, card, etc.
  
  joinedAt: { type: Date, default: Date.now },
  servedAt: Date,
  notes: String
});
```

---

## 📊 **STEP 7: Business Revenue Tracking**

### **Revenue Dashboard API**
```javascript
// Get revenue statistics for business
const getBusinessRevenue = async (req, res) => {
  try {
    const { businessId } = req.params;
    const { startDate, endDate } = req.query;
    
    // Get all paid queue joins for business lines
    const revenue = await LineJoiner.aggregate([
      {
        $lookup: {
          from: 'lines',
          localField: 'line',
          foreignField: '_id',
          as: 'lineInfo'
        }
      },
      {
        $match: {
          'lineInfo.creator': businessId,
          paymentStatus: 'paid',
          joinedAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        }
      },
      {
        $group: {
          _id: '$currency',
          totalRevenue: { $sum: '$amountPaid' },
          transactionCount: { $sum: 1 }
        }
      }
    ]);
    
    res.json({ success: true, revenue });
    
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch revenue data' });
  }
};
```

---

## 🎯 **Complete Flow Summary**

### **Code Flow Diagram**
```
1. CreateLineForm.jsx → validates pricing → saves to Line model
2. Customer enters code → API returns line with pricing
3. JoinLineForm.jsx → shows price → customer confirms
4. Payment method selected → BYL checkout created
5. Customer pays → BYL webhook triggered
6. Webhook → adds to queue → sends confirmation
7. Business dashboard → shows revenue statistics
```

### **Key Validation Points**
1. **Frontend**: Price > 0, payment methods selected
2. **Backend Model**: Price validation, currency validation
3. **Payment API**: Amount matches line pricing
4. **Webhook**: Payment success before queue join

### **Error Handling**
- **Invalid price**: Form validation prevents submission
- **Payment failure**: Customer redirected to retry
- **Webhook failure**: Payment recorded but manual queue addition needed
- **Amount mismatch**: Payment rejected, customer notified

This complete flow ensures **secure**, **validated**, and **trackable** service charges throughout the entire customer journey! 🚀
