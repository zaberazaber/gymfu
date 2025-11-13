# How to Search Gyms Based on GPS Location

## Quick Answer
**The app now uses GPS by default!** Just open the gym list and it will automatically use your device's location.

## Step-by-Step Guide

### To Use Your GPS Location (Current Location):
1. Open the GymFu mobile app
2. Navigate to the "Gyms" tab
3. The app automatically gets your GPS location
4. You'll see: **"Using your location (lat, lng)"**
5. Gyms near you will appear (if any are in the database)

### To Switch Between GPS and Test Location:
Look at the top-right corner of the screen:

**📍 GPS Button** = Currently using your real location
- Tap it to switch to Mumbai test location

**🗺️ Default Button** = Currently using Mumbai test location  
- Tap it to switch to your GPS location

## Visual Guide

```
┌─────────────────────────────────────┐
│  Discover Gyms        [📍 GPS]      │ ← Tap to toggle
│  Using your location (25.29, 55.37) │ ← Shows current mode
│                                      │
│  Search Radius: 20 km                │
│  [5km] [10km] [20km] [50km]         │
│                                      │
│  [🔍 Search Gyms] [⚙️ Filters]      │
└─────────────────────────────────────┘
```

## What You Need to Know

### If You See "No gyms found nearby":
This means there are no gyms in the database near your GPS location.

**Solution 1**: Tap the location button to switch to "🗺️ Default" mode
- This uses Mumbai, India location
- You'll see 6 test gyms

**Solution 2**: Add gyms in your area to the database
- Contact the admin to seed gyms in your location

### Location Permissions
The app needs location permission to use GPS:
- **First time**: You'll see a permission request → Tap "Allow"
- **Denied**: The app will use Mumbai default location
- **To change**: Go to device Settings → Apps → GymFu → Permissions → Location

## Examples

### Example 1: Testing in Dubai
```
Current Location: Dubai (25.299, 55.379)
GPS Mode: ON (📍 GPS)
Result: "No gyms found nearby"
Action: Tap button → Switch to Default mode
Result: Shows 6 Mumbai gyms
```

### Example 2: Testing in Mumbai
```
Current Location: Mumbai (19.076, 72.877)
GPS Mode: ON (📍 GPS)
Result: Shows 6 nearby gyms
Action: Can adjust radius to see more/fewer gyms
```

### Example 3: Production Use
```
Current Location: Your city
GPS Mode: ON (📍 GPS)
Result: Shows gyms near you (if seeded in database)
Action: Use filters to refine results
```

## Troubleshooting

### GPS Not Working?
1. Check if location services are enabled on your device
2. Check if the app has location permission
3. Try tapping the GPS button to refresh location
4. If still not working, use Default mode

### Location Not Accurate?
1. Make sure you're outdoors or near a window
2. Wait a few seconds for GPS to stabilize
3. Tap the GPS button to refresh
4. Check if "High Accuracy" mode is enabled in device settings

### Want to Force GPS Update?
1. Tap the location button twice:
   - First tap: Switch to Default
   - Second tap: Switch back to GPS (refreshes location)

## For Developers

The GPS feature is now **enabled by default**. The code in `GymListScreen_new.tsx`:

```typescript
// Automatically tries GPS on load
const location = await Location.getCurrentPositionAsync({});
dispatch(setLocation({
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
}));
setUsingGPS(true);
```

To disable GPS and use default location only, see `GPS_LOCATION_GUIDE.md`.
