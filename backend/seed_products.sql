-- ============================================
-- SEED PRODUCTS FOR MARKETPLACE
-- Run this after running marketplace_migrations.sql
-- ============================================

-- Clear existing products (optional - comment out if you want to keep existing data)
-- TRUNCATE TABLE products RESTART IDENTITY CASCADE;

-- Insert sample products
INSERT INTO products (name, description, price, category, brand, images, stock_quantity, rating, is_active) VALUES
-- Protein Supplements
('Whey Protein Isolate', 'Premium whey protein isolate with 25g protein per serving. Fast-absorbing and low in carbs and fat.', 2499.00, 'Supplements', 'MuscleBlaze', ARRAY['https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=500'], 50, 4.5, true),
('Mass Gainer', 'High-calorie mass gainer with 50g protein and complex carbs for muscle building.', 3299.00, 'Supplements', 'Optimum Nutrition', ARRAY['https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=500'], 30, 4.7, true),
('Plant Protein', 'Vegan protein blend from pea, rice, and hemp. 20g protein per serving.', 1999.00, 'Supplements', 'MyProtein', ARRAY['https://images.unsplash.com/photo-1622484211850-5f7e6e3e0e3e?w=500'], 40, 4.3, true),

-- Pre-Workout
('Pre-Workout Extreme', 'High-stimulant pre-workout with caffeine, beta-alanine, and citrulline for intense energy.', 1799.00, 'Supplements', 'Cellucor', ARRAY['https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=500'], 45, 4.6, true),
('Pump Formula', 'Stimulant-free pre-workout for enhanced muscle pumps and endurance.', 1599.00, 'Supplements', 'Transparent Labs', ARRAY['https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=500'], 35, 4.4, true),

-- Gym Equipment
('Adjustable Dumbbells Set', 'Space-saving adjustable dumbbells from 5kg to 25kg per hand.', 8999.00, 'Equipment', 'Bowflex', ARRAY['https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500'], 15, 4.8, true),
('Resistance Bands Set', 'Set of 5 resistance bands with different resistance levels and door anchor.', 1299.00, 'Equipment', 'TheraBand', ARRAY['https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=500'], 60, 4.5, true),
('Yoga Mat Premium', 'Extra thick 6mm yoga mat with non-slip surface and carrying strap.', 1499.00, 'Equipment', 'Liforme', ARRAY['https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500'], 80, 4.7, true),
('Kettlebell 16kg', 'Cast iron kettlebell with smooth finish for functional training.', 2199.00, 'Equipment', 'Rogue', ARRAY['https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500'], 25, 4.6, true),
('Pull-Up Bar', 'Doorway pull-up bar with multiple grip positions. No drilling required.', 1899.00, 'Equipment', 'Iron Gym', ARRAY['https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500'], 40, 4.4, true),

-- Apparel
('Compression Shorts', 'Moisture-wicking compression shorts for enhanced performance and recovery.', 1299.00, 'Apparel', 'Under Armour', ARRAY['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500'], 100, 4.3, true),
('Training T-Shirt', 'Breathable mesh training t-shirt with anti-odor technology.', 899.00, 'Apparel', 'Nike', ARRAY['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500'], 120, 4.5, true),
('Sports Bra', 'High-support sports bra with adjustable straps and moisture management.', 1599.00, 'Apparel', 'Lululemon', ARRAY['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500'], 75, 4.7, true),
('Training Shoes', 'Versatile training shoes with stable base and responsive cushioning.', 5999.00, 'Apparel', 'Reebok', ARRAY['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500'], 50, 4.6, true),
('Gym Gloves', 'Padded gym gloves with wrist support and breathable mesh.', 799.00, 'Apparel', 'Harbinger', ARRAY['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500'], 90, 4.2, true),

-- Accessories
('Shaker Bottle', 'Leak-proof shaker bottle with mixing ball and measurement markings.', 399.00, 'Accessories', 'BlenderBottle', ARRAY['https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=500'], 200, 4.4, true),
('Gym Bag', 'Spacious gym duffel bag with shoe compartment and water bottle holder.', 1999.00, 'Accessories', 'Adidas', ARRAY['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500'], 65, 4.5, true),
('Foam Roller', 'High-density foam roller for muscle recovery and myofascial release.', 1199.00, 'Accessories', 'TriggerPoint', ARRAY['https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=500'], 55, 4.6, true),
('Jump Rope', 'Speed jump rope with adjustable length and ball bearing system.', 599.00, 'Accessories', 'WOD Nation', ARRAY['https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500'], 150, 4.3, true),
('Lifting Straps', 'Heavy-duty cotton lifting straps for deadlifts and rows.', 699.00, 'Accessories', 'Versa Gripps', ARRAY['https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500'], 85, 4.4, true),

-- Recovery
('Massage Gun', 'Percussion massage gun with 4 speed settings and multiple attachments.', 6999.00, 'Recovery', 'Theragun', ARRAY['https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=500'], 20, 4.8, true),
('BCAA Powder', 'Branch chain amino acids for muscle recovery and reduced soreness.', 1499.00, 'Supplements', 'Scivation', ARRAY['https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=500'], 70, 4.4, true),
('Creatine Monohydrate', 'Pure micronized creatine for strength and muscle gains.', 999.00, 'Supplements', 'Creapure', ARRAY['https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=500'], 95, 4.7, true),
('Electrolyte Drink', 'Sugar-free electrolyte powder for hydration during workouts.', 899.00, 'Supplements', 'Nuun', ARRAY['https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=500'], 110, 4.3, true),
('Sleep Support', 'Natural sleep aid with melatonin, magnesium, and L-theanine.', 1299.00, 'Supplements', 'ZMA', ARRAY['https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=500'], 60, 4.2, true);

-- Verify the insert
SELECT category, COUNT(*) as product_count, SUM(stock_quantity) as total_stock
FROM products
GROUP BY category
ORDER BY category;

SELECT 'Total products inserted:' as message, COUNT(*) as count FROM products;
