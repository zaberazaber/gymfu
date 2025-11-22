# Gym Filters Fixed

## Issues Resolved

### 1. Amenity Filter Case Sensitivity
**Problem**: Web amenities were lowercase ('cardio', 'weights') but database has capitalized ('Cardio', 'Weights')
**Solution**: Updated web AMENITIES array to match database capitalization

### 2. Default Radius Too Small
**Problem**: Default 5km radius only showed 1 gym, making it seem like filters weren't working
**Solution**: Changed default radius from 5km to 20km to show all 6 sample gyms

## Changes Made

### Web (`web/src/pages/GymsPage.tsx`)
```typescript
// Before:
const AMENITIES = ['cardio', 'weights', 'shower', 'parking', 'locker', 'trainer', 'pool', 'sauna', 'yoga', 'crossfit'];

// After:
const AMENITIES = ['Cardio', 'Weights', 'Shower', 'Parking', 'Locker', 'AC'];
```

### Web Redux (`web/src/store/gymSlice.ts`)
```typescript
// Before:
radius: 5,

// After:
radius: 20,
```

### Mobile Redux (`mobile/src/store/gymSlice.ts`)
```typescript
// Before:
radius: 5,

// After:
radius: 20,
```

## How Filters Work

### Backend API
- **Endpoint**: `GET /api/v1/gyms/nearby`
- **Parameters**:
  - `lat`, `lng` - Location coordinates (required)
  - `radius` - Search radius in km (default: 5km)
  - `amenities` - Comma-separated list (e.g., "Cardio,Weights")
  - `minPrice`, `maxPrice` - Price range filters

### Filter Flow

#### Web:
1. User selects amenities/price range
2. Clicks "Search Gyms" button
3. Redux action `searchNearbyGyms()` is dispatched
4. API call with current filter state
5. Results displayed

#### Mobile:
1. User opens filter modal
2. Selects amenities/radius/price
3. Clicks "Apply Filters"
4. Redux updates filters AND calls `searchNearbyGyms()`
5. Modal closes, results displayed

## Testing Filters

### Test Amenity Filter
```bash
# Web or Mobile: Select "Cardio" and "Weights"
# Should show: PowerFit Gym, FitZone Studio, Elite Fitness Center, BodyBuilders Gym, Flex Gym & Spa
curl "http://localhost:3000/api/v1/gyms/nearby?lat=19.0760&lng=72.8777&radius=20&amenities=Cardio,Weights"
```

### Test Price Filter
```bash
# Web or Mobile: Set Min: 100, Max: 200
# Should show: PowerFit Gym (₹150), FitZone Studio (₹200), Iron Paradise (₹180), BodyBuilders Gym (₹120), Flex Gym & Spa (₹170)
curl "http://localhost:3000/api/v1/gyms/nearby?lat=19.0760&lng=72.8777&radius=20&minPrice=100&maxPrice=200"
```

### Test Radius
```bash
# 5km radius - Shows 1 gym
curl "http://localhost:3000/api/v1/gyms/nearby?lat=19.0760&lng=72.8777&radius=5"

# 10km radius - Shows 4 gyms
curl "http://localhost:3000/api/v1/gyms/nearby?lat=19.0760&lng=72.8777&radius=10"

# 20km radius - Shows all 6 gyms
curl "http://localhost:3000/api/v1/gyms/nearby?lat=19.0760&lng=72.8777&radius=20"
```

## Available Amenities
Based on seeded gyms:
- ✅ Cardio
- ✅ Weights
- ✅ Shower
- ✅ Locker
- ✅ AC
- ✅ Parking

## Gym Distribution by Distance from Mumbai Center (19.076, 72.8777)
1. **PowerFit Gym** - 4.26 km (Andheri West)
2. **FitZone Studio** - 5.38 km (Bandra West)
3. **Elite Fitness Center** - 5.69 km (Powai)
4. **Iron Paradise** - 6.44 km (Juhu)
5. **BodyBuilders Gym** - 10.38 km (Goregaon East)
6. **Flex Gym & Spa** - 13.12 km (Malad West)

## User Experience Improvements

### Before:
- Default 5km radius showed only 1 gym
- Users thought filters weren't working
- Lowercase amenities didn't match database

### After:
- Default 20km radius shows all 6 gyms
- Filters work correctly with proper capitalization
- Users can see immediate results
- Can adjust radius down if too many results

## Notes
- Filters are applied when user clicks "Search Gyms" (web) or "Apply Filters" (mobile)
- Amenities use AND logic (gym must have ALL selected amenities)
- Price range is inclusive (minPrice <= gym.basePrice <= maxPrice)
- Distance calculated using Haversine formula
- Results sorted by distance (nearest first)
