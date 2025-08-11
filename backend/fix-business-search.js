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

async function fixBusinessSearch() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // 1. Activate existing businesses
    console.log('\n--- Activating Existing Businesses ---');
    const pendingBusinesses = await Business.find({ status: 'pending' });
    console.log(`Found ${pendingBusinesses.length} pending businesses`);

    for (const business of pendingBusinesses) {
      business.status = 'active';
      business.subscription.isActive = true;
      await business.save();
      console.log(`Activated: ${business.name}`);
    }

    // 2. Create additional test businesses
    console.log('\n--- Creating Additional Test Businesses ---');
    
    // Check if we need to create test users
    let testUsers = await User.find({ email: { $regex: /business.*@test\.com/ } });
    
    if (testUsers.length === 0) {
      console.log('Creating test users...');
      for (let i = 1; i <= 5; i++) {
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
    }

    // Create diverse test businesses
    const newBusinesses = [
      {
        name: 'Tabi Hair Salon',
        description: 'Professional hair styling and beauty services in the heart of Ulaanbaatar',
        category: 'salon',
        owner: testUsers[0]._id,
        contact: {
          email: 'contact@tabihair.mn',
          phone: '+97699001001'
        },
        subscription: {
          plan: 'professional',
          maxArtists: BUSINESS_PLANS.professional.maxArtists,
          maxLinesPerArtist: BUSINESS_PLANS.professional.maxLinesPerArtist,
          price: BUSINESS_PLANS.professional.price,
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
          isActive: true
        },
        status: 'active'
      },
      {
        name: 'Tabi Medical Center',
        description: 'Modern healthcare facility with experienced doctors and specialists',
        category: 'clinic',
        owner: testUsers[1]._id,
        contact: {
          email: 'info@tabimedical.mn',
          phone: '+97699001002'
        },
        subscription: {
          plan: 'enterprise',
          maxArtists: BUSINESS_PLANS.enterprise.maxArtists,
          maxLinesPerArtist: BUSINESS_PLANS.enterprise.maxLinesPerArtist,
          price: BUSINESS_PLANS.enterprise.price,
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
          isActive: true
        },
        status: 'active'
      },
      {
        name: 'Tabi Consulting',
        description: 'Business consulting and advisory services for growing companies',
        category: 'service',
        owner: testUsers[2]._id,
        contact: {
          email: 'hello@tabiconsulting.mn',
          phone: '+97699001003'
        },
        subscription: {
          plan: 'starter',
          maxArtists: BUSINESS_PLANS.starter.maxArtists,
          maxLinesPerArtist: BUSINESS_PLANS.starter.maxLinesPerArtist,
          price: BUSINESS_PLANS.starter.price,
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
          isActive: true
        },
        status: 'active'
      },
      {
        name: 'Elite Dental Clinic',
        description: 'Premium dental care with state-of-the-art equipment',
        category: 'clinic',
        owner: testUsers[3]._id,
        contact: {
          email: 'info@elitedental.mn',
          phone: '+97699001004'
        },
        subscription: {
          plan: 'professional',
          maxArtists: BUSINESS_PLANS.professional.maxArtists,
          maxLinesPerArtist: BUSINESS_PLANS.professional.maxLinesPerArtist,
          price: BUSINESS_PLANS.professional.price,
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
          isActive: true
        },
        status: 'active'
      },
      {
        name: 'Beauty Studio Mongolia',
        description: 'Full-service beauty studio offering hair, nails, and spa services',
        category: 'salon',
        owner: testUsers[4]._id,
        contact: {
          email: 'contact@beautystudio.mn',
          phone: '+97699001005'
        },
        subscription: {
          plan: 'enterprise',
          maxArtists: BUSINESS_PLANS.enterprise.maxArtists,
          maxLinesPerArtist: BUSINESS_PLANS.enterprise.maxLinesPerArtist,
          price: BUSINESS_PLANS.enterprise.price,
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
          isActive: true
        },
        status: 'active'
      }
    ];

    for (const businessData of newBusinesses) {
      // Check if business already exists
      const existing = await Business.findOne({ name: businessData.name });
      if (!existing) {
        const business = new Business(businessData);
        await business.save();
        console.log(`Created: ${business.name}`);
      } else {
        console.log(`Already exists: ${businessData.name}`);
      }
    }

    // 3. Test search functionality
    console.log('\n--- Testing Search Functionality ---');
    
    const searchQueries = ['tabi', 'hair', 'medical', 'consulting', 'salon', 'beauty', 'dental', 'clinic'];
    
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

    // 4. Show all active businesses
    console.log('\n--- All Active Businesses ---');
    const allActive = await Business.find({ status: 'active' })
      .select('name category subscription status')
      .sort({ name: 1 });
    
    console.log(`Total active businesses: ${allActive.length}`);
    allActive.forEach(business => {
      console.log(`- ${business.name} (${business.category}) - ${business.subscription.plan} plan - ${business.status}`);
    });

    console.log('\n--- Fix Complete ---');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

fixBusinessSearch();
