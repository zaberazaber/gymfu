import { pgPool } from '../config/database';

export async function up() {
  const client = await pgPool.connect();
  try {
    await client.query(`
      -- Add order_id column to payments table
      ALTER TABLE payments
      ADD COLUMN IF NOT EXISTS order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE;

      -- Make booking_id nullable since marketplace orders don't have bookings
      ALTER TABLE payments
      ALTER COLUMN booking_id DROP NOT NULL;

      -- Make gym_id nullable since marketplace orders don't have gyms
      ALTER TABLE payments
      ALTER COLUMN gym_id DROP NOT NULL;

      -- Add check constraint to ensure either booking_id or order_id is present
      ALTER TABLE payments
      ADD CONSTRAINT payment_type_check 
      CHECK (
        (booking_id IS NOT NULL AND order_id IS NULL) OR
        (booking_id IS NULL AND order_id IS NOT NULL)
      );

      -- Create index on order_id
      CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
    `);

    console.log('✅ Marketplace payments migration completed successfully');
  } catch (error) {
    console.error('❌ Error in marketplace payments migration:', error);
    throw error;
  } finally {
    client.release();
  }
}

export async function down() {
  const client = await pgPool.connect();
  try {
    await client.query(`
      DROP INDEX IF EXISTS idx_payments_order_id;
      ALTER TABLE payments DROP CONSTRAINT IF EXISTS payment_type_check;
      ALTER TABLE payments ALTER COLUMN gym_id SET NOT NULL;
      ALTER TABLE payments ALTER COLUMN booking_id SET NOT NULL;
      ALTER TABLE payments DROP COLUMN IF EXISTS order_id;
    `);

    console.log('✅ Marketplace payments migration rolled back successfully');
  } catch (error) {
    console.error('❌ Error rolling back marketplace payments migration:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run migration if called directly
if (require.main === module) {
  up()
    .then(() => {
      console.log('Migration completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}
