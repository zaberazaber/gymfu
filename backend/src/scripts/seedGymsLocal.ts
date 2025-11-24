import { pgPool } from '../config/database';

async function seedGymsLocal() {
  try {
    console.log('🔄 Seeding gyms in local database...');

    // Get a partner user to own these gyms
    const userResult = await pgPool.query(`
      SELECT id FROM users WHERE is_partner = true LIMIT 1
    `);

    let ownerId: number;
    if (userResult.rows.length === 0) {
      console.log('⚠️  No partner user found. Creating one...');
      const newUser = await pgPool.query(`
        INSERT INTO users (phone_number, name, is_partner, is_verified, password)
        VALUES ('+919999999999', 'Demo Partner', true, true, '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890')
        RETURNING id
      `);
      ownerId = newUser.rows[0].id;
      console.log('✅ Created demo partner user');
    } else {
      ownerId = userResult.rows[0].id;
      console.log('✅ Using existing partner user');
    }

    // Sample gyms across Delhi and Mumbai
    const gyms = [
      // Mumbai Gyms
      {
        name: 'PowerFit Gym Andheri',
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
        name: 'Iron Paradise Juhu',
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
        name: 'Flex Fitness Worli',
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
        name: 'Muscle Factory Goregaon',
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
        name: 'Elite Fitness Powai',
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
        name: 'BodyBuilders Malad',
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
        name: 'Cardio Kings Dadar',
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
      // Delhi Gyms
      {
        name: 'Gold\'s Gym Connaught Place',
        address: 'Connaught Place, New Delhi',
        latitude: 28.6315,
        longitude: 77.2167,
        city: 'Delhi',
        pincode: '110001',
        amenities: ['Cardio', 'Weights', 'AC', 'Shower', 'Locker', 'Parking'],
        basePrice: 1200,
        capacity: 100,
        rating: 4.9,
      },
      {
        name: 'Fitness First Saket',
        address: 'Saket, South Delhi',
        latitude: 28.5244,
        longitude: 77.2066,
        city: 'Delhi',
        pincode: '110017',
        amenities: ['Cardio', 'Weights', 'AC', 'Shower', 'Locker', 'Parking'],
        basePrice: 1000,
        capacity: 90,
        rating: 4.7,
      },
      {
        name: 'Anytime Fitness Dwarka',
        address: 'Sector 12, Dwarka, New Delhi',
        latitude: 28.5921,
        longitude: 77.0460,
        city: 'Delhi',
        pincode: '110075',
        amenities: ['Cardio', 'Weights', 'AC', 'Shower', 'Locker'],
        basePrice: 800,
        capacity: 70,
        rating: 4.5,
      },
      {
        name: 'Cult.fit Lajpat Nagar',
        address: 'Lajpat Nagar, South Delhi',
        latitude: 28.5677,
        longitude: 77.2431,
        city: 'Delhi',
        pincode: '110024',
        amenities: ['Cardio', 'Weights', 'AC', 'Shower', 'Locker'],
        basePrice: 900,
        capacity: 60,
        rating: 4.6,
      },
      {
        name: 'Talwalkars Gym Rohini',
        address: 'Sector 7, Rohini, Delhi',
        latitude: 28.7041,
        longitude: 77.1025,
        city: 'Delhi',
        pincode: '110085',
        amenities: ['Cardio', 'Weights', 'Shower', 'Locker', 'Parking'],
        basePrice: 700,
        capacity: 65,
        rating: 4.3,
      },
      {
        name: 'Snap Fitness Vasant Kunj',
        address: 'Vasant Kunj, South West Delhi',
        latitude: 28.5200,
        longitude: 77.1600,
        city: 'Delhi',
        pincode: '110070',
        amenities: ['Cardio', 'Weights', 'AC', 'Shower', 'Locker', 'Parking'],
        basePrice: 950,
        capacity: 55,
        rating: 4.4,
      },
      {
        name: 'The Gym Karol Bagh',
        address: 'Karol Bagh, Central Delhi',
        latitude: 28.6519,
        longitude: 77.1909,
        city: 'Delhi',
        pincode: '110005',
        amenities: ['Cardio', 'Weights', 'Shower', 'Locker'],
        basePrice: 600,
        capacity: 50,
        rating: 4.2,
      },
      {
        name: 'Iron Fitness Pitampura',
        address: 'Pitampura, North West Delhi',
        latitude: 28.6942,
        longitude: 77.1314,
        city: 'Delhi',
        pincode: '110034',
        amenities: ['Weights', 'Cardio', 'Locker', 'Parking'],
        basePrice: 550,
        capacity: 45,
        rating: 4.1,
      },
    ];

    // Check if gyms already exist
    const existingGyms = await pgPool.query('SELECT COUNT(*) FROM gyms');
    const count = parseInt(existingGyms.rows[0].count);

    if (count > 0) {
      console.log(`⚠️  Found ${count} existing gyms. Deleting and re-seeding...`);
      await pgPool.query('DELETE FROM gyms');
      console.log('🗑️  Deleted existing gyms');
    }

    // Insert gyms
    let insertedCount = 0;
    for (const gym of gyms) {
      await pgPool.query(
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
      insertedCount++;
    }

    console.log(`✅ Successfully seeded ${insertedCount} gyms!`);

    // Show summary by city
    const summary = await pgPool.query(`
      SELECT 
        city,
        COUNT(*) as total,
        AVG(base_price) as avg_price,
        MIN(base_price) as min_price,
        MAX(base_price) as max_price
      FROM gyms
      GROUP BY city
      ORDER BY city
    `);

    console.log('\n📊 Gyms Summary by City:');
    summary.rows.forEach(row => {
      console.log(`\n  ${row.city}:`);
      console.log(`    Total Gyms: ${row.total}`);
      console.log(`    Avg Price: ₹${Math.round(row.avg_price)}`);
      console.log(`    Price Range: ₹${row.min_price} - ₹${row.max_price}`);
    });

    // Show total summary
    const totalSummary = await pgPool.query(`
      SELECT 
        COUNT(*) as total,
        AVG(base_price) as avg_price
      FROM gyms
    `);

    console.log('\n📈 Overall Summary:');
    console.log(`  Total Gyms: ${totalSummary.rows[0].total}`);
    console.log(`  Average Price: ₹${Math.round(totalSummary.rows[0].avg_price)}`);

  } catch (error) {
    console.error('❌ Error seeding gyms:', error);
    throw error;
  } finally {
    await pgPool.end();
  }
}

seedGymsLocal();
