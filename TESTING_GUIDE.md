# GYMFU Testing Guide

## Current Implementation Status

### ✅ Completed Features
1. Backend API with health check
2. Database connections (PostgreSQL, MongoDB, Redis)
3. Web frontend with backend integration
4. Mobile app with platform-specific API URLs

## Testing Checklist

### Backend Testing

#### 1. Start Backend Server
```bash
cd backend
npm run dev
```

**Expected Output:**
```
✅ PostgreSQL connected successfully
✅ MongoDB connected successfully
✅ Redis connected successfully
🎉 All databases connected successfully
🚀 Server is running on http://localhost:3000
```

#### 2. Test Health Endpoint
```bash
curl http://localhost:3000/health
```

**Expected Response:**
```json
{
  "success": true,
  "message": "GYMFU API is running",
  "timestamp": "2025-11-12T16:25:00.095Z"
}
```

#### 3. Test Database Health
```bash
curl http://localhost:3000/health/db
```

**Expected Response:**
```json
{
  "success": true,
  "databases": {
    "postgres": true,
    "mongodb": true,
    "redis": true
  },
  "timestamp": "2025-11-12T16:25:00.095Z"
}
```

### Web App Testing

#### 1. Start Web App
```bash
cd web
npm run dev
```

**Expected Output:**
```
VITE v7.2.2  ready in 278 ms
➜  Local:   http://localhost:5173/
```

#### 2. Open in Browser
Navigate to: http://localhost:5173

**Expected UI:**
- ✅ Purple gradient background
- ✅ "GYMFU" header with emoji
- ✅ "Your Fitness, Your Way - Pay Per Session" subtitle
- ✅ Backend API Status section showing green success box
- ✅ "GYMFU API is running" message
- ✅ Timestamp displayed
- ✅ Four feature cards (Discover Gyms, Pay Per Session, AI Coach, Marketplace)

#### 3. Test Backend Connection
- The page should automatically check backend health on load
- If backend is running: Green success box
- If backend is down: Red error box

#### 4. Test Responsiveness
- Resize browser window
- Feature cards should adjust to screen size
- Layout should remain readable on mobile sizes

### Mobile App Testing

#### 1. Start Mobile App
```bash
cd mobile
npm start
```

**Expected Output:**
```
› Metro waiting on exp://192.168.1.107:8082
› Scan the QR code above with Expo Go
```

#### 2. Test on Web
Press 'w' in the terminal or navigate to the provided URL

**Expected UI:**
- ✅ Purple header with "GYMFU" title
- ✅ Backend API Status card
- ✅ Green success message if backend is running
- ✅ Four feature cards
- ✅ Pull-to-refresh functionality

#### 3. Test on Android Emulator
Press 'a' in the terminal

**Requirements:**
- Android Studio installed
- Android emulator running
- Backend accessible at http://10.0.2.2:3000

**Expected Behavior:**
- App launches in emulator
- Shows GYMFU home screen
- Connects to backend successfully
- Pull-to-refresh works

#### 4. Test on iOS Simulator (Mac only)
Press 'i' in the terminal

**Requirements:**
- Xcode installed
- iOS simulator running
- Backend accessible at http://localhost:3000

**Expected Behavior:**
- App launches in simulator
- Shows GYMFU home screen
- Connects to backend successfully
- Pull-to-refresh works

#### 5. Test on Physical Device
Scan QR code with Expo Go app

**Requirements:**
- Expo Go app installed
- Device and computer on same WiFi
- Update API URL in `mobile/src/utils/api.ts` to use your computer's IP

**Steps:**
1. Find your computer's IP address:
   ```bash
   # Windows
   ipconfig
   # Look for IPv4 Address (e.g., 192.168.1.100)
   ```

2. Update `mobile/src/utils/api.ts`:
   ```typescript
   // For physical device testing, temporarily change to:
   const API_BASE_URL = 'http://YOUR_IP:3000';
   ```

3. Scan QR code with Expo Go
4. App should connect to backend

## Integration Testing

### Full Stack Test
1. Start all services:
   ```bash
   # Terminal 1: Databases
   cd backend
   docker-compose up -d

   # Terminal 2: Backend
   cd backend
   npm run dev

   # Terminal 3: Web
   cd web
   npm run dev

   # Terminal 4: Mobile
   cd mobile
   npm start
   ```

2. Verify all connections:
   - Backend: http://localhost:3000/health ✅
   - Web: http://localhost:5173 ✅
   - Mobile: Expo interface ✅

3. Test cross-platform:
   - Open web app in browser
   - Open mobile app on device/emulator
   - Both should show backend connected

## Common Issues and Solutions

### Backend won't start
- **Issue:** Port 3000 already in use
- **Solution:** Kill process on port 3000
  ```bash
  # Windows
  netstat -ano | findstr :3000
  taskkill /PID <PID> /F
  ```

### Database connection failed
- **Issue:** Databases not running
- **Solution:** Start Docker containers
  ```bash
  cd backend
  docker-compose up -d
  ```

### Web app can't connect to backend
- **Issue:** CORS or backend not running
- **Solution:** 
  1. Verify backend is running
  2. Check browser console for errors
  3. Verify CORS is enabled in backend

### Mobile app can't connect to backend
- **Issue:** Wrong API URL for platform
- **Solution:** 
  - Android emulator: Use `http://10.0.2.2:3000`
  - iOS simulator: Use `http://localhost:3000`
  - Physical device: Use `http://YOUR_IP:3000`

### Expo app shows blank screen
- **Issue:** JavaScript error or build issue
- **Solution:**
  ```bash
  cd mobile
  npx expo start --clear
  ```

## Performance Testing

### Backend Response Time
```bash
# Test health endpoint response time
curl -w "@-" -o /dev/null -s http://localhost:3000/health <<'EOF'
    time_namelookup:  %{time_namelookup}\n
       time_connect:  %{time_connect}\n
    time_appconnect:  %{time_appconnect}\n
      time_redirect:  %{time_redirect}\n
 time_starttransfer:  %{time_starttransfer}\n
                    ----------\n
         time_total:  %{time_total}\n
EOF
```

**Expected:** < 100ms for health check

### Web App Load Time
- Open browser DevTools > Network tab
- Reload page
- Check "Load" time

**Expected:** < 2 seconds

### Mobile App Launch Time
- Time from app launch to UI display

**Expected:** < 3 seconds

## Test Results Template

```
Date: ___________
Tester: ___________

Backend:
[ ] Health endpoint responds
[ ] Database connections work
[ ] Response time < 100ms

Web App:
[ ] Loads successfully
[ ] Backend status shows connected
[ ] UI renders correctly
[ ] Responsive design works

Mobile App:
[ ] Launches successfully
[ ] Backend status shows connected
[ ] Pull-to-refresh works
[ ] Platform detection works

Issues Found:
1. ___________
2. ___________

Notes:
___________
```

## Next Testing Phase

After implementing authentication (Task 2.x):
- Test user registration
- Test OTP verification
- Test login flow
- Test JWT token handling
- Test protected routes

After implementing gym discovery (Task 3.x):
- Test gym search
- Test geospatial queries
- Test filtering
- Test gym details display
