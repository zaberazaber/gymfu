# Create Gyms Table on Render Database

## Problem
The `gyms` table doesn't exist in your Render PostgreSQL database, causing "could not find the specified table gyms" errors.

## Solution
Run the migration script to create the gyms table with all necessary columns and indexes.

## Steps

### 1. Set Environment Variable
Make sure you have your Render database URL:

```bash
set DATABASE_URL=your_render_database_url_here
```

Get your DATABASE_URL from:
- Render Dashboard → Your PostgreSQL service → Connection String (External)

### 2. Run the Migration Script

```bash
cd backend
npm run db:create-gyms-render
```

### 3. Verify Success

You should see output like:
```
✅ Connected to database
✅ Gyms table created successfully!
✅ Indexes created for owner_id, city, pincode, is_verified, and location

📋 Gyms table columns:
  - id: integer
  - name: character varying
  - owner_id: integer
  - address: text
  - latitude: numeric
  - longitude: numeric
  - city: character varying
  - pincode: character varying
  - amenities: ARRAY
  - base_price: numeric
  - capacity: integer
  - rating: numeric
  - is_verified: boolean
  - created_at: timestamp without time zone
  - updated_at: timestamp without time zone
```

## What This Creates

The script creates:
- **gyms table** with all necessary columns
- **Indexes** for performance:
  - owner_id (for finding gyms by partner)
  - city (for location searches)
  - pincode (for area searches)
  - is_verified (for filtering verified gyms)
  - location (latitude, longitude for geo queries)

## After Migration

Once the table is created, your gym search and listing features should work properly on the production backend.

## Troubleshooting

**Connection Error:**
- Verify your DATABASE_URL is correct
- Check that your IP is whitelisted in Render (if applicable)

**Table Already Exists:**
- The script uses `CREATE TABLE IF NOT EXISTS`, so it's safe to run multiple times

**Foreign Key Error:**
- Make sure the `users` table exists first (it should from previous migrations)
