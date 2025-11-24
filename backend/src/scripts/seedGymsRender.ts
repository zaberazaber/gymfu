import { Pool } from 'pg';

async function seedGyms() {
  // Use Render's DATABASE_URL from environment
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔄 Connecting to Render database...');
    
    // Test connection
    await pool.query('SELECT NOW()');
    console.log('✅ Connected to database');

    // Check if gyms table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'gyms'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.log('❌ Gyms table does not exist. Please run db:create-gyms-render first.');
      process.exit(1);
    }

    console.log('🔄 Seeding gyms...');

    // Get a partner user to own these gyms
    const userResult = await pool.query(`
      SELECT id FROM users WHERE is_partner = true LIMIT 1
    `);

    let ownerId: number;
    if (userResult.rows.length === 0) {
      console.log('⚠️  No partner user found. Creating one...');
      const newUser = await pool.query(`
        INSERT INTO users (phone_number, name, is_partner, is_verified)
        VALUES ('+919999999999', 'Demo Partner', true, true)
        RETURNING id
      `);
      ownerId = newUser.rows[0].id;
      console.log('✅ Created demo partner user');
    } else {
      ownerId = userResult.rows[0].id;
      console.log('✅ Using existing partner user');
    }

    // Sample gyms in Mumbai area
    const gyms = [
      {
        name: 'PowerFit Gym',
        address: 'Shop 12, Andheri West, Mumbai',
        latitude: 19.1136,
        longitude: 72.8697,
        city: 'Mumbai',
        pincode: '400053',
        amenities: ['Cardio', 'Weights', 'Shower', 'Locker'],
        basePrice: 500,
        capacity: 50,
        rating: 4.5,
      },
      {
        name: 'FitZone Bandra',
        address: '45 Linking Road, Bandra West, Mumbai',
        latitude: 19.0596,
        longitude: 72.8295,
        city: 'Mumbai',
        pincode: '400050',
        amenities: ['Cardio', 'Weights', 'AC', 'Parking', 'Shower'],
        basePrice: 800,
        capacity: 75,
        rating: 4.7,
      },
      {
        name: 'Iron Paradise',
        address: 'Juhu Tara Road, Juhu, Mumbai',
        latitude: 19.1075,
        longitude: 72.8263,
        city: 'Mumbai',
        pincode: '400049',
        amenities: ['Weights', 'Cardio', 'Locker', 'Shower', 'AC'],
        basePrice: 600,
        capacity: 60,
        rating: 4.3,
      },
      {
        name: 'Flex Fitness Studio',
        address: 'Worli Sea Face, Worli, Mumbai',
        latitude: 19.0176,
        longitude: 72.8187,
        city: 'Mumbai',
        pincode: '400018',
        amenities: ['Cardio', 'Weights', 'AC', 'Parking'],
        basePrice: 700,
        capacity: 40,
        rating: 4.6,
      },
      {
        name: 'Muscle Factory',
        address: 'Goregaon East, Mumbai',
        latitude: 19.1663,
        longitude: 72.8526,
        city: 'Mumbai',
        pincode: '400063',
        amenities: ['Weights', 'Cardio', 'Shower', 'Locker', 'Parking'],
        basePrice: 450,
        capacity: 55,
        rating: 4.2,
      },
      {
        name: 'Elite Fitness Center',
        address: 'Powai, Mumbai',
        latitude: 19.1176,
        longitude: 72.9060,
        city: 'Mumbai',
        pincode: '400076',
        amenities: ['Cardio', 'Weights', 'AC', 'Shower', 'Locker', 'Parking'],
        basePrice: 900,
        capacity: 80,
        rating: 4.8,
      },
      {
        name: 'BodyBuilders Gym',
        address: 'Malad West, Mumbai',
        latitude: 19.1864,
        longitude: 72.8326,
        city: 'Mumbai',
        pincode: '400064',
        amenities: ['Weights', 'Cardio', 'Locker'],
        basePrice: 400,
        capacity: 45,
        rating: 4.0,
      },
      {
        name: 'Cardio Kings',
        address: 'Dadar West, Mumbai',
        latitude: 19.0178,
        longitude: 72.8478,
        city: 'Mumbai',
        pincode: '400028',
        amenities: ['Cardio', 'AC', 'Shower', 'Locker'],
        basePrice: 550,
        capacity: 35,
        rating: 4.4,
      },
    ];

    // Check if gyms already exist
    const existingGyms = await pool.query('SELECT COUNT(*) FROM gyms');
    const count = parseInt(existingGyms.rows[0].count);

    if (count > 0) {
      console.log(`⚠️  Found ${count} existing gyms. Skipping seed.`);
      console.log('💡 To re-seed, delete existing gyms first: DELETE FROM gyms;');
      return;
    }

    // Insert gyms
    for (const gym of gyms) {
      await pool.query(
        `INSERT INTO gyms (
          name, owner_id, address, latitude, longitude, city, pincode,
          amenities, base_price, capacity, rating, is_verified
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, true)`,
        [
          gym.name,
          ownerId,
          gym.address,
          gym.latitude,
          gym.longitude,
          gym.city,
          gym.pincode,
          gym.amenities,
          gym.basePrice,
          gym.capacity,
          gym.rating,
        ]
      );
    }

    console.log(`✅ Successfully seeded ${gyms.length} gyms!`);

    // Show summary
    const summary = await pool.query(`
      SELECT 
        COUNT(*) as total,
        AVG(base_price) as avg_price,
        MIN(base_price) as min_price,
        MAX(base_price) as max_price
      FROM gyms
    `);

    console.log('\n📊 Gyms Summary:');
    console.log(`  Total Gyms: ${summary.rows[0].total}`);
    console.log(`  Avg Price: ₹${Math.round(summary.rows[0].avg_price)}`);
    console.log(`  Price Range: ₹${summary.rows[0].min_price} - ₹${summary.rows[0].max_price}`);

  } catch (error) {
    console.error('❌ Error seeding gyms:', error);
    throw error;
  } finally {
    await pool.end();
    console.log('🔌 Database connection closed');
  }
}

seedGyms();
