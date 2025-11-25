import { pgPool } from '../config/database';

export async function addCurrentOccupancyField() {
  const client = await pgPool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Add currentOccupancy column to gyms table
    await client.query(`
      ALTER TABLE gyms 
      ADD COLUMN IF NOT EXISTS current_occupancy INTEGER DEFAULT 0;
    `);
    
    // Add check constraint to ensure currentOccupancy doesn't exceed capacity
    await client.query(`
      ALTER TABLE gyms 
      ADD CONSTRAINT check_occupancy_capacity 
      CHECK (current_occupancy >= 0 AND current_occupancy <= capacity);
    `);
    
    await client.query('COMMIT');
    console.log('✅ Successfully added current_occupancy field to gyms table');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error adding current_occupancy field:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  addCurrentOccupancyField()
    .then(() => {
      console.log('Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}
