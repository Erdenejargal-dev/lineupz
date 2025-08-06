// Test BYL Integration
// Using built-in fetch (Node.js 18+)

// BYL Configuration
const BYL_API_URL = 'https://byl.mn/api/v1';
const BYL_API_TOKEN = '310|QvUrmbmP6FU9Zstv4MHI6RzqPmCQK8YrjsLKPDx4d4c10414';
const BYL_PROJECT_ID = '230';

async function testBylConnection() {
  console.log('🧪 Testing BYL API Connection...');
  console.log('API URL:', BYL_API_URL);
  console.log('Project ID:', BYL_PROJECT_ID);
  console.log('Token:', BYL_API_TOKEN ? 'Present' : 'Missing');
  
  try {
    // Test creating a simple checkout
    const checkoutData = {
      items: [{
        price_data: {
          unit_amount: 69000, // Basic plan price
          product_data: {
            name: 'Tabi Basic Subscription Test',
            client_reference_id: 'test-subscription-123'
          }
        },
        quantity: 1
      }],
      success_url: 'https://tabi.mn/payment/success?type=subscription&ref=test',
      cancel_url: 'https://tabi.mn/payment/cancel?type=subscription&ref=test',
      customer_email: 'test@example.com',
      client_reference_id: 'test-payment-123',
      phone_number_collection: true,
      delivery_address_collection: false
    };

    console.log('\n📤 Sending request to BYL API...');
    console.log('Request URL:', `${BYL_API_URL}/projects/${BYL_PROJECT_ID}/checkouts`);
    console.log('Request Data:', JSON.stringify(checkoutData, null, 2));

    const response = await fetch(`${BYL_API_URL}/projects/${BYL_PROJECT_ID}/checkouts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${BYL_API_TOKEN}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(checkoutData)
    });

    console.log('\n📥 Response Status:', response.status);
    console.log('Response Headers:', Object.fromEntries(response.headers.entries()));

    const result = await response.json();
    console.log('\n📋 Response Body:', JSON.stringify(result, null, 2));

    if (response.ok) {
      console.log('\n✅ BYL API Connection Successful!');
      console.log('Checkout ID:', result.id || result.data?.id);
      console.log('Checkout URL:', result.url || result.data?.url);
      return { success: true, data: result };
    } else {
      console.log('\n❌ BYL API Error:', response.status);
      console.log('Error Details:', result);
      return { success: false, error: result };
    }

  } catch (error) {
    console.log('\n💥 Connection Error:', error.message);
    console.log('Stack:', error.stack);
    return { success: false, error: error.message };
  }
}

// Run the test
testBylConnection().then(result => {
  console.log('\n🏁 Test Complete');
  process.exit(result.success ? 0 : 1);
});
