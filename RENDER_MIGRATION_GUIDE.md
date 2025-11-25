# Quick Fix: Run Migration on Render

## Problem
Production database on Render is missing the `current_occupancy` column, causing 500 errors.

## Quick Solution

### Method 1: Using Render Shell (Easiest)

1. **Go to Render Dashboard**
   - Visit: https://dashboard.render.com
   - Navigate to your backend service (gymfu-backend or similar)

2. **Open Shell**
   - Click on the "Shell" tab in the left sidebar
   - Wait for the shell to connect

3. **Run Migration**
   ```bash
   npm run db:migrate-occupancy
   ```

4. **Verify Success**
   - You should see: `✅ Successfully added current_occupancy field to gyms table`
   - The API should now work without errors

### Method 2: Using Render PostgreSQL Console

1. **Go to Render Dashboard**
   - Visit: https://dashboard.render.com
   - Navigate to your PostgreSQL database

2. **Open SQL Console**
   - Click on "Connect" → "External Connection"
   - Or use the built-in SQL console if available

3. **Run SQL**
   ```sql
   -- Add current_occupancy column
   ALTER TABLE gyms 
   ADD COLUMN IF NOT EXISTS current_occupancy INTEGER DEFAULT 0;

   -- Drop existing constraint if it exists
   ALTER TABLE gyms 
   DROP CONSTRAINT IF EXISTS check_occupancy_capacity;

   -- Add check constraint
   ALTER TABLE gyms 
   ADD CONSTRAINT check_occupancy_capacity 
   CHECK (current_occupancy >= 0 AND current_occupancy <= capacity);
   ```

4. **Verify**
   ```sql
   -- Check if column exists
   SELECT column_name, data_type, column_default 
   FROM information_schema.columns 
   WHERE table_name = 'gyms' AND column_name = 'current_occupancy';
   
   -- Test query
   SELECT id, name, capacity, current_occupancy 
   FROM gyms 
   LIMIT 5;
   ```

### Method 3: Trigger Redeploy with Migration

1. **Update Build Command** (if not already set)
   - Go to your backend service settings on Render
   - Update "Build Command" to include migration:
   ```bash
   npm install && npm run db:migrate-occupancy && npm run build
   ```

2. **Trigger Manual Deploy**
   - Click "Manual Deploy" → "Deploy latest commit"
   - The migration will run during deployment

## What This Does

Adds the `current_occupancy` field to track how many users are currently at each gym:
- Default value: 0
- Constraint: Must be between 0 and gym capacity
- Used for capacity checking in bookings

## After Migration

Test the API endpoint that was failing:
```
GET https://your-render-url.onrender.com/api/v1/gyms/nearby?lat=19.076&lng=72.8777&radius=20
```

Should now return gym data with `currentOccupancy` field.

## Need Help?

If you encounter issues:
1. Check Render logs for error messages
2. Verify DATABASE_URL is set correctly in environment variables
3. Ensure the gyms table exists (run `\dt` in PostgreSQL console)
4. Check if you have write permissions on the database

## Related Files
- Migration script: `backend/src/migrations/add_current_occupancy.ts`
- NPM script: `db:migrate-occupancy` in `backend/package.json`
