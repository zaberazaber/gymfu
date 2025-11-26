# Task 7.5 - Shopping Cart Backend Implementation

## Completed: Shopping Cart Backend

Successfully implemented the complete shopping cart backend system for the GYMFU marketplace.

## What Was Implemented

### 1. Cart Model (`backend/src/models/Cart.ts`)
- Complete Cart model with CRUD operations
- Methods implemented:
  - `addItem()` - Add product to cart or update quantity if exists
  - `getByUserId()` - Get user's cart with product details and totals
  - `updateQuantity()` - Update cart item quantity
  - `removeItem()` - Remove item from cart
  - `clearCart()` - Clear all items from user's cart
  - `getById()` - Get specific cart item

### 2. Database Migration (`backend/src/migrations/create_cart_table.ts`)
- Created `cart` table with schema:
  - `id` - Primary key
  - `user_id` - Foreign key to users table
  - `product_id` - Foreign key to products table
  - `quantity` - Item quantity (must be > 0)
  - `created_at` - Timestamp
  - `updated_at` - Timestamp
  - Unique constraint on (user_id, product_id)
- Added indexes for performance:
  - `idx_cart_user_id` on user_id
  - `idx_cart_product_id` on product_id

### 3. Cart Controller (`backend/src/controllers/cartController.ts`)
Implemented 5 endpoints:

#### POST /api/v1/marketplace/cart
- Add item to cart
- Validates product exists and has sufficient stock
- Updates quantity if item already in cart
- Returns updated cart with totals

#### GET /api/v1/marketplace/cart
- Get user's cart with all items
- Includes product details (name, price, images, stock)
- Calculates cart total and item count

#### PUT /api/v1/marketplace/cart/:itemId
- Update cart item quantity
- Validates stock availability
- Returns updated cart

#### DELETE /api/v1/marketplace/cart/:itemId
- Remove specific item from cart
- Returns updated cart

#### DELETE /api/v1/marketplace/cart
- Clear entire cart
- Returns empty cart

### 4. Routes (`backend/src/routes/marketplace.ts`)
- Added cart routes to marketplace router
- All cart endpoints protected with authentication middleware
- Integrated with existing product routes

## Features

### Stock Validation
- Checks product availability before adding to cart
- Validates stock when updating quantities
- Prevents adding more items than available

### Cart Calculations
- Automatic total calculation
- Item count tracking
- Per-item subtotal calculation

### User Isolation
- Each user has their own cart
- Cart items are user-specific
- Authentication required for all cart operations

### Duplicate Prevention
- Unique constraint prevents duplicate items
- Automatically updates quantity if item exists
- Efficient cart management

## API Endpoints

All endpoints require authentication (JWT token in Authorization header):

```
POST   /api/v1/marketplace/cart          - Add item to cart
GET    /api/v1/marketplace/cart          - Get user's cart
PUT    /api/v1/marketplace/cart/:itemId  - Update item quantity
DELETE /api/v1/marketplace/cart/:itemId  - Remove item
DELETE /api/v1/marketplace/cart          - Clear cart
```

## Testing

### Manual Testing with Postman/cURL

1. **Add item to cart:**
```bash
POST http://localhost:3000/api/v1/marketplace/cart
Headers: Authorization: Bearer <token>
Body: {
  "productId": 1,
  "quantity": 2
}
```

2. **Get cart:**
```bash
GET http://localhost:3000/api/v1/marketplace/cart
Headers: Authorization: Bearer <token>
```

3. **Update quantity:**
```bash
PUT http://localhost:3000/api/v1/marketplace/cart/1
Headers: Authorization: Bearer <token>
Body: {
  "quantity": 3
}
```

4. **Remove item:**
```bash
DELETE http://localhost:3000/api/v1/marketplace/cart/1
Headers: Authorization: Bearer <token>
```

5. **Clear cart:**
```bash
DELETE http://localhost:3000/api/v1/marketplace/cart
Headers: Authorization: Bearer <token>
```

## Database Schema

```sql
CREATE TABLE cart (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, product_id)
);
```

## Response Format

### Cart Response
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "userId": 1,
        "productId": 5,
        "quantity": 2,
        "createdAt": "2024-01-15T10:30:00Z",
        "productName": "Whey Protein Powder",
        "productPrice": 2499.99,
        "productImages": ["url1", "url2"],
        "productStockQuantity": 50
      }
    ],
    "total": 4999.98,
    "itemCount": 2
  }
}
```

## Next Steps

The next task is **7.6 - Build cart UI (web and mobile)** which will:
- Create CartPage/Screen showing cart items
- Display product name, quantity, price
- Add quantity update controls
- Add remove item button
- Show cart total
- Add "Checkout" button

## Files Created/Modified

### Created:
- `backend/src/models/Cart.ts`
- `backend/src/migrations/create_cart_table.ts`
- `backend/src/controllers/cartController.ts`

### Modified:
- `backend/src/routes/marketplace.ts` - Added cart routes

## Requirements Satisfied

- ✅ Create Cart table in PostgreSQL
- ✅ Create POST /api/v1/marketplace/cart endpoint to add items
- ✅ Create GET /api/v1/marketplace/cart endpoint to get user's cart
- ✅ Create DELETE /api/v1/marketplace/cart/{itemId} endpoint to remove items
- ✅ Calculate cart total
- ✅ Test: Add items to cart, get cart, remove items using Postman

Task 7.5 is complete and ready for UI implementation!
