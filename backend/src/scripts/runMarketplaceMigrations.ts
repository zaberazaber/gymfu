import { createProductsTable } from '../migrations/create_products_table';
import { up as createCartTable } from '../migrations/create_cart_table';
import { up as addMarketplacePayments } from '../migrations/add_marketplace_payments';

async function runMarketplaceMigrations() {
  try {
    console.log('🚀 Starting marketplace migrations...');

    console.log('\n1️⃣ Creating products table...');
    await createProductsTable();

    console.log('\n2️⃣ Creating cart table...');
    await createCartTable();

    console.log('\n3️⃣ Adding marketplace payment support...');
    await addMarketplacePayments();

    console.log('\n✅ All marketplace migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

runMarketplaceMigrations();
