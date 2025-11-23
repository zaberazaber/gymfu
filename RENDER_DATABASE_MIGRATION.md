# Render Database Migration Guide

This guide contains all the SQL migrations needed to set up your Render PostgreSQL database for the GymFu application.

## Prerequisites

- Render PostgreSQL database created
- pgAdmin installed (or any PostgreSQL client)
- Database connection details from Render

---

## Step 1: Connect pgAdmin to Render PostgreSQL

### Get Connection Details from Render
1. Go to your Render dashboard
2. Click on your PostgreSQL database
3. Click "Connect" → "External Connection"
4. Note down:
   - **Hostname**: `dpg-xxxxx.oregon-postgres.render.com`
   - **Port**: `5432`
   - **Database**: `your_database_name`
   - **Username**: `your_username`
   - **Password**: `[shown separately]`

### Add Server in pgAdmin
1. Open pgAdmin
2. Right-click "Servers" → "Register" → "Server"

### Fill in Connection Details

**General Tab:**
- **Name**: `Render - GymFu` (or any name you want)

**Connection Tab:**
- **Host name/address**: Paste the hostname from Render
- **Port**: `5432`
- **Maintenance database**: Your database name from Render
- **Username**: Your username from Render
- **Password**: Your password from Render
- **Save password**: ✓ Check this box

**SSL Tab:**
- **SSL mode**: `Require` (Render requires SSL)

### Click Save

pgAdmin will connect to your Render database.

---

## Step 2: Run Database Migrations

Once connected, right-click on your database → "Query Tool" and run the following SQL commands in order:

### Migration 1: Enable PostGIS Extension

```sql
-- Enable PostGIS for location-based queries
CREATE EXTENSION IF NOT EXISTS postgis;
```

**Purpose**: Enables geographic data types and functions for gym location searches.

---

### Migration 2: Create Users Table

```sql
-- Create users table with all required columns
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  phone_number VARCHAR(20) UNIQUE,
  email VARCHAR(255) UNIQUE,
  name VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  age INTEGER,
  gender VARCHAR(20),
  location JSONB,
  fitness_goals TEXT[],
  profile_image TEXT,
  is_partner BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone_number);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_is_partner ON users(is_partner);
```

**Purpose**: Creates the users table with authentication and profile fields.

---

### Migration 3: Add Missing User Columns (If Table Already Exists)

If your users table already exists but is missing columns, run this:

```sql
-- Add missing columns to existing users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_partner BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS age INTEGER,
ADD COLUMN IF NOT EXISTS gender VARCHAR(20),
ADD COLUMN IF NOT EXISTS location JSONB,
ADD COLUMN IF NOT EXISTS fitness_goals TEXT[],
ADD COLUMN IF NOT EXISTS profile_image TEXT;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_users_is_partner ON users(is_partner);
```

**Purpose**: Adds profile and partner-related columns to existing users table.

---

### Migration 4: Create Gyms Table

```sql
-- Create gyms table with location support
CREATE TABLE IF NOT EXISTS gyms (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  city VARCHAR(100),
  state VARCHAR(100),
  pincode VARCHAR(20),
  location GEOGRAPHY(POINT, 4326),
  amenities TEXT[],
  images TEXT[],
  pricing JSONB,
  rating DECIMAL(2,1) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  owner_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_gyms_location ON gyms USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_gyms_city ON gyms(city);
CREATE INDEX IF NOT EXISTS idx_gyms_owner ON gyms(owner_id);
CREATE INDEX IF NOT EXISTS idx_gyms_rating ON gyms(rating);
```

**Purpose**: Creates the gyms table with geographic location support for proximity searches.

---

### Migration 5: Seed Sample Gyms (Optional)

```sql
-- Insert sample gym data for testing
INSERT INTO gyms (name, description, address, city, state, pincode, location, amenities, pricing, rating, total_reviews)
VALUES 
  (
    'FitZone Gym', 
    'Modern gym with state-of-the-art equipment', 
    '123 Main St', 
    'Mumbai', 
    'Maharashtra', 
    '400001', 
    ST_SetSRID(ST_MakePoint(72.8777, 19.0760), 4326)::geography,
    ARRAY['Cardio', 'Weights', 'Personal Training', 'Locker Room'],
    '{"monthly": 2000, "quarterly": 5500, "yearly": 20000}'::jsonb,
    4.5, 
    120
  ),
  (
    'PowerHouse Fitness', 
    'Premium fitness center with expert trainers', 
    '456 Park Ave', 
    'Mumbai', 
    'Maharashtra', 
    '400002',
    ST_SetSRID(ST_MakePoint(72.8347, 18.9388), 4326)::geography,
    ARRAY['Cardio', 'Weights', 'Yoga', 'Zumba', 'Steam Room'],
    '{"monthly": 3000, "quarterly": 8000, "yearly": 28000}'::jsonb,
    4.7, 
    200
  ),
  (
    'Flex Gym', 
    'Affordable gym for everyone', 
    '789 Street Rd', 
    'Delhi', 
    'Delhi', 
    '110001',
    ST_SetSRID(ST_MakePoint(77.2090, 28.6139), 4326)::geography,
    ARRAY['Cardio', 'Weights', 'Locker Room'],
    '{"monthly": 1500, "quarterly": 4000, "yearly": 15000}'::jsonb,
    4.2, 
    85
  ),
  (
    'Elite Fitness Club', 
    'Luxury gym with spa and pool', 
    '321 Beach Road', 
    'Bangalore', 
    'Karnataka', 
    '560001',
    ST_SetSRID(ST_MakePoint(77.5946, 12.9716), 4326)::geography,
    ARRAY['Cardio', 'Weights', 'Swimming Pool', 'Spa', 'Sauna', 'Personal Training'],
    '{"monthly": 5000, "quarterly": 14000, "yearly": 50000}'::jsonb,
    4.8, 
    350
  ),
  (
    'Budget Gym', 
    'No-frills gym with basic equipment', 
    '555 Market St', 
    'Pune', 
    'Maharashtra', 
    '411001',
    ST_SetSRID(ST_MakePoint(73.8567, 18.5204), 4326)::geography,
    ARRAY['Cardio', 'Weights'],
    '{"monthly": 1000, "quarterly": 2800, "yearly": 10000}'::jsonb,
    4.0, 
    45
  );
```

**Purpose**: Adds sample gym data for testing the application.

---

## Step 3: Verify Migrations

Run these queries to verify everything is set up correctly:

### Check Users Table Structure
```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;
```

### Check Gyms Table Structure
```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'gyms'
ORDER BY ordinal_position;
```

### Check PostGIS Extension
```sql
SELECT * FROM pg_extension WHERE extname = 'postgis';
```

### Count Gyms
```sql
SELECT COUNT(*) as total_gyms FROM gyms;
```

### View Sample Gyms
```sql
SELECT id, name, city, rating, total_reviews 
FROM gyms 
ORDER BY rating DESC;
```

---

## Step 4: Test Location-Based Queries

Test if location-based gym search is working:

```sql
-- Find gyms within 10km of Mumbai coordinates (19.0760, 72.8777)
SELECT 
  id,
  name,
  city,
  rating,
  ST_Distance(
    location,
    ST_SetSRID(ST_MakePoint(72.8777, 19.0760), 4326)::geography
  ) / 1000 as distance_km
FROM gyms
WHERE ST_DWithin(
  location,
  ST_SetSRID(ST_MakePoint(72.8777, 19.0760), 4326)::geography,
  10000  -- 10km in meters
)
ORDER BY distance_km;
```

---

## Troubleshooting

### Issue: "extension postgis does not exist"
**Solution**: PostGIS might not be available on your Render plan. Contact Render support or use a different hosting provider that supports PostGIS.

### Issue: "column is_partner does not exist"
**Solution**: Run Migration 3 to add missing columns.

### Issue: "relation gyms does not exist"
**Solution**: Run Migration 4 to create the gyms table.

### Issue: Connection timeout
**Solution**: 
- Check if your IP is whitelisted in Render
- Verify SSL mode is set to "Require" in pgAdmin
- Check your internet connection

### Issue: Authentication failed
**Solution**: 
- Double-check username and password from Render dashboard
- Ensure you're using the external connection details, not internal

---

## Alternative: Using psql Command Line

If you prefer using psql instead of pgAdmin:

```bash
# Connect to Render database
psql "postgresql://username:password@hostname:5432/database?sslmode=require"

# Then run the migrations one by one
\i migration1.sql
\i migration2.sql
# etc.
```

---

## Migration Checklist

- [ ] Connected pgAdmin to Render PostgreSQL
- [ ] Enabled PostGIS extension
- [ ] Created/updated users table
- [ ] Created gyms table
- [ ] Seeded sample gym data
- [ ] Verified table structures
- [ ] Tested location-based queries
- [ ] Tested registration on deployed app
- [ ] Tested gym search on deployed app

---

## Next Steps

After completing all migrations:

1. Test user registration at: `https://your-app.vercel.app/register`
2. Test gym search at: `https://your-app.vercel.app/gyms`
3. Monitor Render logs for any errors
4. Add more gym data as needed

---

## Notes

- All migrations use `IF NOT EXISTS` or `ADD COLUMN IF NOT EXISTS` to be idempotent (safe to run multiple times)
- Geographic coordinates use SRID 4326 (WGS 84) which is the standard for GPS coordinates
- Distances are calculated in meters by default
- Indexes are created for performance on frequently queried columns
