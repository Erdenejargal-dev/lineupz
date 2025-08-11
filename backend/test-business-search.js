const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });

// Import models
const Business = require('./src/models/Business');
const User = require('./src/models/User');

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

async function testBusinessSearch() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check existing businesses
    const existingBusinesses = await Business.find({});
    console.log(`Found ${existingBusinesses.length} existing businesses:`);
    existingBusinesses.forEach(business => {
      console.log(`- ${business.name} (${business.status})`);
    });

    // Create test businesses if none exist
    if (existingBusinesses.length === 0) {
      console.log('\nCreating test businesses...');
      
      // Create test users first
      const testUsers = [];
      for (let i = 1; i <= 3; i++) {
        const user = new User({
          name: `Test Business Owner ${i}`,
          email: `business${i}@test.com`,
          phone: `+976${9000000 + i}`,
          userId: `TEST_USER_${i}`,
          isCreator: true,
          isEmailVerified: true
        });
        await user.save();
        testUsers.push(user);
      }

      // Create test businesses
      const testBusinesses = [
        {
          name: 'Tabi Hair Salon',
          description: 'Professional hair styling and beauty services',
          category: 'beauty',
          owner: testUsers[0]._id,
          contact: {
            email: 'contact@tabihair.mn',
            phone: '+97699001001'
          },
          subscription: {
            plan: 'professional',
            maxArtists: BUSINESS_PLANS.professional.maxArtists,
            maxLinesPerArtist: BUSINESS_PLANS.professional.maxLinesPerArtist,
            isActive: true
          },
          status: 'active'
        },
        {
          name: 'Tabi Medical Center',
          description: 'Modern healthcare facility with experienced doctors',
          category: 'healthcare',
          owner: testUsers[1]._id,
          contact: {
            email: 'info@tabimedical.mn',
            phone: '+97699001002'
          },
          subscription: {
            plan: 'enterprise',
            maxArtists: BUSINESS_PLANS.enterprise.maxArtists,
            maxLinesPerArtist: BUSINESS_PLANS.enterprise.maxLinesPerArtist,
            isActive: true
          },
          status: 'active'
        },
        {
          name: 'Tabi Consulting',
          description: 'Business consulting and advisory services',
          category: 'consulting',
          owner: testUsers[2]._id,
          contact: {
            email: 'hello@tabiconsulting.mn',
            phone: '+97699001003'
          },
          subscription: {
            plan: 'starter',
            maxArtists: BUSINESS_PLANS.starter.maxArtists,
            maxLinesPerArtist: BUSINESS_PLANS.starter.maxLinesPerArtist,
            isActive: true
          },
          status: 'active'
        }
      ];

      for (const businessData of testBusinesses) {
        const business = new Business(businessData);
        await business.save();
        console.log(`Created business: ${business.name}`);
      }
    }

    // Test search functionality
    console.log('\n--- Testing Search Functionality ---');
    
    const searchQueries = ['tabi', 'hair', 'medical', 'consulting', 'salon'];
    
    for (const query of searchQueries) {
      console.log(`\nSearching for: "${query}"`);
      const results = await Business.find({
        name: { $regex: new RegExp(query, 'i') },
        status: 'active'
      })
      .select('name description category subscription currentArtistCount contact')
      .limit(10)
      .sort({ name: 1 });

      console.log(`Found ${results.length} results:`);
      results.forEach(business => {
        console.log(`- ${business.name} (${business.category}) - ${business.subscription.plan} plan`);
      });
    }

    console.log('\n--- Search Test Complete ---');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

testBusinessSearch();
