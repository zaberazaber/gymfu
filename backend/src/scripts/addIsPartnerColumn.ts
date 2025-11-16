import { pgPool } from '../config/database';

async function addIsPartnerColumn() {
  try {
    console.log('Adding is_partner column to users table...');

    // Check if column already exists
    const checkQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='users' AND column_name='is_partner';
    `;

    const checkResult = await pgPool.query(checkQuery);

    if (checkResult.rows.length > 0) {
      console.log('✅ is_partner column already exists');
      return;
    }

    // Add the column
    const alterQuery = `
      ALTER TABLE users 
      ADD COLUMN is_partner BOOLEAN DEFAULT FALSE;
    `;

    await pgPool.query(alterQuery);

    console.log('✅ Successfully added is_partner column to users table');
    console.log('   Default value: FALSE');
    console.log('   All existing users are set as regular users (not partners)');

  } catch (error) {
    console.error('❌ Error adding is_partner column:', error);
    throw error;
  } finally {
    await pgPool.end();
  }
}

// Run the migration
addIsPartnerColumn()
  .then(() => {
    console.log('\n✨ Migration completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
