import { pgPool } from '../config/database';

async function enablePostGIS() {
  try {
    console.log('Enabling PostGIS extension...');

    // Enable PostGIS extension
    await pgPool.query('CREATE EXTENSION IF NOT EXISTS postgis;');
    console.log('✅ PostGIS extension enabled');

    // Add geography column to gyms table
    console.log('Adding geography column to gyms table...');
    
    // Check if column already exists
    const checkColumn = await pgPool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='gyms' AND column_name='location';
    `);

    if (checkColumn.rows.length === 0) {
      await pgPool.query(`
        ALTER TABLE gyms 
        ADD COLUMN location GEOGRAPHY(POINT, 4326);
      `);
      console.log('✅ Geography column added');

      // Update existing rows with location data from lat/lng
      await pgPool.query(`
        UPDATE gyms 
        SET location = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
        WHERE location IS NULL;
      `);
      console.log('✅ Existing gym locations updated');

      // Create spatial index for better performance
      await pgPool.query(`
        CREATE INDEX IF NOT EXISTS idx_gyms_location_gist 
        ON gyms USING GIST(location);
      `);
      console.log('✅ Spatial index created');
    } else {
      console.log('ℹ️  Geography column already exists');
    }

    console.log('✅ PostGIS setup complete!');
  } catch (error) {
    console.error('❌ Error enabling PostGIS:', error);
    throw error;
  } finally {
    await pgPool.end();
  }
}

enablePostGIS();
