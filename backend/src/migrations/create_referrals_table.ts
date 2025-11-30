import { pgPool } from '../config/database';

async function createReferralsTable() {
  const client = await pgPool.connect();
  
  try {
    console.log('🔄 Creating referrals table...');
    
    await client.query('BEGIN');
    
    // Create referrals table
    await client.query(`
      CREATE TABLE IF NOT EXISTS referrals (
        id SERIAL PRIMARY KEY,
        referrer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        referred_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(20) DEFAULT 'pending',
        rewards_credited BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(referrer_id, referred_user_id)
      )
    `);
    
    // Create indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id)
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_referrals_referred_user ON referrals(referred_user_id)
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status)
    `);
    
    await client.query('COMMIT');
    
    console.log('✅ Referrals table created successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error creating referrals table:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run migration if called directly
if (require.main === module) {
  createReferralsTable()
    .then(() => {
      console.log('Migration completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

export default createReferralsTable;
