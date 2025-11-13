import { pgPool } from '../config/database';

async function addProfileFields() {
  try {
    console.log('Adding profile fields to users table...');

    const query = `
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS age INTEGER,
      ADD COLUMN IF NOT EXISTS gender VARCHAR(20),
      ADD COLUMN IF NOT EXISTS location JSONB,
      ADD COLUMN IF NOT EXISTS fitness_goals TEXT[],
      ADD COLUMN IF NOT EXISTS profile_image TEXT;
    `;

    await pgPool.query(query);

    console.log('✅ Profile fields added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding profile fields:', error);
    process.exit(1);
  }
}

addProfileFields();
