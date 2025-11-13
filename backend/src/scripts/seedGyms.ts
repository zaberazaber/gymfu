import { pgPool } from '../config/database';
import logger from '../config/logger';

const sampleGyms = [
    {
        name: 'PowerFit Gym',
        ownerId: 1,
        address: 'Shop 12, Andheri West, Mumbai',
        latitude: 19.1136,
        longitude: 72.8697,
        city: 'Mumbai',
        pincode: '400053',
        amenities: ['Cardio', 'Weights', 'Shower', 'Locker', 'AC'],
        basePrice: 150,
        capacity: 50,
        rating: 4.5,
        isVerified: true,
        operatingHours: {
            monday: { open: '06:00', close: '22:00' },
            tuesday: { open: '06:00', close: '22:00' },
            wednesday: { open: '06:00', close: '22:00' },
            thursday: { open: '06:00', close: '22:00' },
            friday: { open: '06:00', close: '22:00' },
            saturday: { open: '07:00', close: '21:00' },
            sunday: { open: '07:00', close: '21:00' },
        },
    },
    {
        name: 'FitZone Studio',
        ownerId: 1,
        address: 'Bandra West, Near Linking Road, Mumbai',
        latitude: 19.0596,
        longitude: 72.8295,
        city: 'Mumbai',
        pincode: '400050',
        amenities: ['Cardio', 'Weights', 'Parking', 'AC'],
        basePrice: 200,
        capacity: 40,
        rating: 4.7,
        isVerified: true,
        operatingHours: {
            monday: { open: '05:30', close: '23:00' },
            tuesday: { open: '05:30', close: '23:00' },
            wednesday: { open: '05:30', close: '23:00' },
            thursday: { open: '05:30', close: '23:00' },
            friday: { open: '05:30', close: '23:00' },
            saturday: { open: '06:00', close: '22:00' },
            sunday: { open: '06:00', close: '22:00' },
        },
    },
    {
        name: 'Iron Paradise',
        ownerId: 1,
        address: 'Juhu, Near Beach, Mumbai',
        latitude: 19.1075,
        longitude: 72.8263,
        city: 'Mumbai',
        pincode: '400049',
        amenities: ['Weights', 'Shower', 'Locker', 'Parking'],
        basePrice: 180,
        capacity: 60,
        rating: 4.3,
        isVerified: true,
        operatingHours: {
            monday: { open: '06:00', close: '22:00' },
            tuesday: { open: '06:00', close: '22:00' },
            wednesday: { open: '06:00', close: '22:00' },
            thursday: { open: '06:00', close: '22:00' },
            friday: { open: '06:00', close: '22:00' },
            saturday: { open: '07:00', close: '20:00' },
            sunday: { open: '07:00', close: '20:00' },
        },
    },
    {
        name: 'Elite Fitness Center',
        ownerId: 1,
        address: 'Powai, Near Lake, Mumbai',
        latitude: 19.1197,
        longitude: 72.9059,
        city: 'Mumbai',
        pincode: '400076',
        amenities: ['Cardio', 'Weights', 'Shower', 'Locker', 'AC', 'Parking'],
        basePrice: 250,
        capacity: 80,
        rating: 4.8,
        isVerified: true,
        operatingHours: {
            monday: { open: '05:00', close: '23:00' },
            tuesday: { open: '05:00', close: '23:00' },
            wednesday: { open: '05:00', close: '23:00' },
            thursday: { open: '05:00', close: '23:00' },
            friday: { open: '05:00', close: '23:00' },
            saturday: { open: '06:00', close: '22:00' },
            sunday: { open: '06:00', close: '22:00' },
        },
    },
    {
        name: 'BodyBuilders Gym',
        ownerId: 1,
        address: 'Goregaon East, Mumbai',
        latitude: 19.1663,
        longitude: 72.8526,
        city: 'Mumbai',
        pincode: '400063',
        amenities: ['Weights', 'Cardio', 'Shower', 'Locker'],
        basePrice: 120,
        capacity: 45,
        rating: 4.2,
        isVerified: true,
        operatingHours: {
            monday: { open: '06:00', close: '22:00' },
            tuesday: { open: '06:00', close: '22:00' },
            wednesday: { open: '06:00', close: '22:00' },
            thursday: { open: '06:00', close: '22:00' },
            friday: { open: '06:00', close: '22:00' },
            saturday: { open: '07:00', close: '21:00' },
            sunday: { open: '07:00', close: '21:00' },
        },
    },
    {
        name: 'Flex Gym & Spa',
        ownerId: 1,
        address: 'Malad West, Mumbai',
        latitude: 19.1868,
        longitude: 72.8347,
        city: 'Mumbai',
        pincode: '400064',
        amenities: ['Cardio', 'Weights', 'Shower', 'AC', 'Parking'],
        basePrice: 170,
        capacity: 55,
        rating: 4.4,
        isVerified: true,
        operatingHours: {
            monday: { open: '06:00', close: '22:00' },
            tuesday: { open: '06:00', close: '22:00' },
            wednesday: { open: '06:00', close: '22:00' },
            thursday: { open: '06:00', close: '22:00' },
            friday: { open: '06:00', close: '22:00' },
            saturday: { open: '07:00', close: '21:00' },
            sunday: { open: '07:00', close: '21:00' },
        },
    },
];

async function seedGyms() {
    try {
        logger.info('Starting gym seeding...');

        // Check if gyms already exist
        const checkResult = await pgPool.query('SELECT COUNT(*) FROM gyms');
        const count = parseInt(checkResult.rows[0].count);

        if (count > 0) {
            logger.info(`Database already has ${count} gyms. Skipping seed.`);
            logger.info('To re-seed, delete existing gyms first: DELETE FROM gyms;');
            process.exit(0);
        }

        // Insert sample gyms
        for (const gym of sampleGyms) {
            const query = `
        INSERT INTO gyms (
          name, owner_id, address, latitude, longitude, city, pincode,
          amenities, base_price, capacity, rating, is_verified, operating_hours
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING id, name
      `;

            const values = [
                gym.name,
                gym.ownerId,
                gym.address,
                gym.latitude,
                gym.longitude,
                gym.city,
                gym.pincode,
                gym.amenities,
                gym.basePrice,
                gym.capacity,
                gym.rating,
                gym.isVerified,
                JSON.stringify(gym.operatingHours),
            ];

            const result = await pgPool.query(query, values);
            logger.info(`✅ Created gym: ${result.rows[0].name} (ID: ${result.rows[0].id})`);
        }

        logger.info(`\n🎉 Successfully seeded ${sampleGyms.length} gyms!`);
        logger.info('\nSample gyms added in Mumbai:');
        logger.info('- PowerFit Gym (Andheri West)');
        logger.info('- FitZone Studio (Bandra West)');
        logger.info('- Iron Paradise (Juhu)');
        logger.info('- Elite Fitness Center (Powai)');
        logger.info('- BodyBuilders Gym (Goregaon East)');
        logger.info('- Flex Gym & Spa (Malad West)');
        logger.info('\nYou can now search for gyms near Mumbai coordinates:');
        logger.info('Latitude: 19.0760, Longitude: 72.8777');

        process.exit(0);
    } catch (error) {
        logger.error('Error seeding gyms:', error);
        process.exit(1);
    }
}

seedGyms();
