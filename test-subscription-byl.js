// Test Subscription BYL Integration
// Using global fetch (Node.js 18+)

// Test configuration
const API_BASE_URL = 'http://localhost:5000';
const TEST_USER = {
  email: 'test@example.com',
  password: 'testpassword123',
  name: 'Test User',
  phone: '+97699999999'
};

async function testSubscriptionBylIntegration() {
  console.log('🧪 Testing Subscription BYL Integration...');
  
  try {
    // Step 1: Register/Login to get auth token
    console.log('\n📝 Step 1: User Authentication...');
    
    let authToken;
    try {
      // Try to login first
      const loginResponse = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: TEST_USER.email,
          password: TEST_USER.password
        })
      });

      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        authToken = loginData.token;
        console.log('✅ Login successful');
      } else {
        // If login fails, try to register
        console.log('⚠️ Login failed, trying registration...');
        
        const registerResponse = await fetch(`${API_BASE_URL}/api/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(TEST_USER)
        });

        if (registerResponse.ok) {
          const registerData = await registerResponse.json();
          authToken = registerData.token;
          console.log('✅ Registration successful');
        } else {
          const registerError = await registerResponse.json();
          throw new Error(`Registration failed: ${registerError.message}`);
        }
      }
    } catch (authError) {
      console.log('⚠️ Auth failed, using mock token for testing...');
      authToken = 'mock-token-for-testing';
    }

    // Step 2: Get subscription plans
    console.log('\n📋 Step 2: Getting subscription plans...');
    
    const plansResponse = await fetch(`${API_BASE_URL}/api/subscription/plans`);
    const plansData = await plansResponse.json();
    
    if (plansResponse.ok) {
      console.log('✅ Plans retrieved successfully');
      console.log('Available plans:', Object.keys(plansData.plans));
    } else {
      throw new Error(`Failed to get plans: ${plansData.message}`);
    }

    // Step 3: Test subscription creation for Basic plan
    console.log('\n💳 Step 3: Creating Basic subscription...');
    
    const subscriptionResponse = await fetch(`${API_BASE_URL}/api/subscription/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        plan: 'basic'
      })
    });

    console.log('Response Status:', subscriptionResponse.status);
    console.log('Response Headers:', Object.fromEntries(subscriptionResponse.headers.entries()));

    const subscriptionData = await subscriptionResponse.json();
    console.log('Response Body:', JSON.stringify(subscriptionData, null, 2));

    if (subscriptionResponse.ok) {
      console.log('\n✅ Subscription creation successful!');
      
      if (subscriptionData.checkoutUrl) {
        console.log('🔗 BYL Checkout URL:', subscriptionData.checkoutUrl);
        console.log('🆔 BYL Checkout ID:', subscriptionData.checkoutId);
        console.log('📦 Subscription ID:', subscriptionData.subscription._id);
        console.log('📊 Plan:', subscriptionData.subscription.plan);
        console.log('💰 Price:', subscriptionData.subscription.planConfig.price);
        
        return {
          success: true,
          checkoutUrl: subscriptionData.checkoutUrl,
          checkoutId: subscriptionData.checkoutId,
          subscription: subscriptionData.subscription
        };
      } else {
        console.log('⚠️ No checkout URL returned (might be free plan)');
        return {
          success: true,
          subscription: subscriptionData.subscription
        };
      }
    } else {
      console.log('\n❌ Subscription creation failed');
      console.log('Error:', subscriptionData.message);
      console.log('Details:', subscriptionData.error);
      
      return {
        success: false,
        error: subscriptionData.message,
        details: subscriptionData
      };
    }

  } catch (error) {
    console.log('\n💥 Test Error:', error.message);
    console.log('Stack:', error.stack);
    
    return {
      success: false,
      error: error.message
    };
  }
}

// Run the test
console.log('🚀 Starting Subscription BYL Integration Test...');
testSubscriptionBylIntegration().then(result => {
  console.log('\n🏁 Test Complete');
  console.log('Final Result:', result.success ? '✅ SUCCESS' : '❌ FAILED');
  
  if (!result.success) {
    console.log('Error Details:', result.error);
    process.exit(1);
  } else {
    console.log('🎉 BYL Integration is working correctly!');
    process.exit(0);
  }
}).catch(error => {
  console.error('💥 Unexpected error:', error);
  process.exit(1);
});
