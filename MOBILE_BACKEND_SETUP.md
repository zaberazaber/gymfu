# Mobile App Backend Configuration

## Yes, the Same Backend Works for Mobile! 🎉

Your Render backend at `https://gymfu-backend.onrender.com` will work perfectly for your mobile app. Both the web app and mobile app can use the same backend API.

## How It Works

The mobile app (`mobile/src/utils/api.ts`) is configured to automatically detect the environment:

### Development Mode (Default)
- **Android Emulator**: Uses `http://10.0.2.2:3000` (local backend)
- **iOS Simulator**: Uses `http://localhost:3000` (local backend)
- **Physical Device**: Auto-detects your computer's IP (e.g., `http://192.168.1.107:3000`)

### Production Mode
- **All Devices**: Uses `https://gymfu-backend.onrender.com` (Render backend)

## Switching to Production Backend

To test your mobile app with the production Render backend:

### Option 1: Quick Toggle (Recommended for Testing)

1. Open `mobile/src/utils/api.ts`
2. Change this line:
   ```typescript
   const USE_PRODUCTION = false;
   ```
   to:
   ```typescript
   const USE_PRODUCTION = true;
   ```

3. Restart your Expo app

### Option 2: For Production Builds

When you build your mobile app for production (APK/IPA), it will automatically use the production backend.

## Benefits of This Setup

✅ **Same Backend**: Web and mobile share the same API, database, and authentication
✅ **Easy Development**: Test locally without internet connection
✅ **Easy Testing**: Switch to production backend with one line change
✅ **No CORS Issues**: Mobile apps don't have CORS restrictions like web browsers
✅ **Shared Data**: Users can log in on web or mobile and see the same data

## Current Backend Features Available to Mobile

All these features work on mobile through the Render backend:

- ✅ User registration and login
- ✅ OTP verification
- ✅ Profile management
- ✅ Gym search and discovery
- ✅ Gym details and ratings
- ✅ Partner dashboard
- ✅ Gym creation and editing
- ✅ Location-based search

## Testing with Production Backend

1. Make sure the gyms table is created on Render (run the migration)
2. Switch `USE_PRODUCTION = true` in `mobile/src/utils/api.ts`
3. Restart your Expo app
4. Test features like:
   - Registration/Login
   - Gym search
   - Profile updates
   - Partner features

## Debugging

The mobile app logs which backend it's using:
- Look for console messages like:
  - `📡 Using PRODUCTION backend: https://gymfu-backend.onrender.com`
  - `📡 Using DEVELOPMENT backend`
  - `📱 Physical device detected, using: http://192.168.1.107:3000`

## Important Notes

- **No Additional Setup Needed**: The Render backend already has CORS configured for mobile
- **Same Database**: Mobile and web share the same PostgreSQL database
- **Same Authentication**: JWT tokens work the same way
- **Same API Endpoints**: All `/api/v1/*` endpoints work identically

## Production Deployment

When you're ready to deploy your mobile app to app stores:

1. The production build will automatically use the Render backend
2. No code changes needed
3. Users will connect to `https://gymfu-backend.onrender.com`
4. Everything will work seamlessly

## Next Steps

1. ✅ Create the gyms table on Render (run the migration script)
2. ✅ Test mobile app with production backend (toggle `USE_PRODUCTION`)
3. ✅ Verify all features work
4. ✅ Build production APK/IPA when ready
