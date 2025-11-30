import { Pool } from 'pg';
import { pgPool as pool } from '../config/database';

export async function up(): Promise<void> {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Create instructors table
    await client.query(`
      CREATE TABLE IF NOT EXISTS instructors (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        bio TEXT NOT NULL,
        specialization VARCHAR(255) NOT NULL,
        rating DECIMAL(3, 2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
        profile_image TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create classes table
    await client.query(`
      CREATE TABLE IF NOT EXISTS classes (
        id SERIAL PRIMARY KEY,
        gym_id INTEGER NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
        instructor_id INTEGER NOT NULL REFERENCES instructors(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL CHECK (type IN ('yoga', 'zumba', 'dance', 'pilates', 'spinning', 'crossfit', 'boxing')),
        schedule JSONB NOT NULL,
        capacity INTEGER NOT NULL CHECK (capacity > 0),
        price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_classes_gym_id ON classes(gym_id);
      CREATE INDEX IF NOT EXISTS idx_classes_instructor_id ON classes(instructor_id);
      CREATE INDEX IF NOT EXISTS idx_classes_type ON classes(type);
    `);

    await client.query('COMMIT');
    console.log('✅ Classes tables created successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error creating classes tables:', error);
    throw error;
  } finally {
    client.release();
  }
}

export async function down(): Promise<void> {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    await client.query('DROP TABLE IF EXISTS classes CASCADE');
    await client.query('DROP TABLE IF NOT EXISTS instructors CASCADE');
    
    await client.query('COMMIT');
    console.log('✅ Classes tables dropped successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error dropping classes tables:', error);
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
