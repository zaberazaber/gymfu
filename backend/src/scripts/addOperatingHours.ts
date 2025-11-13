import { pgPool } from '../config/database';

async function addOperatingHours() {
  try {
    console.log('Adding operating_hours column to gyms table...');

    // Check if column already exists
    const checkColumn = await pgPool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='gyms' AND column_name='operating_hours';
    `);

    if (checkColumn.rows.length === 0) {
      await pgPool.query(`
        ALTER TABLE gyms 
        ADD COLUMN operating_hours JSONB;
      `);
      console.log('✅ Operating hours column added');
    } else {
      console.log('ℹ️  Operating hours column already exists');
    }

    console.log('✅ Operating hours setup complete!');
  } catch (error) {
    console.error('❌ Error adding operating hours:', error);
    throw error;
  } finally {
    await pgPool.end();
  }
}

addOperatingHours();
