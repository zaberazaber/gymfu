# Fix: Gym Capacity Check Issue

## Problem
Getting "Gym is currently at full capacity (50/50)" error even when gym has available capacity.

## Root Causes Identified

1. **NULL Values**: `current_occupancy` column might be NULL in production database
2. **Error Message Bug**: Error message was showing `capacity/capacity` instead of `currentOccupancy/capacity`

## Fixes Applied

### 1. Fixed Error Message
**File**: `backend/src/controllers/bookingController.ts`

Changed from:
```typescript
message: `Gym is currently at full capacity (${gym.capacity}/${gym.capacity}). Please try again later.`
```

To:
```typescript
message: `Gym is currently at full capacity (${gym.currentOccupancy}/${gym.capacity}). Please try again later.`
```

### 2. Handle NULL Values in Capacity Check
**File**: `backend/src/models/Gym.ts`

Updated `hasCapacity` method to use `COALESCE`:
```typescript
static async hasCapacity(id: number): Promise<boolean> {
    const query = `
      SELECT COALESCE(current_occupancy, 0) < capacity as "hasCapacity"
      FROM gyms
      WHERE id = $1
    `;
    const result = await pgPool.query(query, [id]);
    return result.rows[0]?.hasCapacity || false;
}
```

This ensures NULL values are treated as 0.

### 3. Created Reset Script
**File**: `backend/src/scripts/resetGymOccupancy.ts`

Script to reset all gym occupancy to 0:
```bash
npm run db:reset-occupancy
```

## How to Fix Production

### Step 1: Run Migration (if not done already)
```bash
# On Render Shell
npm run db:migrate-occupancy
```

### Step 2: Reset Gym Occupancy
```bash
# On Render Shell
npm run db:reset-occupancy
```

### Step 3: Redeploy Backend
Push the code changes to trigger a redeploy on Render, or manually deploy from Render dashboard.

## Alternative: Quick SQL Fix

If you can't access Render Shell, run this SQL directly on your database:

```sql
-- Ensure column exists with default value
ALTER TABLE gyms 
ADD COLUMN IF NOT EXISTS current_occupancy INTEGER DEFAULT 0;

-- Reset all occupancy to 0
UPDATE gyms 
SET current_occupancy = 0
WHERE current_occupancy IS NULL OR current_occupancy > 0;

-- Verify
SELECT id, name, capacity, current_occupancy 
FROM gyms 
LIMIT 10;
```

## Verification

After applying fixes, test booking:

1. **Check Gym Data**:
   ```
   GET /api/v1/gyms/nearby?lat=19.076&lng=72.8777&radius=20
   ```
   Should show `currentOccupancy: 0` for all gyms

2. **Try Creating Booking**:
   ```
   POST /api/v1/bookings
   {
     "gymId": 1,
     "sessionDate": "2024-12-01T10:00:00Z"
   }
   ```
   Should succeed if gym has capacity

3. **Check Error Message** (if capacity is actually full):
   Should now show correct format: `"50/50"` not `"50/50"`

## Files Changed

- ✅ `backend/src/controllers/bookingController.ts` - Fixed error message
- ✅ `backend/src/models/Gym.ts` - Handle NULL values with COALESCE
- ✅ `backend/src/scripts/resetGymOccupancy.ts` - New reset script
- ✅ `backend/package.json` - Added `db:reset-occupancy` script

## Testing Locally

```bash
cd backend

# Reset occupancy
npm run db:reset-occupancy

# Start server
npm run dev

# Test booking endpoint
curl -X POST http://localhost:3000/api/v1/bookings \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"gymId": 1, "sessionDate": "2024-12-01T10:00:00Z"}'
```

## Notes

- The `COALESCE` function ensures NULL values are treated as 0
- Occupancy is incremented when users check in
- Occupancy is decremented when bookings are cancelled
- The constraint ensures occupancy never exceeds capacity
