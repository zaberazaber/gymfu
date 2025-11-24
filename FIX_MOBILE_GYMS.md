# Fix Mobile Gyms Not Visible

## Problem
Gyms are not showing in the mobile app because:
1. The gyms table doesn't exist on Render database
2. There are no gyms seeded in the database

## Solution

Follow these steps in order:

### Step 1: Set Your Render Database URL

```bash
set DATABASE_URL=your_render_database_url_here
```

Get it from: Render Dashboard → PostgreSQL service → Connection String (External)

### Step 2: Create the Gyms Table

```bash
cd backend
npm run db:create-gyms-render
```

This creates the gyms table with all necessary columns and indexes.

### Step 3: Seed Gyms Data

```bash
npm run db:seed-gyms-render
```

This adds 8 sample gyms in Mumbai area with:
- Different locations (Andheri, Bandra, Juhu, Worli, etc.)
- Various amenities (Cardio, Weights, AC, Parking, etc.)
- Price range: ₹400-900 per session
- Ratings: 4.0-4.8 stars

### Step 4: Restart Your Mobile App

The mobile app is now configured to use the production backend:
- Stop your Expo app (Ctrl+C)
- Start it again: `npm start` or `expo start`
- Open the app on your device/emulator

### Step 5: Test Gym Discovery

1. Open the mobile app
2. Navigate to "Discover Gyms" or the gym list screen
3. You should see 8 gyms listed
4. Try the filters (radius, amenities, price range)
5. Click on a gym to see details

## What Changed

✅ **Mobile API**: Now points to production Render backend
✅ **Gyms Table**: Created on Render database
✅ **Sample Data**: 8 gyms seeded in Mumbai area

## Verification

After seeding, you should see output like:
```
✅ Successfully seeded 8 gyms!

📊 Gyms Summary:
  Total Gyms: 8
  Avg Price: ₹612
  Price Range: ₹400 - ₹900
```

## Switching Back to Local Development

If you want to test with local backend later:

1. Open `mobile/src/utils/api.ts`
2. Change `const USE_PRODUCTION = true;` to `false`
3. Make sure your local backend is running
4. Seed gyms locally: `npm run db:seed-gyms`

## Troubleshooting

**"Table gyms does not exist"**
- Run Step 2 first to create the table

**"No partner user found"**
- The seed script will automatically create a demo partner user

**"Gyms already exist"**
- The script won't duplicate gyms
- To re-seed, delete existing gyms first in Render dashboard

**Mobile app still shows no gyms**
- Check console logs for API errors
- Verify `USE_PRODUCTION = true` in `mobile/src/utils/api.ts`
- Make sure you restarted the Expo app
- Check network connectivity

## API Endpoint

The mobile app now calls:
```
GET https://gymfu-backend.onrender.com/api/v1/gyms/nearby
```

With parameters:
- lat: 19.076 (Mumbai)
- lng: 72.8777
- radius: 20 (km)
