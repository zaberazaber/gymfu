import { Pool } from 'pg';

async function createGymsTable() {
  // Use Render's DATABASE_URL from environment
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔄 Connecting to Render database...');
    
    // Test connection
    await pool.query('SELECT NOW()');
    console.log('✅ Connected to database');

    console.log('🔄 Creating gyms table...');

    const query = `
      CREATE TABLE IF NOT EXISTS gyms (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        address TEXT NOT NULL,
        latitude DECIMAL(10, 8) NOT NULL,
        longitude DECIMAL(11, 8) NOT NULL,
        city VARCHAR(100) NOT NULL,
        pincode VARCHAR(10) NOT NULL,
        amenities TEXT[] DEFAULT '{}',
        base_price DECIMAL(10, 2) NOT NULL,
        capacity INTEGER NOT NULL,
        rating DECIMAL(3, 2) DEFAULT 0.0,
        is_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_gyms_owner_id ON gyms(owner_id);
      CREATE INDEX IF NOT EXISTS idx_gyms_city ON gyms(city);
      CREATE INDEX IF NOT EXISTS idx_gyms_pincode ON gyms(pincode);
      CREATE INDEX IF NOT EXISTS idx_gyms_is_verified ON gyms(is_verified);
      CREATE INDEX IF NOT EXISTS idx_gyms_location ON gyms(latitude, longitude);
    `;

    await pool.query(query);
    console.log('✅ Gyms table created successfully!');
    console.log('✅ Indexes created for owner_id, city, pincode, is_verified, and location');

    // Verify table exists
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'gyms'
      ORDER BY ordinal_position;
    `);
    
    console.log('\n📋 Gyms table columns:');
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type}`);
    });

  } catch (error) {
    console.error('❌ Error creating gyms table:', error);
    throw error;
  } finally {
    await pool.end();
    console.log('🔌 Database connection closed');
  }
}

createGymsTable();
