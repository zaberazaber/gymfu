# Building Production Apps for GYMFU

This guide covers how to build production-ready APK (Android) and IPA (iOS) files for distribution.

## Prerequisites

Before building, ensure you have:
- An Expo account (sign up at https://expo.dev)
- EAS CLI installed globally
- Your app configured properly

## Step 1: Install EAS CLI

```bash
npm install -g eas-cli
```

## Step 2: Login to Expo

```bash
cd mobile
eas login
```

Enter your Expo credentials when prompted.

## Step 3: Configure Your Project

### Initialize EAS Build

```bash
eas build:configure
```

This creates an `eas.json` file in your mobile directory.

### Update app.json

Make sure your `mobile/app.json` has proper configuration:

```json
{
  "expo": {
    "name": "GYMFU",
    "slug": "gymfu",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.gymfu.in"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.gymfu.in"
    },
    "extra": {
      "eas": {
        "projectId": "your-project-id"
      }
    }
  }
}
```

## Step 4: Build for Android (APK)

### Option A: Build APK for Testing (Recommended for First Build)

```bash
eas build --platform android --profile preview
```

This creates an APK file you can install directly on Android devices.

### Option B: Build AAB for Google Play Store

```bash
eas build --platform android --profile production
```

This creates an Android App Bundle (AAB) for uploading to Google Play Store.

### Download Your APK/AAB

After the build completes:
1. You'll get a link to download the file
2. Or visit https://expo.dev/accounts/[your-account]/projects/gymfu/builds
3. Download the APK/AAB file

### Install APK on Android Device

1. Transfer the APK to your Android device
2. Enable "Install from Unknown Sources" in Settings
3. Tap the APK file to install
4. Open the GYMFU app

## Step 5: Build for iOS (IPA)

### Prerequisites for iOS

- Apple Developer Account ($99/year)
- Enrolled in Apple Developer Program

### Option A: Build for TestFlight/App Store

```bash
eas build --platform ios --profile production
```

### Option B: Build for Ad-Hoc Distribution (Testing)

```bash
eas build --platform ios --profile preview
```

### iOS Build Process

1. EAS will prompt you to create/select credentials
2. Choose "Let Expo handle the process" for easier setup
3. Wait for the build to complete (10-20 minutes)

### Download Your IPA

After the build completes:
1. Download the IPA from the provided link
2. Or visit https://expo.dev/accounts/[your-account]/projects/gymfu/builds

### Install IPA on iPhone

#### Method 1: TestFlight (Recommended)
1. Upload IPA to App Store Connect
2. Add testers in TestFlight
3. Testers install via TestFlight app

#### Method 2: Direct Installation (Ad-Hoc builds only)
1. Use Apple Configurator 2 (Mac only)
2. Or use services like Diawi.com to distribute

## Step 6: Configure Build Profiles

Edit `mobile/eas.json` to customize build profiles:

```json
{
  "cli": {
    "version": ">= 5.2.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      },
      "ios": {
        "simulator": false
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      },
      "ios": {
        "simulator": false
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

## Step 7: Environment Variables

If your app uses environment variables, create `mobile/.env.production`:

```env
API_URL=https://your-production-api.com
```

Then update `eas.json`:

```json
{
  "build": {
    "production": {
      "env": {
        "API_URL": "https://your-production-api.com"
      }
    }
  }
}
```

## Quick Build Commands Reference

```bash
# Android APK (for testing/distribution)
eas build --platform android --profile preview

# Android AAB (for Google Play Store)
eas build --platform android --profile production

# iOS IPA (for TestFlight/App Store)
eas build --platform ios --profile production

# Build both platforms
eas build --platform all --profile production

# Check build status
eas build:list

# View build logs
eas build:view [build-id]
```

## Troubleshooting

### Build Fails

1. Check build logs: `eas build:view [build-id]`
2. Ensure all dependencies are properly installed
3. Verify app.json configuration
4. Check for TypeScript errors: `npm run tsc --noEmit`

### Android: "Package name already exists"

Change the package name in `app.json`:
```json
"android": {
  "package": "com.yourcompany.gymfu.v2"
}
```

### iOS: Certificate Issues

Run: `eas credentials` to manage iOS certificates and provisioning profiles.

### App Crashes on Launch

1. Check that API_URL points to accessible backend
2. Verify all required permissions are in app.json
3. Test with development build first

## Publishing to Stores

### Google Play Store

1. Create a Google Play Developer account ($25 one-time fee)
2. Build AAB: `eas build --platform android --profile production`
3. Go to Google Play Console
4. Create new app and upload AAB
5. Fill in store listing details
6. Submit for review

### Apple App Store

1. Create App Store Connect account (requires Apple Developer Program)
2. Build IPA: `eas build --platform ios --profile production`
3. Upload to App Store Connect using Transporter app or EAS Submit:
   ```bash
   eas submit --platform ios
   ```
4. Fill in app information in App Store Connect
5. Submit for review

## Automated Submission

Use EAS Submit for automated store submission:

```bash
# Submit to Google Play
eas submit --platform android

# Submit to App Store
eas submit --platform ios
```

## Update Over-the-Air (OTA)

For JavaScript-only updates without rebuilding:

```bash
# Publish update
eas update --branch production --message "Bug fixes"
```

Configure in `app.json`:
```json
"updates": {
  "url": "https://u.expo.dev/[your-project-id]"
}
```

## Build Locally (Alternative)

If you prefer local builds:

### Android Local Build
```bash
cd mobile
npx expo prebuild
cd android
./gradlew assembleRelease
# APK will be in: android/app/build/outputs/apk/release/
```

### iOS Local Build (Mac only)
```bash
cd mobile
npx expo prebuild
cd ios
pod install
# Open .xcworkspace in Xcode and build
```

## Important Notes

1. **First Build**: Takes 15-30 minutes
2. **Subsequent Builds**: Usually faster (5-15 minutes)
3. **Free Tier**: Expo provides limited free builds per month
4. **Paid Plans**: For unlimited builds, consider Expo EAS subscription
5. **Bundle Identifier**: Must be unique (use reverse domain: com.yourcompany.gymfu)
6. **Version Management**: Increment version in app.json for each release

## Next Steps

1. Test the built app thoroughly on real devices
2. Set up continuous deployment with GitHub Actions
3. Configure app signing for automatic updates
4. Set up crash reporting (Sentry, Bugsnag)
5. Implement analytics (Firebase, Amplitude)

## Resources

- EAS Build Documentation: https://docs.expo.dev/build/introduction/
- EAS Submit Documentation: https://docs.expo.dev/submit/introduction/
- App Store Guidelines: https://developer.apple.com/app-store/review/guidelines/
- Google Play Policies: https://play.google.com/about/developer-content-policy/

---

For questions or issues, refer to Expo documentation or the Expo Discord community.
