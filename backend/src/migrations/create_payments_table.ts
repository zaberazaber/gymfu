import { pgPool } from '../config/database';

export async function createPaymentsTable() {
  const client = await pgPool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Create payments table
    await client.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        gym_id INTEGER NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
        amount DECIMAL(10, 2) NOT NULL,
        platform_commission DECIMAL(10, 2) NOT NULL,
        gym_earnings DECIMAL(10, 2) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        razorpay_order_id VARCHAR(255),
        razorpay_payment_id VARCHAR(255),
        razorpay_signature VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT check_payment_status CHECK (status IN ('pending', 'success', 'failed', 'refunded'))
      );
    `);
    
    // Create index on booking_id for faster lookups
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON payments(booking_id);
    `);
    
    // Create index on user_id for user payment history
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
    `);
    
    // Create index on gym_id for gym earnings
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_payments_gym_id ON payments(gym_id);
    `);
    
    // Create index on status for filtering
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
    `);
    
    await client.query('COMMIT');
    console.log('✅ Successfully created payments table');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error creating payments table:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  createPaymentsTable()
    .then(() => {
      console.log('Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}
