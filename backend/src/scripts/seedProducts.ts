import { pgPool } from '../config/database';
import ProductModel, { CreateProductData } from '../models/Product';

/**
 * Seed script to populate the products table with sample data
 * Run with: npm run db:seed-products
 */

const sampleProducts: CreateProductData[] = [
  // Supplements
  {
    name: 'Whey Protein Isolate',
    description: 'Premium whey protein isolate with 25g protein per serving. Fast-absorbing and low in carbs and fat.',
    price: 2499.00,
    category: 'Supplements',
    images: ['https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=500'],
    stockQuantity: 50,
  },
  {
    name: 'Mass Gainer',
    description: 'High-calorie mass gainer with 50g protein and complex carbs for muscle building.',
    price: 3299.00,
    category: 'Supplements',
    images: ['https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=500'],
    stockQuantity: 30,
  },
  {
    name: 'Plant Protein',
    description: 'Vegan protein blend from pea, rice, and hemp. 20g protein per serving.',
    price: 1999.00,
    category: 'Supplements',
    images: ['https://images.unsplash.com/photo-1622484211850-5f7e6e3e0e3e?w=500'],
    stockQuantity: 40,
  },
  {
    name: 'Pre-Workout Extreme',
    description: 'High-stimulant pre-workout with caffeine, beta-alanine, and citrulline for intense energy.',
    price: 1799.00,
    category: 'Supplements',
    images: ['https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=500'],
    stockQuantity: 45,
  },
  {
    name: 'Pump Formula',
    description: 'Stimulant-free pre-workout for enhanced muscle pumps and endurance.',
    price: 1599.00,
    category: 'Supplements',
    images: ['https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=500'],
    stockQuantity: 35,
  },
  {
    name: 'BCAA Powder',
    description: 'Branch chain amino acids for muscle recovery and reduced soreness.',
    price: 1499.00,
    category: 'Supplements',
    images: ['https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=500'],
    stockQuantity: 70,
  },
  {
    name: 'Creatine Monohydrate',
    description: 'Pure micronized creatine for strength and muscle gains.',
    price: 999.00,
    category: 'Supplements',
    images: ['https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=500'],
    stockQuantity: 95,
  },
  {
    name: 'Electrolyte Drink',
    description: 'Sugar-free electrolyte powder for hydration during workouts.',
    price: 899.00,
    category: 'Supplements',
    images: ['https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=500'],
    stockQuantity: 110,
  },
  {
    name: 'Sleep Support',
    description: 'Natural sleep aid with melatonin, magnesium, and L-theanine.',
    price: 1299.00,
    category: 'Supplements',
    images: ['https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=500'],
    stockQuantity: 60,
  },

  // Equipment
  {
    name: 'Adjustable Dumbbells Set',
    description: 'Space-saving adjustable dumbbells from 5kg to 25kg per hand.',
    price: 8999.00,
    category: 'Equipment',
    images: ['https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500'],
    stockQuantity: 15,
  },
  {
    name: 'Resistance Bands Set',
    description: 'Set of 5 resistance bands with different resistance levels and door anchor.',
    price: 1299.00,
    category: 'Equipment',
    images: ['https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=500'],
    stockQuantity: 60,
  },
  {
    name: 'Yoga Mat Premium',
    description: 'Extra thick 6mm yoga mat with non-slip surface and carrying strap.',
    price: 1499.00,
    category: 'Equipment',
    images: ['https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500'],
    stockQuantity: 80,
  },
  {
    name: 'Kettlebell 16kg',
    description: 'Cast iron kettlebell with smooth finish for functional training.',
    price: 2199.00,
    category: 'Equipment',
    images: ['https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500'],
    stockQuantity: 25,
  },
  {
    name: 'Pull-Up Bar',
    description: 'Doorway pull-up bar with multiple grip positions. No drilling required.',
    price: 1899.00,
    category: 'Equipment',
    images: ['https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500'],
    stockQuantity: 40,
  },

  // Apparel
  {
    name: 'Compression Shorts',
    description: 'Moisture-wicking compression shorts for enhanced performance and recovery.',
    price: 1299.00,
    category: 'Apparel',
    images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500'],
    stockQuantity: 100,
  },
  {
    name: 'Training T-Shirt',
    description: 'Breathable mesh training t-shirt with anti-odor technology.',
    price: 899.00,
    category: 'Apparel',
    images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500'],
    stockQuantity: 120,
  },
  {
    name: 'Sports Bra',
    description: 'High-support sports bra with adjustable straps and moisture management.',
    price: 1599.00,
    category: 'Apparel',
    images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500'],
    stockQuantity: 75,
  },
  {
    name: 'Training Shoes',
    description: 'Versatile training shoes with stable base and responsive cushioning.',
    price: 5999.00,
    category: 'Apparel',
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500'],
    stockQuantity: 50,
  },
  {
    name: 'Gym Gloves',
    description: 'Padded gym gloves with wrist support and breathable mesh.',
    price: 799.00,
    category: 'Apparel',
    images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500'],
    stockQuantity: 90,
  },

  // Accessories
  {
    name: 'Shaker Bottle',
    description: 'Leak-proof shaker bottle with mixing ball and measurement markings.',
    price: 399.00,
    category: 'Accessories',
    images: ['https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=500'],
    stockQuantity: 200,
  },
  {
    name: 'Gym Bag',
    description: 'Spacious gym duffel bag with shoe compartment and water bottle holder.',
    price: 1999.00,
    category: 'Accessories',
    images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500'],
    stockQuantity: 65,
  },
  {
    name: 'Foam Roller',
    description: 'High-density foam roller for muscle recovery and myofascial release.',
    price: 1199.00,
    category: 'Accessories',
    images: ['https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=500'],
    stockQuantity: 55,
  },
  {
    name: 'Jump Rope',
    description: 'Speed jump rope with adjustable length and ball bearing system.',
    price: 599.00,
    category: 'Accessories',
    images: ['https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500'],
    stockQuantity: 150,
  },
  {
    name: 'Lifting Straps',
    description: 'Heavy-duty cotton lifting straps for deadlifts and rows.',
    price: 699.00,
    category: 'Accessories',
    images: ['https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500'],
    stockQuantity: 85,
  },

  // Recovery
  {
    name: 'Massage Gun',
    description: 'Percussion massage gun with 4 speed settings and multiple attachments.',
    price: 6999.00,
    category: 'Recovery',
    images: ['https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=500'],
    stockQuantity: 20,
  },
];

async function seedProducts() {
  const client = await pgPool.connect();

  try {
    console.log('Starting product seeding...');

    // Check if products table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'products'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.error('❌ Products table does not exist. Please run migration first:');
      console.error('   npm run db:create-products');
      process.exit(1);
    }

    // Clear existing products (optional - comment out if you want to keep existing)
    await client.query('DELETE FROM products');
    console.log('✓ Cleared existing products');

    // Insert sample products
    let insertedCount = 0;
    for (const product of sampleProducts) {
      try {
        await ProductModel.create(product);
        insertedCount++;
        console.log(`✓ Added: ${product.name}`);
      } catch (error: any) {
        console.error(`✗ Failed to add ${product.name}:`, error.message);
      }
    }

    console.log(`\n✅ Successfully seeded ${insertedCount} products!`);
    console.log('\nProduct breakdown:');
    
    // Show category counts
    const categoryCounts = await client.query(`
      SELECT category, COUNT(*) as count 
      FROM products 
      GROUP BY category 
      ORDER BY category
    `);
    
    categoryCounts.rows.forEach(row => {
      console.log(`  - ${row.category}: ${row.count} products`);
    });

    console.log('\n📊 Test the products:');
    console.log('   GET /api/v1/marketplace/products');
    console.log('   GET /api/v1/marketplace/products?category=Supplements');
    console.log('   GET /api/v1/marketplace/products?category=Equipment');
    console.log('   GET /api/v1/marketplace/products?category=Apparel');
    console.log('   GET /api/v1/marketplace/products?category=Accessories');
    console.log('   GET /api/v1/marketplace/products?category=Recovery');

  } catch (error: any) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run seeding if called directly
if (require.main === module) {
  seedProducts()
    .then(() => {
      console.log('\n✅ Product seeding completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Product seeding failed:', error);
      process.exit(1);
    });
}

export default seedProducts;
