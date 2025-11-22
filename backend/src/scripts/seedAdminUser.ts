import { pgPool } from '../config/database';
import bcrypt from 'bcrypt';
import logger from '../config/logger';

async function seedAdminUser() {
  try {
    console.log('🔧 Seeding admin user...');

    // Admin user details
    const adminEmail = 'admin@varzio.com';
    const adminPassword = 'admin123';
    const adminName = 'Varzio Admin';

    // Check if admin already exists
    const checkQuery = 'SELECT * FROM users WHERE email = $1';
    const existingUser = await pgPool.query(checkQuery, [adminEmail]);

    if (existingUser.rows.length > 0) {
      console.log('✅ Admin user already exists:', adminEmail);
      console.log('   User ID:', existingUser.rows[0].id);
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Insert admin user
    const insertQuery = `
      INSERT INTO users (email, name, password, created_at, updated_at)
      VALUES ($1, $2, $3, NOW(), NOW())
      RETURNING *
    `;

    const result = await pgPool.query(insertQuery, [
      adminEmail,
      adminName,
      hashedPassword,
    ]);

    console.log('✅ Admin user created successfully!');
    console.log('   Email:', adminEmail);
    console.log('   Password:', adminPassword);
    console.log('   User ID:', result.rows[0].id);
    console.log('\n📝 You can now login with:');
    console.log('   Email: admin@varzio.com');
    console.log('   Password: admin123');
    console.log('\n🔐 Any email with @varzio will auto-login (development mode)');

  } catch (error) {
    console.error('❌ Error seeding admin user:', error);
    throw error;
  } finally {
    await pgPool.end();
  }
}

// Run the seed function
seedAdminUser()
  .then(() => {
    console.log('\n✨ Admin user seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to seed admin user:', error);
    process.exit(1);
  });
