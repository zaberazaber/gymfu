# Sample Gyms Added to Database

## Overview
Successfully seeded the database with 6 sample gyms in Mumbai to test the gym discovery feature.

## Gyms Added

### 1. PowerFit Gym
- **Location**: Andheri West, Mumbai (400053)
- **Coordinates**: 19.1136, 72.8697
- **Price**: ₹150/session
- **Capacity**: 50 people
- **Rating**: 4.5⭐
- **Amenities**: Cardio, Weights, Shower, Locker, AC
- **Hours**: Mon-Fri 6AM-10PM, Sat-Sun 7AM-9PM

### 2. FitZone Studio
- **Location**: Bandra West, Mumbai (400050)
- **Coordinates**: 19.0596, 72.8295
- **Price**: ₹200/session
- **Capacity**: 40 people
- **Rating**: 4.7⭐
- **Amenities**: Cardio, Weights, Parking, AC
- **Hours**: Mon-Fri 5:30AM-11PM, Sat-Sun 6AM-10PM

### 3. Iron Paradise
- **Location**: Juhu, Mumbai (400049)
- **Coordinates**: 19.1075, 72.8263
- **Price**: ₹180/session
- **Capacity**: 60 people
- **Rating**: 4.3⭐
- **Amenities**: Weights, Shower, Locker, Parking
- **Hours**: Mon-Fri 6AM-10PM, Sat-Sun 7AM-8PM

### 4. Elite Fitness Center
- **Location**: Powai, Mumbai (400076)
- **Coordinates**: 19.1197, 72.9059
- **Price**: ₹250/session
- **Capacity**: 80 people
- **Rating**: 4.8⭐
- **Amenities**: Cardio, Weights, Shower, Locker, AC, Parking
- **Hours**: Mon-Fri 5AM-11PM, Sat-Sun 6AM-10PM

### 5. BodyBuilders Gym
- **Location**: Goregaon East, Mumbai (400063)
- **Coordinates**: 19.1663, 72.8526
- **Price**: ₹120/session
- **Capacity**: 45 people
- **Rating**: 4.2⭐
- **Amenities**: Weights, Cardio, Shower, Locker
- **Hours**: Mon-Fri 6AM-10PM, Sat-Sun 7AM-9PM

### 6. Flex Gym & Spa
- **Location**: Malad West, Mumbai (400064)
- **Coordinates**: 19.1868, 72.8347
- **Price**: ₹170/session
- **Capacity**: 55 people
- **Rating**: 4.4⭐
- **Amenities**: Cardio, Weights, Shower, AC, Parking
- **Hours**: Mon-Fri 6AM-10PM, Sat-Sun 7AM-9PM

## How to Seed

```bash
cd backend
npm run db:seed-gyms
```

## Testing Gym Discovery

### Web Application
1. Navigate to http://localhost:5173
2. Login/Register
3. Click "Find Gyms"
4. Default location is Mumbai (19.076, 72.8777)
5. You should see all 6 gyms listed
6. Try filtering by amenities or price range

### Mobile Application
1. Open mobile app
2. Login/Register
3. Tap "Find Gyms"
4. Grant location permission (or use default Mumbai location)
5. You should see all 6 gyms listed
6. Pull down to refresh
7. Tap "Filters" to filter by amenities, radius, or price

### API Testing
```bash
# Get all nearby gyms (default 5km radius)
curl "http://localhost:3000/api/v1/gyms/nearby?lat=19.0760&lng=72.8777"

# Get gyms within 20km
curl "http://localhost:3000/api/v1/gyms/nearby?lat=19.0760&lng=72.8777&radius=20"

# Filter by amenities
curl "http://localhost:3000/api/v1/gyms/nearby?lat=19.0760&lng=72.8777&amenities=Cardio,Weights"

# Filter by price range
curl "http://localhost:3000/api/v1/gyms/nearby?lat=19.0760&lng=72.8777&minPrice=100&maxPrice=200"
```

## Default Search Location
- **City**: Mumbai, India
- **Latitude**: 19.0760
- **Longitude**: 72.8777
- **Default Radius**: 5km

All 6 gyms are within 20km of this location.

## Re-seeding
If you want to re-seed the database:

```bash
# Delete existing gyms
psql -U postgres -d gymfu -c "DELETE FROM gyms;"

# Run seed script again
npm run db:seed-gyms
```

## Notes
- All gyms are marked as `isVerified: true` so they appear in search results
- All gyms have `ownerId: 1` (you may need to create a user first)
- Operating hours are set for all days of the week
- Gyms are sorted by distance from search location
- Distance is calculated using Haversine formula

## Files Created
- `backend/src/scripts/seedGyms.ts` - Seed script
- `backend/package.json` - Added `db:seed-gyms` script

## Next Steps
- Test gym discovery on web and mobile
- Test filtering by amenities
- Test filtering by price range
- Test different search radii
- Click on gym cards to view details
