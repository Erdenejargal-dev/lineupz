const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

// Test the search endpoint directly
async function testSearchEndpoint() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const Business = require('./src/models/Business');
    
    console.log('\n--- Testing Business Search Logic ---');
    
    // Test the exact search logic from the controller
    const query = 'hair';
    console.log(`Searching for: "${query}"`);
    
    const businesses = await Business.find({
      name: { $regex: new RegExp(query.trim(), 'i') },
      status: 'active'
    })
    .select('name description category subscription currentArtistCount contact')
    .limit(10)
    .sort({ name: 1 });

    console.log(`Found ${businesses.length} businesses:`);
    businesses.forEach(business => {
      console.log(`- ${business.name} (${business.category}) - ${business.subscription?.plan || 'no plan'}`);
    });

    // Test with different queries
    const testQueries = ['tabi', 'salon', 'matrix', 'medical'];
    
    for (const testQuery of testQueries) {
      console.log(`\nTesting query: "${testQuery}"`);
      try {
        const results = await Business.find({
          name: { $regex: new RegExp(testQuery.trim(), 'i') },
          status: 'active'
        })
        .select('name description category subscription currentArtistCount contact')
        .limit(10)
        .sort({ name: 1 });
        
        console.log(`Results: ${results.length}`);
        results.forEach(result => {
          console.log(`  - ${result.name}`);
        });
      } catch (error) {
        console.error(`Error with query "${testQuery}":`, error.message);
      }
    }

    // Test the full controller logic
    console.log('\n--- Testing Full Controller Logic ---');
    
    const BUSINESS_PLANS = {
      starter: {
        name: 'Starter Plan',
        maxArtists: 5,
        maxLinesPerArtist: 3,
        price: 120000,
        features: ['Basic queue management', 'SMS notifications', 'Basic analytics', '3 lines per artist']
      },
      professional: {
        name: 'Professional Plan', 
        maxArtists: 8,
        maxLinesPerArtist: 10,
        price: 200000,
        features: ['Advanced queue management', 'SMS & Email notifications', 'Advanced analytics', 'Calendar integration', '10 lines per artist']
      },
      enterprise: {
        name: 'Enterprise Plan',
        maxArtists: 12,
        maxLinesPerArtist: 999,
        price: 250000,
        features: ['Full queue management', 'All notifications', 'Complete analytics', 'Calendar integration', 'Priority support', 'Unlimited lines per artist']
      }
    };

    const testQuery2 = 'hair';
    const businesses2 = await Business.find({
      name: { $regex: new RegExp(testQuery2.trim(), 'i') },
      status: 'active'
    })
    .select('name description category subscription currentArtistCount contact')
    .limit(10)
    .sort({ name: 1 });

    // Format response with subscription plan details
    const formattedBusinesses = businesses2.map(business => {
      const planDetails = BUSINESS_PLANS[business.subscription?.plan] || {};
      
      return {
        id: business._id,
        name: business.name,
        description: business.description,
        category: business.category,
        currentArtistCount: business.currentArtistCount,
        subscription: {
          plan: business.subscription?.plan,
          planName: planDetails.name || business.subscription?.plan,
          maxArtists: planDetails.maxArtists || 0,
          features: planDetails.features || []
        },
        contact: {
          email: business.contact?.email
        }
      };
    });

    console.log('Formatted businesses:', JSON.stringify(formattedBusinesses, null, 2));

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

testSearchEndpoint();
