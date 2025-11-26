import { pgPool } from '../config/database';

export async function up() {
  const client = await pgPool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS cart (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, product_id)
      );

      CREATE INDEX idx_cart_user_id ON cart(user_id);
      CREATE INDEX idx_cart_product_id ON cart(product_id);
    `);

    console.log('✅ Cart table created successfully');
  } catch (error) {
    console.error('❌ Error creating cart table:', error);
    throw error;
  } finally {
    client.release();
  }
}

export async function down() {
  const client = await pgPool.connect();
  try {
    await client.query(`
      DROP TABLE IF EXISTS cart CASCADE;
    `);

    console.log('✅ Cart table dropped successfully');
  } catch (error) {
    console.error('❌ Error dropping cart table:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run migration if called directly
if (require.main === module) {
  up()
    .then(() => {
      console.log('Migration completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}
