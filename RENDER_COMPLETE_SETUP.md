# Complete Render Database Setup Guide

## Problem
Production database on Render is missing several tables and columns:
- ❌ `bookings` table doesn't exist
- ❌ `payments` table doesn't exist  
- ❌ `current_occupancy` column missing in `gyms` table

## Complete Fix - Run All Migrations

### Option 1: Using Render Shell (Recommended)

1. **Go to Render Dashboard**
   - Visit: https://dashboard.render.com
   - Navigate to your backend service

2. **Open Shell**
   - Click on "Shell" tab
   - Wait for shell to connect

3. **Run All Migrations in Order**
   ```bash
   # 1. Create bookings table
   npm run db:create-bookings
   
   # 2. Add current_occupancy to gyms
   npm run db:migrate-occupancy
   
   # 3. Create payments table
   npm run db:migrate-payments
   
   # 4. Reset gym occupancy to 0
   npm run db:reset-occupancy
   ```

4. **Verify Success**
   Each command should show a success message (✅)

### Option 2: Using SQL Directly

Connect to your Render PostgreSQL database and run:

```sql
-- 1. Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  gym_id INTEGER NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  session_date TIMESTAMP NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  qr_code TEXT,
  qr_code_expiry TIMESTAMP,
  check_in_time TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_status CHECK (status IN ('pending', 'confirmed', 'cancelled', 'checked_in', 'completed'))
);

CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_gym_id ON bookings(gym_id);
CREATE INDEX IF NOT EXISTS idx_bookings_session_date ON bookings(session_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

-- 2. Add current_occupancy to gyms
ALTER TABLE gyms 
ADD COLUMN IF NOT EXISTS current_occupancy INTEGER DEFAULT 0;

ALTER TABLE gyms 
DROP CONSTRAINT IF EXISTS check_occupancy_capacity;

ALTER TABLE gyms 
ADD CONSTRAINT check_occupancy_capacity 
CHECK (current_occupancy >= 0 AND current_occupancy <= capacity);

-- 3. Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  gym_id INTEGER NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  platform_commission DECIMAL(10, 2) NOT NULL,
  gym_earnings DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  razorpay_order_id VARCHAR(255),
  razorpay_payment_id VARCHAR(255),
  razorpay_signature VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_payment_status CHECK (status IN ('pending', 'success', 'failed', 'refunded'))
);

CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_gym_id ON payments(gym_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- 4. Reset gym occupancy
UPDATE gyms 
SET current_occupancy = 0
WHERE current_occupancy IS NULL OR current_occupancy > 0;
```

### Option 3: Update Build Command

Add migrations to your Render build command:

1. Go to your backend service settings
2. Update "Build Command":
   ```bash
   npm install && npm run db:create-bookings && npm run db:migrate-occupancy && npm run db:migrate-payments && npm run build
   ```
3. Trigger manual deploy

## Verification

After running migrations, verify everything is set up:

```sql
-- Check if all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'gyms', 'bookings', 'payments');

-- Check bookings table structure
\d bookings

-- Check gyms has current_occupancy
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'gyms' AND column_name = 'current_occupancy';

-- Check payments table structure
\d payments

-- Test queries
SELECT COUNT(*) FROM bookings;
SELECT COUNT(*) FROM payments;
SELECT id, name, capacity, current_occupancy FROM gyms LIMIT 5;
```

## Test the API

After migrations, test these endpoints:

1. **Get Gyms** (should now include currentOccupancy):
   ```
   GET https://your-app.onrender.com/api/v1/gyms/nearby?lat=19.076&lng=72.8777&radius=20
   ```

2. **Create Booking** (should work now):
   ```
   POST https://your-app.onrender.com/api/v1/bookings
   Headers: Authorization: Bearer YOUR_TOKEN
   Body: {
     "gymId": 1,
     "sessionDate": "2024-12-01T10:00:00Z"
   }
   ```

3. **Get Bookings**:
   ```
   GET https://your-app.onrender.com/api/v1/bookings/user
   Headers: Authorization: Bearer YOUR_TOKEN
   ```

## NPM Scripts Available

All these scripts are available in `backend/package.json`:

- `npm run db:create-bookings` - Create bookings table
- `npm run db:migrate-occupancy` - Add current_occupancy to gyms
- `npm run db:migrate-payments` - Create payments table
- `npm run db:reset-occupancy` - Reset all gym occupancy to 0

## What Each Migration Does

### 1. Bookings Table
- Stores all gym booking records
- Links users to gyms with session dates
- Includes QR code and check-in tracking
- Status tracking: pending → confirmed → checked_in → completed

### 2. Current Occupancy
- Tracks real-time gym capacity
- Prevents overbooking
- Increments on check-in, decrements on checkout
- Constraint ensures it never exceeds capacity

### 3. Payments Table
- Stores payment transactions
- Tracks Razorpay payment details
- Calculates platform commission (15%) and gym earnings (85%)
- Links to bookings for payment verification

## Troubleshooting

### If migrations fail:

1. **Check database connection**:
   - Verify DATABASE_URL is set in Render environment variables
   - Test connection from Render shell: `npm run db:create`

2. **Check for existing data**:
   - If tables exist but have different structure, you may need to drop and recreate
   - Backup data first if production has real data

3. **Check dependencies**:
   - Ensure `users` and `gyms` tables exist first
   - Bookings depends on users and gyms
   - Payments depends on bookings

### Manual table drop (if needed):
```sql
-- WARNING: This deletes all data!
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
-- Then run migrations again
```

## Files Modified

- ✅ `backend/src/scripts/createBookingsTable.ts` - Added missing columns
- ✅ `backend/src/migrations/add_current_occupancy.ts` - Gym capacity tracking
- ✅ `backend/src/migrations/create_payments_table.ts` - Payment processing
- ✅ `backend/src/scripts/resetGymOccupancy.ts` - Reset occupancy
- ✅ `backend/package.json` - Added migration scripts

## After Setup

Once all migrations are complete:
1. ✅ Bookings will work
2. ✅ Payments will work
3. ✅ Capacity checking will work
4. ✅ QR codes will be generated
5. ✅ Check-in functionality will work

Your GYMFU app will be fully functional! 🎉
