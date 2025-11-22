# 📱 Run GYMFU on iPhone - Setup Guide

## Prerequisites
✅ Backend running on http://localhost:3000
✅ Mobile app running (React Native/Expo)
✅ iPhone and PC on the **same WiFi network**

## Step-by-Step Instructions

### 1️⃣ Install Expo Go on iPhone
1. Open **App Store** on your iPhone
2. Search for **"Expo Go"**
3. Download and install (free app)

### 2️⃣ Find Your Connection URL

**Option A: Look for QR Code in Terminal**
- In the terminal where mobile app is running, look for a QR code
- It should show something like: `exp://192.168.x.x:8081`

**Option B: Press 'shift + i' in Terminal**
- Focus on the terminal running the mobile app
- Press `shift + i` to show iOS connection options
- This will display the connection URL

**Option C: Check Metro Bundler Output**
- Look for output like: `Metro waiting on exp://192.168.x.x:8081`
- Note down this URL

### 3️⃣ Connect iPhone to the App

**Method 1: Scan QR Code (Easiest)**
1. Open **Camera** app on iPhone
2. Point at the QR code in terminal
3. Tap the notification that appears
4. App will open in Expo Go

**Method 2: Manual URL Entry**
1. Open **Expo Go** app on iPhone
2. Tap **"Enter URL manually"**
3. Type the URL from terminal (e.g., `exp://192.168.1.100:8081`)
4. Tap **"Connect"**

### 4️⃣ Troubleshooting

**If app doesn't connect:**

1. **Check WiFi Network**
   - Ensure iPhone and PC are on the SAME WiFi
   - Disable VPN if active
   - Check firewall isn't blocking port 8081

2. **Find Your PC's IP Address**
   ```bash
   # In PowerShell or CMD
   ipconfig
   ```
   - Look for "IPv4 Address" under your WiFi adapter
   - Should be something like: 192.168.1.100

3. **Restart Metro Bundler**
   - In the mobile terminal, press `r` to reload
   - Or stop and restart: `npm start -- --clear`

4. **Use Tunnel Mode (Slower but works anywhere)**
   - Stop the current process
   - Run: `npx expo start --tunnel`
   - This works even if not on same WiFi (uses Expo servers)

### 5️⃣ What You'll See on iPhone

Once connected, the GYMFU app will load with:
- 🏋️ **Home Screen** - Welcome screen with login/register
- 📱 **Partner Registration** - Checkbox to register as gym partner
- 🏢 **Partner Dashboard** - View your gyms (if registered as partner)
- 🗺️ **Gym Discovery** - Find gyms near you
- 👤 **Profile** - View and edit your profile

### 6️⃣ Testing Partner Features on iPhone

1. **Register as Partner:**
   - Tap "Register"
   - Fill in details
   - ✅ Check "Register as a Gym Partner"
   - Complete OTP verification

2. **Access Partner Dashboard:**
   - After login, you'll see "Partner Dashboard" button
   - Tap to view your gyms
   - See stats: Total Gyms, Verified, Avg Rating, Avg Price

3. **View Gym Details:**
   - Tap on any gym card
   - See full gym information
   - Note: Gym creation/editing is web-only

## 🔧 Current App Status

✅ **Backend API**: Running on port 3000
✅ **Web App**: Running on port 5173
✅ **Mobile App**: Running (currently showing Android)
✅ **Database**: PostgreSQL with gyms data

## 📊 Features Available on iPhone

### For Regular Users:
- ✅ Registration with phone/email
- ✅ OTP verification
- ✅ Profile management
- ✅ Gym discovery with GPS
- ✅ Gym search with filters
- ✅ View gym details

### For Partners:
- ✅ Partner registration
- ✅ Partner dashboard
- ✅ View owned gyms
- ✅ See gym statistics
- ⚠️ Gym creation (web only)
- ⚠️ Gym editing (web only)

## 💡 Tips

1. **Keep Terminal Open**: Don't close the terminal running the mobile app
2. **Shake to Debug**: Shake your iPhone to open developer menu
3. **Reload**: In Expo Go, shake phone and tap "Reload" if needed
4. **Same WiFi**: Most important - both devices must be on same network

## 🆘 Need Help?

If you see errors:
1. Check the terminal for error messages
2. Ensure backend is running (http://localhost:3000)
3. Try reloading the app (shake phone → Reload)
4. Check iPhone and PC are on same WiFi

## 🎉 Success!

Once connected, you'll see the GYMFU app running natively on your iPhone with all features working!

---

**Note**: The app uses the same backend as web and Android, so all data is synced across platforms.
