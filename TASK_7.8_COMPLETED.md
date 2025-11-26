# Task 7.8 - Marketplace Payment Integration

## Completed: Payment Integration for Marketplace Orders

Successfully integrated the Razorpay payment system with marketplace orders, enabling secure payment processing for product purchases.

## What Was Implemented

### 1. Database Migration (`backend/src/migrations/add_marketplace_payments.ts`)

Extended the payments table to support marketplace orders:

**Changes Made:**
- Added `order_id` column (references orders table)
- Made `booking_id` nullable (marketplace orders don't have bookings)
- Made `gym_id` nullable (marketplace orders don't have gyms)
- Added check constraint to ensure either `booking_id` OR `order_id` is present
- Created index on `order_id` for fast lookups

**Constraint Logic:**
```sql
CHECK (
  (booking_id IS NOT NULL AND order_id IS NULL) OR
  (booking_id IS NULL AND order_id IS NOT NULL)
)
```

This ensures payments are either for bookings OR orders, never both or neither.

### 2. Payment Model Updates (`backend/src/models/Payment.ts`)

Updated Payment model to support marketplace orders:

**Interface Changes:**
- `bookingId` - Now optional
- `orderId` - New optional field
- `gymId` - Now optional (no gym for marketplace)

**New Method:**
- `findByOrderId(orderId)` - Find payment by order ID

**Updated Methods:**
- `create()` - Now accepts `orderId` parameter
- All SELECT queries now include `order_id`

### 3. Order Controller Updates (`backend/src/controllers/orderController.ts`)

#### Modified `createOrder` Endpoint
Now creates order with payment integration:

1. Creates order with pending status
2. Creates payment record linked to order
3. Creates Razorpay order
4. Updates payment with Razorpay order ID
5. Returns order + payment details for frontend

**Response includes:**
- Order details
- Payment information (amount, Razorpay order ID, key ID)
- Ready for Razorpay checkout integration

#### New `verifyOrderPayment` Endpoint
POST `/api/v1/marketplace/orders/:orderId/verify-payment`

**Flow:**
1. Validates payment verification details
2. Verifies Razorpay signature
3. Updates payment status to 'success'
4. Updates order status to 'confirmed'
5. Deducts product stock
6. Clears user's cart
7. Returns confirmed order

**Security:**
- Verifies Razorpay signature to prevent fraud
- User authorization check
- Atomic operations for data integrity

### 4. Routes Integration (`backend/src/routes/marketplace.ts`)

Added new route:
```
POST /api/v1/marketplace/orders/:orderId/verify-payment
```

## Payment Flow

### Complete Order + Payment Flow

```
1. User adds products to cart
2. User proceeds to checkout
3. User provides shipping address
4. Backend creates order (status: pending)
5. Backend creates payment record
6. Backend creates Razorpay order
7. Frontend receives payment details
8. User completes payment via Razorpay
9. Frontend sends verification to backend
10. Backend verifies payment signature
11. Backend confirms order (status: confirmed)
12. Backend updates product stock
13. Backend clears cart
14. User receives order confirmation
```

### Payment Status Lifecycle

```
Order: pending → confirmed → processing → shipped → delivered
Payment: pending → success
```

## API Endpoints

### Create Order with Payment
```
POST /api/v1/marketplace/orders
Authorization: Bearer <token>

Request:
{
  "shippingAddress": {
    "fullName": "John Doe",
    "phoneNumber": "+919876543210",
    "addressLine1": "123 Main St",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001"
  }
}

Response:
{
  "success": true,
  "message": "Order created successfully. Please complete payment.",
  "data": {
    "order": { ... },
    "payment": {
      "id": 1,
      "amount": 499998,  // Amount in paise
      "currency": "INR",
      "razorpayOrderId": "order_xxx",
      "keyId": "rzp_test_xxx"
    }
  }
}
```

### Verify Payment
```
POST /api/v1/marketplace/orders/:orderId/verify-payment
Authorization: Bearer <token>

Request:
{
  "razorpayOrderId": "order_xxx",
  "razorpayPaymentId": "pay_xxx",
  "razorpaySignature": "signature_xxx"
}

Response:
{
  "success": true,
  "message": "Payment verified and order confirmed",
  "data": {
    "id": 1,
    "status": "confirmed",
    ...
  }
}
```

## Features

### Payment Security
✅ Razorpay signature verification
✅ Server-side validation
✅ Secure payment processing
✅ Fraud prevention

### Order Management
✅ Order created before payment
✅ Order confirmed after payment
✅ Stock deducted only after payment
✅ Cart cleared only after payment

### Data Integrity
✅ Database transactions
✅ Atomic operations
✅ Rollback on failure
✅ Constraint validation

### Error Handling
✅ Payment verification failures
✅ Invalid signatures
✅ Missing payment details
✅ Order not found errors

## Integration with Existing Payment System

The marketplace payment system reuses the existing Razorpay infrastructure:

**Shared Components:**
- `RazorpayService` - Order creation, signature verification
- `PaymentModel` - Payment records and status tracking
- Payment verification flow
- Razorpay configuration

**Differences:**
- Marketplace payments link to `orders` instead of `bookings`
- No gym commission (marketplace only)
- Platform keeps 100% of commission
- Different confirmation flow

## Testing

### Manual Testing Steps

1. **Create Order with Payment:**
```bash
# Add items to cart
POST http://localhost:3000/api/v1/marketplace/cart
Headers: Authorization: Bearer <token>
Body: { "productId": 1, "quantity": 2 }

# Create order
POST http://localhost:3000/api/v1/marketplace/orders
Headers: Authorization: Bearer <token>
Body: {
  "shippingAddress": {
    "fullName": "Test User",
    "phoneNumber": "+919876543210",
    "addressLine1": "123 Test St",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001"
  }
}

# Note the orderId and razorpayOrderId from response
```

2. **Complete Payment (Use Razorpay Test Cards):**
- Use Razorpay checkout with test card: 4111 1111 1111 1111
- Any future CVV and expiry
- Complete payment

3. **Verify Payment:**
```bash
POST http://localhost:3000/api/v1/marketplace/orders/1/verify-payment
Headers: Authorization: Bearer <token>
Body: {
  "razorpayOrderId": "order_xxx",
  "razorpayPaymentId": "pay_xxx",
  "razorpaySignature": "signature_xxx"
}
```

4. **Verify Results:**
- Check order status is 'confirmed'
- Check payment status is 'success'
- Check product stock is reduced
- Check cart is empty

### Test Scenarios

✅ Successful payment flow
✅ Payment verification failure
✅ Invalid signature
✅ Order not found
✅ Payment already verified
✅ Stock deduction
✅ Cart clearing

## Database Schema Updates

### Payments Table (Updated)
```sql
CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER REFERENCES bookings(id),  -- Now nullable
  order_id INTEGER REFERENCES orders(id),      -- New field
  user_id INTEGER NOT NULL,
  gym_id INTEGER,                              -- Now nullable
  amount DECIMAL(10, 2) NOT NULL,
  platform_commission DECIMAL(10, 2) NOT NULL,
  gym_earnings DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) NOT NULL,
  razorpay_order_id VARCHAR(255),
  razorpay_payment_id VARCHAR(255),
  razorpay_signature VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT payment_type_check CHECK (
    (booking_id IS NOT NULL AND order_id IS NULL) OR
    (booking_id IS NULL AND order_id IS NOT NULL)
  )
);
```

## Next Steps

The next task is **7.9 - Build order history UI (web and mobile)** which will:
- Create OrderHistoryPage/Screen with order list
- Display order details (items, total, status, date)
- Add order status badges
- Show order tracking information

## Files Created

- `backend/src/migrations/add_marketplace_payments.ts` - Database migration

## Files Modified

- `backend/src/models/Payment.ts` - Added marketplace order support
- `backend/src/controllers/orderController.ts` - Integrated payment flow
- `backend/src/routes/marketplace.ts` - Added payment verification route

## Requirements Satisfied

- ✅ Update order creation to initiate payment
- ✅ Set order status to 'pending' initially
- ✅ Update to 'confirmed' after payment verification
- ✅ Test: Complete order with payment, verify order status updates

Task 7.8 is complete! The marketplace payment system is fully integrated and ready for UI implementation.
