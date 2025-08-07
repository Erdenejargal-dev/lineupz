// Test BYL payment integration
const bylService = require('./backend/src/services/bylService');

async function testBylIntegration() {
  console.log('=== Testing BYL Payment Integration ===');
  
  try {
    // Test 1: Check credentials
    console.log('\n1. Checking BYL credentials...');
    console.log('API URL:', process.env.BYL_API_URL || 'https://byl.mn/api/v1');
    console.log('Project ID:', process.env.BYL_PROJECT_ID ? 'Set' : 'Missing');
    console.log('API Token:', process.env.BYL_API_TOKEN ? 'Set' : 'Missing');
    
    // Test 2: Create a simple checkout
    console.log('\n2. Testing checkout creation...');
    const checkoutData = {
      items: [{
        price_data: {
          unit_amount: 150000, // 150,000 MNT
          product_data: {
            name: 'Test Tabi Pro Subscription',
            client_reference_id: 'test-subscription-pro-123'
          }
        },
        quantity: 1
      }],
      success_url: 'https://tabi.mn/payment/success?type=subscription&plan=pro',
      cancel_url: 'https://tabi.mn/payment/cancel?type=subscription&plan=pro',
      customer_email: 'test@example.com',
      client_reference_id: 'test-subscription-pro-123-' + Date.now(),
      phone_number_collection: true,
      delivery_address_collection: false
    };
    
    console.log('Creating checkout with data:', JSON.stringify(checkoutData, null, 2));
    
    const result = await bylService.createCheckout(checkoutData);
    
    console.log('\n✅ SUCCESS! Checkout created:');
    console.log('Checkout ID:', result.id || result.data?.id);
    console.log('Checkout URL:', result.url || result.data?.url);
    console.log('Full response:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('Stack:', error.stack);
    
    // Provide specific troubleshooting
    if (error.message.includes('credentials not configured')) {
      console.log('\n🔧 SOLUTION: Check your .env file and ensure:');
      console.log('- BYL_API_TOKEN is set');
      console.log('- BYL_PROJECT_ID is set');
    } else if (error.message.includes('401')) {
      console.log('\n🔧 SOLUTION: Invalid API token. Check BYL_API_TOKEN in .env');
    } else if (error.message.includes('404')) {
      console.log('\n🔧 SOLUTION: Invalid project ID. Check BYL_PROJECT_ID in .env');
    } else if (error.message.includes('400')) {
      console.log('\n🔧 SOLUTION: Invalid request data. Check the checkout parameters');
    }
  }
}

// Load environment variables
require('dotenv').config({ path: './backend/.env' });

testBylIntegration();
