import { pgPool } from '../config/database';
import bcrypt from 'bcrypt';

async function seedAdmin() {
  const client = await pgPool.connect();
  
  try {
    console.log('🔄 Creating admin user...');
    
    // Check if admin already exists
    const existingAdmin = await client.query(
      `SELECT id FROM users WHERE email = 'admin@gymfu.com'`
    );
    
    if (existingAdmin.rows.length > 0) {
      console.log('⚠️  Admin user already exists, updating to admin role...');
      await client.query(
        `UPDATE users SET is_admin = true, role = 'admin' WHERE email = 'admin@gymfu.com'`
      );
      console.log('✅ Admin user updated');
      return;
    }
    
    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await client.query(`
      INSERT INTO users (email, name, password, is_admin, role, created_at, updated_at)
      VALUES ('admin@gymfu.com', 'GYMFU Admin', $1, true, 'admin', NOW(), NOW())
    `, [hashedPassword]);
    
    console.log('✅ Admin user created successfully');
    console.log('📧 Email: admin@gymfu.com');
    console.log('🔑 Password: admin123');
    console.log('⚠️  Please change the password after first login!');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    throw error;
  } finally {
    client.release();
  }
}

if (require.main === module) {
  seedAdmin()
    .then(() => {
      console.log('🎉 Admin seeding complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Failed to seed admin:', error);
      process.exit(1);
    });
}

export default seedAdmin;
