import { pgPool } from '../config/database';

/**
 * Migration: Create products table
 * Run with: npm run db:create-products
 */
export async function createProductsTable() {
  const client = await pgPool.connect();

  try {
    console.log('Starting migration: Create products table...');

    await client.query('BEGIN');

    // Create products table
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(50) NOT NULL CHECK (category IN ('supplement', 'gear', 'food')),
        description TEXT NOT NULL,
        price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
        images TEXT[] DEFAULT '{}',
        stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
        rating DECIMAL(3, 2) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP
      )
    `);
    console.log('✓ Created products table');

    // Create indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)
    `);
    console.log('✓ Created index on category');

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_products_price ON products(price)
    `);
    console.log('✓ Created index on price');

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
  createProductsTable()
    .then(() => {
      console.log('Migration script finished');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration script failed:', error);
      process.exit(1);
    });
}

export default createProductsTable;
