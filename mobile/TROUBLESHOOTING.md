# Troubleshooting Guide

## Common Issues

### Java.lang.String cannot be cast to java.lang.Boolean

This error typically occurs due to configuration issues in `app.json`. 

**Solution:**
1. Clear Expo cache:
   ```bash
   npx expo start --clear
   ```

2. If that doesn't work, clear Android build cache:
   ```bash
   cd android
   ./gradlew clean
   cd ..
   ```

3. Restart the development server:
   ```bash
   npm start
   ```

### Port Already in Use

If you see "Port 8081 is being used":
- Expo will automatically suggest using another port (8082, 8083, etc.)
- Or kill the process using the port:
  ```bash
  # Windows
  netstat -ano | findstr :8081
  taskkill /PID <PID> /F
  ```

### Cannot Connect to Backend

**For Android Emulator:**
- Use `http://10.0.2.2:3000` in `src/utils/api.ts`
- Make sure backend is running on port 3000

**For iOS Simulator:**
- Use `http://localhost:3000` in `src/utils/api.ts`

**For Physical Device:**
1. Find your computer's IP address:
   ```bash
   # Windows
   ipconfig
   # Look for IPv4 Address
   ```
2. Update `src/utils/api.ts`:
   ```typescript
   const API_BASE_URL = 'http://YOUR_IP:3000';
   ```
3. Make sure your phone and computer are on the same WiFi network
4. Ensure port 3000 is not blocked by firewall

### Metro Bundler Issues

**Clear cache and restart:**
```bash
npx expo start --clear
```

**Reset everything:**
```bash
rm -rf node_modules
npm install
npx expo start --clear
```

### Android Emulator Not Starting

1. Make sure Android Studio is installed
2. Open Android Studio > AVD Manager
3. Create a new Virtual Device if needed
4. Start the emulator manually
5. Then run `npm run android`

### Expo Go App Not Connecting

1. Make sure both devices are on the same WiFi
2. Try restarting Expo development server
3. Try scanning QR code again
4. Check if firewall is blocking the connection

### Module Not Found Errors

```bash
npm install
npx expo start --clear
```

### Version Compatibility Warnings

If you see warnings about package versions:
```bash
npx expo install --fix
```

This will install the correct versions for your Expo SDK.

## Getting Help

If none of these solutions work:
1. Check the full error message in the terminal
2. Check the error in Expo Go app or emulator
3. Look for errors in the Metro bundler output
4. Try running on a different platform (Android vs iOS vs Web)
