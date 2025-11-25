import { pgPool } from '../config/database';

async function createBookingsTable() {
  try {
    console.log('Creating bookings table...');

    const query = `
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        gym_id INTEGER NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
        session_date TIMESTAMP NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        qr_code TEXT,
        qr_code_expiry TIMESTAMP,
        check_in_time TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT valid_status CHECK (status IN ('pending', 'confirmed', 'cancelled', 'checked_in', 'completed'))
      );

      CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
      CREATE INDEX IF NOT EXISTS idx_bookings_gym_id ON bookings(gym_id);
      CREATE INDEX IF NOT EXISTS idx_bookings_session_date ON bookings(session_date);
      CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
    `;

    await pgPool.query(query);
    console.log('✅ Bookings table created successfully!');
    console.log('✅ Indexes created for user_id, gym_id, session_date, and status');
  } catch (error) {
    console.error('❌ Error creating bookings table:', error);
    throw error;
  } finally {
    await pgPool.end();
  }
}

createBookingsTable();
