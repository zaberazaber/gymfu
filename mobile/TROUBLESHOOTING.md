# Mobile App Troubleshooting

## Common Issues

### "Unable to resolve react-native-screens"

This error occurs when React Navigation dependencies aren't properly installed.

**Solution:**
```bash
# Install correct versions
npx expo install react-native-screens react-native-safe-area-context

# Clear cache and restart
npx expo start --clear
```

### Metro Bundler Issues

**Clear all caches:**
```bash
# Remove node_modules
rm -rf node_modules

# Remove cache directories
rm -rf .expo
rm -rf node_modules/.cache

# Reinstall
npm install

# Start with clear cache
npx expo start --clear
```

### Android Build Errors

**Reset everything:**
```bash
# Clear Expo cache
npx expo start --clear

# If that doesn't work, reset the project
rm -rf node_modules
rm -rf .expo
npm install
npx expo start --clear
```

### Backend Connection Issues

See main TROUBLESHOOTING.md for backend connection issues.

## Quick Fixes

### 1. Dependency Issues
```bash
npx expo install --fix
```

### 2. Cache Issues
```bash
npx expo start --clear
```

### 3. Complete Reset
```bash
rm -rf node_modules .expo
npm install
npx expo start --clear
```

## Getting Help

If issues persist:
1. Check the error message in Metro bundler
2. Check the error in Expo Go app
3. Try running on a different platform (Android vs iOS vs Web)
4. Check if backend is running on correct port
