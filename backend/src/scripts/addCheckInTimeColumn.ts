import { pgPool } from '../config/database';

async function addCheckInTimeColumn() {
  try {
    console.log('Adding check_in_time column to bookings table...');

    const query = `
      ALTER TABLE bookings 
      ADD COLUMN IF NOT EXISTS check_in_time TIMESTAMP;
    `;

    await pgPool.query(query);
    console.log('✅ check_in_time column added successfully!');
  } catch (error) {
    console.error('❌ Error adding check_in_time column:', error);
    throw error;
  } finally {
    await pgPool.end();
  }
}

addCheckInTimeColumn();
