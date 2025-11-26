import { pgPool } from '../config/database';

/**
 * Migration: Add refund fields to payments table
 * Run with: npm run db:migrate-refunds
 */
export async function addRefundFields() {
  const client = await pgPool.connect();

  try {
    console.log('Starting migration: Add refund fields to payments table...');

    await client.query('BEGIN');

    // Add razorpay_refund_id column
    await client.query(`
      ALTER TABLE payments
      ADD COLUMN IF NOT EXISTS razorpay_refund_id VARCHAR(255)
    `);
    console.log('✓ Added razorpay_refund_id column');

    // Add refund_amount column
    await client.query(`
      ALTER TABLE payments
      ADD COLUMN IF NOT EXISTS refund_amount DECIMAL(10, 2)
    `);
    console.log('✓ Added refund_amount column');

    // Add index on razorpay_refund_id for faster lookups
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_payments_razorpay_refund_id
      ON payments(razorpay_refund_id)
    `);
    console.log('✓ Added index on razorpay_refund_id');

    await client.query('COMMIT');
    console.log('✅ Migration completed successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run migration if called directly
if (require.main === module) {
  addRefundFields()
    .then(() => {
      console.log('Migration script finished');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration script failed:', error);
      process.exit(1);
    });
}

export default addRefundFields;
