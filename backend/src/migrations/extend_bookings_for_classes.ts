import { Pool } from 'pg';
import { pgPool as pool } from '../config/database';

export async function up(): Promise<void> {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Add session_type column
    await client.query(`
      ALTER TABLE bookings
      ADD COLUMN IF NOT EXISTS session_type VARCHAR(10) DEFAULT 'gym'
      CHECK (session_type IN ('gym', 'class'))
    `);

    // Add class_id column
    await client.query(`
      ALTER TABLE bookings
      ADD COLUMN IF NOT EXISTS class_id INTEGER REFERENCES classes(id) ON DELETE CASCADE
    `);

    // Create index for class_id
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_bookings_class_id ON bookings(class_id)
    `);

    // Update existing bookings to have session_type = 'gym'
    await client.query(`
      UPDATE bookings
      SET session_type = 'gym'
      WHERE session_type IS NULL
    `);

    await client.query('COMMIT');
    console.log('✅ Bookings table extended for classes successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error extending bookings table:', error);
    throw error;
  } finally {
    client.release();
  }
}

export async function down(): Promise<void> {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    await client.query('DROP INDEX IF EXISTS idx_bookings_class_id');
    await client.query('ALTER TABLE bookings DROP COLUMN IF EXISTS class_id');
    await client.query('ALTER TABLE bookings DROP COLUMN IF EXISTS session_type');
    
    await client.query('COMMIT');
    console.log('✅ Bookings table class extensions removed successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error removing bookings table extensions:', error);
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
