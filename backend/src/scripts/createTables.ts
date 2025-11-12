import { pgPool } from '../config/database';

const createUsersTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      phone_number VARCHAR(20) UNIQUE,
      email VARCHAR(255) UNIQUE,
      name VARCHAR(255) NOT NULL,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Create index on phone_number and email for faster lookups
    CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone_number);
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  `;

  try {
    await pgPool.query(query);
    console.log('✅ Users table created successfully');
  } catch (error) {
    console.error('❌ Error creating users table:', error);
    throw error;
  }
};

const createTables = async () => {
  try {
    console.log('📦 Creating database tables...');
    await createUsersTable();
    console.log('🎉 All tables created successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to create tables:', error);
    process.exit(1);
  }
};

// Run if executed directly
if (require.main === module) {
  createTables();
}

export { createTables };
