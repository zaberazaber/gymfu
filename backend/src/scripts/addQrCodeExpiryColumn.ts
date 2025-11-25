import { pgPool } from '../config/database';

async function addQrCodeExpiryColumn() {
  try {
    console.log('Adding qr_code_expiry column to bookings table...');

    const query = `
      ALTER TABLE bookings 
      ADD COLUMN IF NOT EXISTS qr_code_expiry TIMESTAMP;
    `;

    await pgPool.query(query);
    console.log('✅ qr_code_expiry column added successfully!');
  } catch (error) {
    console.error('❌ Error adding qr_code_expiry column:', error);
    throw error;
  } finally {
    await pgPool.end();
  }
}

addQrCodeExpiryColumn();
