import { pgPool } from '../config/database';

async function addReferralFields() {
  const client = await pgPool.connect();
  
  try {
    console.log('🔄 Adding referral fields to users table...');
    
    await client.query('BEGIN');
    
    // Add referral_code column (unique, auto-generated)
    await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS referral_code VARCHAR(10) UNIQUE
    `);
    
    // Add referred_by column (references another user's ID)
    await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS referred_by INTEGER REFERENCES users(id)
    `);
    
    // Add reward_points column (default 0)
    await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS reward_points INTEGER DEFAULT 0
    `);
    
    // Generate referral codes for existing users
    await client.query(`
      UPDATE users 
      SET referral_code = UPPER(SUBSTRING(MD5(RANDOM()::TEXT || id::TEXT) FROM 1 FOR 8))
      WHERE referral_code IS NULL
    `);
    
    // Create index on referral_code for faster lookups
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code)
    `);
    
    // Create index on referred_by for faster lookups
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_referred_by ON users(referred_by)
    `);
    
    await client.query('COMMIT');
    
    console.log('✅ Referral fields added successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error adding referral fields:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run migration if called directly
if (require.main === module) {
  addReferralFields()
    .then(() => {
      console.log('Migration completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

export default addReferralFields;
