# GPS Location Guide - GymFu Mobile App

## Overview
The GymFu mobile app now supports both GPS-based location and a default test location, giving you flexibility for testing and production use.

## Features

### 1. Automatic GPS Detection
When you open the gym list screen, the app automatically:
- Requests location permission
- Attempts to get your GPS coordinates
- Falls back to Mumbai default location if GPS fails

### 2. Location Toggle Button
Located in the top-right corner of the screen:
- **📍 GPS** - Currently using your device's GPS location
- **🗺️ Default** - Currently using Mumbai test location

**Tap the button to switch between modes:**
- If showing "GPS", tap to switch to Default (Mumbai)
- If showing "Default", tap to get your current GPS location

### 3. Location Indicator
Below the title, you'll see which location is active:
- **GPS Mode**: "Using your location (25.2997, 55.3792)"
- **Default Mode**: "Using Mumbai, India (Test Location)"

## Use Cases

### For Testing (Default Mode)
1. Tap the location button until it shows "🗺️ Default"
2. The app uses Mumbai coordinates (19.076, 72.8777)
3. You'll see the 6 seeded test gyms in Mumbai
4. Perfect for testing filters, UI, and functionality

### For Production (GPS Mode)
1. Tap the location button until it shows "📍 GPS"
2. The app uses your actual device location
3. You'll see gyms near your current location
4. Requires gyms to be seeded in your area

## How It Works

### Initial Load
```typescript
// On app load, tries to get GPS location
const location = await Location.getCurrentPositionAsync({});
// If successful, uses GPS coordinates
// If fails, uses default Mumbai location
```

### Manual GPS Update
```typescript
// Tap GPS button to refresh location
updateGPSLocation() -> Gets fresh GPS coordinates -> Searches gyms
```

### Switch to Default
```typescript
// Tap Default button to use test location
useDefaultLocation() -> Sets Mumbai coordinates -> Searches gyms
```

## Technical Details

### Location State
- **usingGPS**: Boolean flag tracking which mode is active
- **filters.latitude/longitude**: Current coordinates used for search
- **locationPermissionGranted**: Permission status

### Functions
1. **requestLocationPermission()**: Initial setup, tries GPS first
2. **updateGPSLocation()**: Manually refresh GPS coordinates
3. **useDefaultLocation()**: Switch to Mumbai test location

### Error Handling
- GPS timeout or error → Falls back to default location
- Permission denied → Uses default location with alert
- Network issues → Shows error message

## For Developers

### To Add More Test Locations
Edit `useDefaultLocation()` in `GymListScreen_new.tsx`:
```typescript
const useDefaultLocation = () => {
    dispatch(
        setLocation({
            latitude: YOUR_LAT,  // Change this
            longitude: YOUR_LNG, // Change this
        })
    );
    // ...
};
```

### To Seed Gyms in Your Area
1. Update `backend/src/scripts/seedGyms.ts` with your location's gyms
2. Run: `npm run seed:gyms`
3. Use GPS mode to find them

### To Disable GPS Completely
Comment out the GPS code in `requestLocationPermission()`:
```typescript
// const location = await Location.getCurrentPositionAsync({});
// dispatch(setLocation({ ... }));
setUsingGPS(false);
```

## Troubleshooting

### "No gyms found nearby"
- **GPS Mode**: No gyms seeded in your area → Switch to Default mode
- **Default Mode**: Check if backend is running and gyms are seeded

### GPS Not Working
- Check location permissions in device settings
- Ensure GPS is enabled on device
- Try switching to Default mode and back to GPS

### Location Not Updating
- Tap the location button to manually refresh
- Pull down to refresh the gym list
- Check console logs for GPS errors

## Best Practices

1. **Development**: Use Default mode for consistent testing
2. **Demo**: Use Default mode to show seeded gyms
3. **Production**: Use GPS mode for real user experience
4. **Testing Filters**: Use Default mode with known gyms
5. **Testing GPS**: Use GPS mode in different locations
