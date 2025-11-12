# GYMFU Mobile App

React Native mobile application built with Expo and TypeScript.

## Prerequisites

- Node.js (v18 or higher)
- Expo CLI
- Android Studio (for Android) or Xcode (for iOS)
- Expo Go app on your physical device (optional)

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Start the development server
```bash
npm start
```

This will open Expo Dev Tools in your browser.

## Running the App

### Option 1: Physical Device (Easiest)
1. Install "Expo Go" app from App Store (iOS) or Play Store (Android)
2. Run `npm start`
3. Scan the QR code with your device
4. Make sure your device and computer are on the same network

**Important:** Update the API URL in `src/utils/api.ts` to use your computer's IP address:
```typescript
const API_BASE_URL = 'http://YOUR_COMPUTER_IP:3000';
```

### Option 2: Android Emulator
1. Install Android Studio
2. Set up an Android Virtual Device (AVD)
3. Run `npm run android`

The app uses `http://10.0.2.2:3000` to connect to backend on localhost.

### Option 3: iOS Simulator (Mac only)
1. Install Xcode
2. Run `npm run ios`

The app uses `http://localhost:3000` to connect to backend.

### Option 4: Web Browser
```bash
npm run web
```

Opens the app in your web browser at http://localhost:8081

## Available Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android emulator
- `npm run ios` - Run on iOS simulator (Mac only)
- `npm run web` - Run in web browser

## Features

- ✅ React Native with Expo
- ✅ TypeScript
- ✅ React Navigation
- ✅ Axios for API calls
- ✅ Pull-to-refresh functionality
- ✅ Backend health check integration

## Project Structure

```
mobile/
├── src/
│   ├── screens/
│   │   └── HomeScreen.tsx
│   └── utils/
│       └── api.ts
├── assets/
├── App.tsx
└── package.json
```

## API Configuration

The app connects to the backend API at different URLs depending on the platform:

- **Android Emulator:** `http://10.0.2.2:3000`
- **iOS Simulator:** `http://localhost:3000`
- **Physical Device:** `http://YOUR_COMPUTER_IP:3000`

Update `src/utils/api.ts` if you need to change the API URL.

## Testing

1. Make sure the backend is running on http://localhost:3000
2. Start the mobile app: `npm start`
3. Run on your preferred platform
4. You should see the GYMFU home screen with backend status

## Troubleshooting

### Cannot connect to backend
- Make sure backend is running on port 3000
- For physical device, use your computer's IP address in `src/utils/api.ts`
- Check that your device and computer are on the same network
- Disable any firewall that might block port 3000

### Expo Go app not connecting
- Make sure both devices are on the same WiFi network
- Try restarting the Expo development server
- Clear Expo cache: `expo start -c`

### Android emulator issues
- Make sure Android Studio is properly installed
- Check that an AVD is created and running
- Try `npm run android` instead of using Expo Go

## Next Steps

- Add user authentication screens
- Add gym discovery screen
- Add booking flow
- Add marketplace
- Add AI coach interface
