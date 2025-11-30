import { pgPool } from '../config/database';

async function addAdminFields() {
  const client = await pgPool.connect();
  
  try {
    console.log('🔄 Adding admin fields to users table...');
    
    await client.query('BEGIN');
    
    // Add isAdmin and role fields to users table
    await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user'
    `);
    
    // Create admin_activity_logs table for audit trail
    await client.query(`
      CREATE TABLE IF NOT EXISTS admin_activity_logs (
        id SERIAL PRIMARY KEY,
        admin_id INTEGER NOT NULL REFERENCES users(id),
        action VARCHAR(100) NOT NULL,
        entity_type VARCHAR(50) NOT NULL,
        entity_id INTEGER,
        details JSONB DEFAULT '{}',
        ip_address VARCHAR(45),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_is_admin ON users(is_admin);
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
      CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_admin_id ON admin_activity_logs(admin_id);
      CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_created_at ON admin_activity_logs(created_at DESC);
    `);
    
    await client.query('COMMIT');
    console.log('✅ Admin fields added successfully');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error adding admin fields:', error);
    throw error;
  } finally {
    client.release();
  }
}

if (require.main === module) {
  addAdminFields()
    .then(() => {
      console.log('🎉 Admin migration complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Failed to run admin migration:', error);
      process.exit(1);
    });
}

export default addAdminFields;
