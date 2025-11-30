import { pgPool } from '../config/database';

/**
 * Migration: Create corporate wellness tables
 * Run with: npx ts-node src/migrations/create_corporate_tables.ts
 */
export async function createCorporateTables() {
  const client = await pgPool.connect();

  try {
    console.log('Starting migration: Create corporate wellness tables...');

    await client.query('BEGIN');

    // Create corporate_accounts table
    await client.query(`
      CREATE TABLE IF NOT EXISTS corporate_accounts (
        id SERIAL PRIMARY KEY,
        company_name VARCHAR(255) NOT NULL,
        contact_email VARCHAR(255) NOT NULL UNIQUE,
        contact_phone VARCHAR(20) NOT NULL,
        contact_person VARCHAR(255) NOT NULL,
        package_type VARCHAR(50) NOT NULL CHECK (package_type IN ('basic', 'standard', 'premium')),
        total_sessions INTEGER NOT NULL CHECK (total_sessions > 0),
        used_sessions INTEGER DEFAULT 0 CHECK (used_sessions >= 0),
        price_per_session DECIMAL(10, 2) NOT NULL,
        total_amount DECIMAL(10, 2) NOT NULL,
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'suspended')),
        start_date DATE NOT NULL,
        expiry_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Created corporate_accounts table');

    // Create employee_access table
    await client.query(`
      CREATE TABLE IF NOT EXISTS employee_access (
        id SERIAL PRIMARY KEY,
        corporate_account_id INTEGER NOT NULL REFERENCES corporate_accounts(id) ON DELETE CASCADE,
        employee_email VARCHAR(255) NOT NULL,
        employee_name VARCHAR(255) NOT NULL,
        access_code VARCHAR(20) NOT NULL UNIQUE,
        sessions_used INTEGER DEFAULT 0 CHECK (sessions_used >= 0),
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'revoked')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(corporate_account_id, employee_email)
      )
    `);
    console.log('✓ Created employee_access table');

    // Create indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_corporate_accounts_status 
      ON corporate_accounts(status);
    `);
    console.log('✓ Created index on corporate_accounts.status');

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_corporate_accounts_expiry 
      ON corporate_accounts(expiry_date);
    `);
    console.log('✓ Created index on corporate_accounts.expiry_date');

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_employee_access_code 
      ON employee_access(access_code);
    `);
    console.log('✓ Created index on employee_access.access_code');

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_employee_access_corporate 
      ON employee_access(corporate_account_id);
    `);
    console.log('✓ Created index on employee_access.corporate_account_id');

    // Add trigger to update updated_at timestamp
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    await client.query(`
      DROP TRIGGER IF EXISTS update_corporate_accounts_updated_at ON corporate_accounts;
      CREATE TRIGGER update_corporate_accounts_updated_at
        BEFORE UPDATE ON corporate_accounts
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);

    await client.query(`
      DROP TRIGGER IF EXISTS update_employee_access_updated_at ON employee_access;
      CREATE TRIGGER update_employee_access_updated_at
        BEFORE UPDATE ON employee_access
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);
    console.log('✓ Created update triggers');

    await client.query('COMMIT');
    console.log('✅ Migration completed successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run migration if called directly
if (require.main === module) {
  createCorporateTables()
    .then(() => {
      console.log('Migration script finished');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration script failed:', error);
      process.exit(1);
    });
}

export default createCorporateTables;
