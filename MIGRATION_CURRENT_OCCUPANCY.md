# Migration: Add current_occupancy Field

## Issue
The production database is missing the `current_occupancy` column in the `gyms` table, causing errors when querying gym data.

**Error Message:**
```
column "current_occupancy" does not exist
```

## Solution
Run the migration to add the `current_occupancy` field to the gyms table.

## Local Migration (Already Completed)
```bash
cd backend
npx ts-node src/migrations/add_current_occupancy.ts
```

## Production Migration (Render)

### Option 1: Using Render Shell (Recommended)
1. Go to your Render dashboard: https://dashboard.render.com
2. Select your backend service
3. Click on "Shell" tab
4. Run the migration:
```bash
npm run db:migrate-occupancy
```

### Option 2: Using Render PostgreSQL Dashboard
1. Go to your Render dashboard
2. Select your PostgreSQL database
3. Click on "Connect" and copy the External Database URL
4. Use a PostgreSQL client (like pgAdmin, DBeaver, or psql) to connect
5. Run the SQL commands below

### Option 3: Using Direct Database Connection (Local)
```bash
# Set the production DATABASE_URL from Render
export DATABASE_URL="your_render_database_url"

# Run migration
cd backend
npx ts-node src/migrations/add_current_occupancy.ts
```

### Option 4: Using SQL Directly
Connect to your Render PostgreSQL database and run:

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

## What This Migration Does

1. **Adds `current_occupancy` column** to the `gyms` table
   - Type: INTEGER
   - Default value: 0
   - Tracks how many users are currently checked in at the gym

2. **Adds constraint** to ensure data integrity
   - `current_occupancy` must be >= 0
   - `current_occupancy` must be <= `capacity`

## Verification

After running the migration, verify it worked:

```sql
-- Check if column exists
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'gyms' AND column_name = 'current_occupancy';

-- Check if constraint exists
SELECT constraint_name, check_clause
FROM information_schema.check_constraints
WHERE constraint_name = 'check_occupancy_capacity';

-- Test query
SELECT id, name, capacity, current_occupancy 
FROM gyms 
LIMIT 5;
```

## Related Files
- Migration: `backend/src/migrations/add_current_occupancy.ts`
- Model: `backend/src/models/Gym.ts`
- Task: 4.9 - Implement capacity checking

## Notes
- This migration is idempotent (safe to run multiple times)
- Existing gyms will have `current_occupancy` set to 0
- The constraint ensures occupancy never exceeds capacity
