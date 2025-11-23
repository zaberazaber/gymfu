import { pgPool } from '../config/database';

async function addIsPartnerColumn() {
  try {
    console.log('🔄 Adding is_partner column to users table...');

    // Simply add the column - PostgreSQL will ignore if it exists
    const query = `
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS is_partner BOOLEAN DEFAULT FALSE;
    `;

    await pgPool.query(query);
    console.log('✅ is_partner column added successfully');

    // Verify the column exists
    const verifyQuery = `
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'users' AND column_name = 'is_partner';
    `;
    
    const result = await pgPool.query(verifyQuery);
    
    if (result.rows.length > 0) {
      console.log('✅ Verified: is_partner column exists');
      console.table(result.rows);
    } else {
      console.log('❌ Column was not created');
    }

  } catch (error) {
    console.error('❌ Error adding is_partner column:', error);
    throw error;
  } finally {
    await pgPool.end();
  }
}

addIsPartnerColumn()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Failed:', error);
    process.exit(1);
  });
