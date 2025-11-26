# Marketplace API Testing Guide

## Quick Test Commands

### 1. Setup (First Time Only)

```bash
cd backend

# Create products table
npm run db:create-products

# Seed sample products
npm run db:seed-products
```

### 2. Test Endpoints

#### Get All Products
```bash
curl http://localhost:3000/api/v1/marketplace/products
```

#### Get Supplements
```bash
curl http://localhost:3000/api/v1/marketplace/products?category=supplement
```

#### Get Gear
```bash
curl http://localhost:3000/api/v1/marketplace/products?category=gear
```

#### Get Food
```bash
curl http://localhost:3000/api/v1/marketplace/products?category=food
```

#### Get Product by ID
```bash
curl http://localhost:3000/api/v1/marketplace/products/1
```

#### Pagination
```bash
# Page 1
curl http://localhost:3000/api/v1/marketplace/products?limit=5&offset=0

# Page 2
curl http://localhost:3000/api/v1/marketplace/products?limit=5&offset=5
```

### 3. Expected Results

- **All products**: 33 products total
- **Supplements**: 8 products
- **Gear**: 17 products
- **Food**: 8 products

### 4. Verify in Database

```sql
-- Connect to your database
psql -U your_username -d your_database

-- Check products
SELECT category, COUNT(*) FROM products GROUP BY category;

-- View sample products
SELECT id, name, category, price FROM products LIMIT 10;
```

## Success Indicators

✅ All endpoints return 200 status  
✅ Products have correct structure  
✅ Pagination works correctly  
✅ Category filtering works  
✅ Product details endpoint works  

## Common Issues

**No products returned?**
→ Run `npm run db:seed-products`

**Table doesn't exist?**
→ Run `npm run db:create-products`

**Server not running?**
→ Run `npm run dev` in backend folder
