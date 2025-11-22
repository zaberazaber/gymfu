import { pgPool } from '../config/database';
import dotenv from 'dotenv';

dotenv.config();

async function viewUsers() {
  try {
    console.log('Fetching all users from PostgreSQL...\n');
    
    const result = await pgPool.query(`
      SELECT 
        id,
        name,
        email,
        phone_number,
        is_partner,
        age,
        gender,
        location,
        fitness_goals,
        created_at,
        updated_at
      FROM users
      ORDER BY created_at DESC
    `);

    if (result.rows.length === 0) {
      console.log('No users found in the database.');
    } else {
      console.log(`Found ${result.rows.length} user(s):\n`);
      console.table(result.rows);
    }

    await pgPool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    process.exit(1);
  }
}

viewUsers();
