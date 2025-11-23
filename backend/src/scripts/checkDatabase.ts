import { pgPool } from '../config/database';

async function checkDatabase() {
  try {
    console.log('🔍 Checking database connection...\n');

    // Check connection
    const connQuery = 'SELECT current_database(), current_user, inet_server_addr(), inet_server_port();';
    const connResult = await pgPool.query(connQuery);
    console.log('📊 Connection Info:');
    console.table(connResult.rows);

    // Check if users table exists
    const tableQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'users';
    `;
    const tableResult = await pgPool.query(tableQuery);
    
    if (tableResult.rows.length === 0) {
      console.log('❌ users table does NOT exist!');
      return;
    }
    
    console.log('✅ users table exists\n');

    // Check columns in users table
    const columnsQuery = `
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position;
    `;
    
    const columnsResult = await pgPool.query(columnsQuery);
    console.log('📋 Users table columns:');
    console.table(columnsResult.rows);

    // Check specifically for is_partner
    const hasIsPartner = columnsResult.rows.some(row => row.column_name === 'is_partner');
    
    if (hasIsPartner) {
      console.log('\n✅ is_partner column EXISTS in the database');
    } else {
      console.log('\n❌ is_partner column DOES NOT EXIST in the database');
    }

  } catch (error) {
    console.error('❌ Error checking database:', error);
    throw error;
  } finally {
    await pgPool.end();
  }
}

checkDatabase()
  .then(() => {
    console.log('\n✨ Check complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Check failed:', error);
    process.exit(1);
  });
