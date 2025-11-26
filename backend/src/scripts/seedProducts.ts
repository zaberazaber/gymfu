import { pgPool } from '../config/database';
import ProductModel, { CreateProductData } from '../models/Product';

/**
 * Seed script to populate the products table with sample data
 * Run with: npm run db:seed-products
 */

const sampleProducts: CreateProductData[] = [
  // Supplements
  {
    name: 'Whey Protein Powder - Chocolate',
    description: 'Premium whey protein isolate with 25g protein per serving. Perfect for muscle building and recovery. Delicious chocolate flavor.',
    price: 2999.99,
    category: 'supplement',
    images: ['https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=500'],
    stockQuantity: 50,
  },
  {
    name: 'Creatine Monohydrate',
    description: 'Pure micronized creatine monohydrate for increased strength and power. 5g per serving, unflavored.',
    price: 1499.99,
    category: 'supplement',
    images: ['https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=500'],
    stockQuantity: 75,
  },
  {
    name: 'Pre-Workout Energy Boost',
    description: 'Advanced pre-workout formula with caffeine, beta-alanine, and citrulline for explosive energy and focus.',
    price: 1999.99,
    category: 'supplement',
    images: ['https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=500'],
    stockQuantity: 40,
  },
  {
    name: 'BCAA Recovery Formula',
    description: 'Branched-chain amino acids for muscle recovery and reduced soreness. 2:1:1 ratio, fruit punch flavor.',
    price: 1799.99,
    category: 'supplement',
    images: ['https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=500'],
    stockQuantity: 60,
  },
  {
    name: 'Multivitamin for Athletes',
    description: 'Complete daily multivitamin with minerals, antioxidants, and performance-enhancing nutrients.',
    price: 899.99,
    category: 'supplement',
    images: ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500'],
    stockQuantity: 100,
  },
  {
    name: 'Fish Oil Omega-3',
    description: 'High-potency omega-3 fatty acids for heart health, brain function, and joint support.',
    price: 1299.99,
    category: 'supplement',
    images: ['https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=500'],
    stockQuantity: 80,
  },
  {
    name: 'Mass Gainer Protein',
    description: 'High-calorie mass gainer with 50g protein and complex carbs for muscle building.',
    price: 3499.99,
    category: 'supplement',
    images: ['https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=500'],
    stockQuantity: 35,
  },
  {
    name: 'Glutamine Powder',
    description: 'Pure L-Glutamine for muscle recovery, immune support, and gut health.',
    price: 1599.99,
    category: 'supplement',
    images: ['https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=500'],
    stockQuantity: 55,
  },

  // Equipment/Gear
  {
    name: 'Adjustable Dumbbells Set (2.5kg - 25kg)',
    description: 'Space-saving adjustable dumbbells with quick-change weight system. Perfect for home workouts.',
    price: 8999.99,
    category: 'gear',
    images: ['https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500'],
    stockQuantity: 20,
  },
  {
    name: 'Yoga Mat - Premium Non-Slip',
    description: 'Extra thick 6mm yoga mat with superior grip and cushioning. Eco-friendly TPE material.',
    price: 1299.99,
    category: 'gear',
    images: ['https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500'],
    stockQuantity: 80,
  },
  {
    name: 'Resistance Bands Set (5 Bands)',
    description: 'Complete set of resistance bands with varying resistance levels. Includes door anchor and handles.',
    price: 999.99,
    category: 'gear',
    images: ['https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=500'],
    stockQuantity: 65,
  },
  {
    name: 'Foam Roller - High Density',
    description: 'Professional-grade foam roller for muscle recovery and myofascial release. 33cm length.',
    price: 799.99,
    category: 'gear',
    images: ['https://images.unsplash.com/photo-1611672585731-fa10603fb9e0?w=500'],
    stockQuantity: 45,
  },
  {
    name: 'Kettlebell - Cast Iron (16kg)',
    description: 'Solid cast iron kettlebell with smooth finish. Perfect for strength and conditioning workouts.',
    price: 2499.99,
    category: 'gear',
    images: ['https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500'],
    stockQuantity: 30,
  },
  {
    name: 'Jump Rope - Speed Rope',
    description: 'Professional speed jump rope with ball bearings for smooth rotation. Adjustable length.',
    price: 499.99,
    category: 'gear',
    images: ['https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500'],
    stockQuantity: 90,
  },
  {
    name: 'Pull-Up Bar - Doorway Mount',
    description: 'Heavy-duty doorway pull-up bar with multiple grip positions. No drilling required.',
    price: 1499.99,
    category: 'gear',
    images: ['https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500'],
    stockQuantity: 40,
  },
  {
    name: 'Ab Wheel Roller',
    description: 'Dual-wheel ab roller with knee pad for core strengthening exercises.',
    price: 699.99,
    category: 'gear',
    images: ['https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500'],
    stockQuantity: 70,
  },
  {
    name: 'Gym Gloves - Padded',
    description: 'Breathable gym gloves with extra padding for grip and hand protection.',
    price: 599.99,
    category: 'gear',
    images: ['https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500'],
    stockQuantity: 95,
  },
  {
    name: 'Gym Bag - Duffel Style',
    description: 'Spacious gym bag with multiple compartments and shoe pocket. Water-resistant material.',
    price: 1799.99,
    category: 'gear',
    images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500'],
    stockQuantity: 55,
  },
  {
    name: 'Water Bottle - Insulated (1L)',
    description: 'Double-wall insulated water bottle keeps drinks cold for 24 hours. BPA-free.',
    price: 799.99,
    category: 'gear',
    images: ['https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500'],
    stockQuantity: 150,
  },
  {
    name: 'Gym Towel - Microfiber',
    description: 'Quick-dry microfiber towel, ultra-absorbent and compact. Perfect for gym sessions.',
    price: 399.99,
    category: 'gear',
    images: ['https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=500'],
    stockQuantity: 200,
  },
  {
    name: 'Fitness Tracker Watch',
    description: 'Smart fitness tracker with heart rate monitor, step counter, and sleep tracking.',
    price: 3999.99,
    category: 'gear',
    images: ['https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=500'],
    stockQuantity: 35,
  },
  {
    name: 'Shaker Bottle - 700ml',
    description: 'Leak-proof shaker bottle with mixing ball. Perfect for protein shakes and supplements.',
    price: 299.99,
    category: 'gear',
    images: ['https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500'],
    stockQuantity: 180,
  },
  {
    name: 'Weightlifting Belt',
    description: 'Heavy-duty leather weightlifting belt for lower back support during heavy lifts.',
    price: 2299.99,
    category: 'gear',
    images: ['https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500'],
    stockQuantity: 45,
  },
  {
    name: 'Wrist Wraps - Pair',
    description: 'Elastic wrist wraps for wrist support during pressing movements. 18-inch length.',
    price: 499.99,
    category: 'gear',
    images: ['https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500'],
    stockQuantity: 85,
  },

  // Food/Nutrition
  {
    name: 'Protein Bar - Chocolate Chip (Box of 12)',
    description: 'High-protein snack bars with 20g protein each. Perfect for on-the-go nutrition.',
    price: 1199.99,
    category: 'food',
    images: ['https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=500'],
    stockQuantity: 100,
  },
  {
    name: 'Energy Gel Pack (24 Pack)',
    description: 'Fast-acting energy gels for endurance training. 100 calories per gel.',
    price: 1499.99,
    category: 'food',
    images: ['https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=500'],
    stockQuantity: 60,
  },
  {
    name: 'Peanut Butter - Natural (1kg)',
    description: 'All-natural peanut butter with no added sugar. High in protein and healthy fats.',
    price: 599.99,
    category: 'food',
    images: ['https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=500'],
    stockQuantity: 75,
  },
  {
    name: 'Oats - Rolled (2kg)',
    description: 'Premium quality rolled oats for healthy breakfast and pre-workout meals.',
    price: 399.99,
    category: 'food',
    images: ['https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=500'],
    stockQuantity: 90,
  },
  {
    name: 'Protein Pancake Mix',
    description: 'High-protein pancake mix with 15g protein per serving. Just add water.',
    price: 799.99,
    category: 'food',
    images: ['https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=500'],
    stockQuantity: 55,
  },
  {
    name: 'Almond Butter - Organic (500g)',
    description: 'Organic almond butter rich in vitamin E and healthy fats. No additives.',
    price: 899.99,
    category: 'food',
    images: ['https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=500'],
    stockQuantity: 45,
  },
  {
    name: 'Protein Cookie - Double Chocolate (Box of 12)',
    description: 'Delicious protein cookies with 16g protein each. Guilt-free snacking.',
    price: 999.99,
    category: 'food',
    images: ['https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=500'],
    stockQuantity: 70,
  },
  {
    name: 'Electrolyte Drink Mix (30 Servings)',
    description: 'Sugar-free electrolyte powder for hydration during intense workouts.',
    price: 699.99,
    category: 'food',
    images: ['https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=500'],
    stockQuantity: 80,
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
    console.log('   GET /api/v1/marketplace/products?category=supplement');
    console.log('   GET /api/v1/marketplace/products?category=gear');
    console.log('   GET /api/v1/marketplace/products?category=food');

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
