# API Configuration Sanity Check

## Current Configuration Status

### ✅ WEB APP (React + Vite)

#### Production Configuration
- **File**: `web/.env`
- **API URL**: `https://gymfu-backend.onrender.com/api/v1`
- **Status**: ✅ CORRECT - Points to Render backend
- **Used When**: Deployed on Vercel or production build

#### Local Development Configuration
- **File**: `web/src/utils/api.ts`
- **API URL**: Falls back to `http://localhost:3000` if `VITE_API_URL` not set
- **Status**: ⚠️ NEEDS LOCAL .env FILE
- **Used When**: Running `npm run dev` locally

**Issue Found**: Web app doesn't have a `.env.local` file for local development.

---

### ⚠️ MOBILE APP (React Native + Expo)

#### Production Configuration
- **File**: `mobile/src/utils/api.ts`
- **API URL**: `https://gymfu-backend.onrender.com/api/v1`
- **Toggle**: `USE_PRODUCTION = true`
- **Status**: ✅ CURRENTLY SET TO PRODUCTION
- **Used When**: Testing with production backend or production builds

#### Local Development Configuration
- **File**: `mobile/src/utils/api.ts`
- **API URL**: Auto-detects based on platform:
  - Android Emulator: `http://10.0.2.2:3000/api/v1`
  - iOS Simulator: `http://localhost:3000/api/v1`
  - Physical Device: `http://{YOUR_IP}:3000/api/v1`
- **Toggle**: `USE_PRODUCTION = false`
- **Status**: ⚠️ CURRENTLY DISABLED (using production)
- **Used When**: Running `expo start` with local backend

**Issue Found**: Mobile is currently set to production. Need to toggle for local dev.

---

## Issues to Fix

### 1. Web App - Missing Local Development .env
**Problem**: When running locally, web app should use local backend, not production.

**Solution**: Create `web/.env.local` file

### 2. Mobile App - Production Toggle
**Problem**: Currently hardcoded to production. Should be easy to switch.

**Solution**: Better environment detection or clear instructions

---

## Fixes Applied

### Fix 1: Create web/.env.local for Local Development
```env
VITE_API_URL=http://localhost:3000/api/v1
```

### Fix 2: Create web/.env.example for Documentation
```env
# For Production (Vercel)
VITE_API_URL=https://gymfu-backend.onrender.com/api/v1

# For Local Development (create .env.local with this)
# VITE_API_URL=http://localhost:3000/api/v1
```

### Fix 3: Add Clear Instructions to Mobile API Config
Added comments explaining how to switch between local and production.

---

## Configuration Matrix

| Environment | Web API URL | Mobile API URL | How to Set |
|-------------|-------------|----------------|------------|
| **Local Dev** | `http://localhost:3000/api/v1` | `http://10.0.2.2:3000/api/v1` (Android)<br>`http://localhost:3000/api/v1` (iOS) | Web: Use `.env.local`<br>Mobile: Set `USE_PRODUCTION = false` |
| **Production** | `https://gymfu-backend.onrender.com/api/v1` | `https://gymfu-backend.onrender.com/api/v1` | Web: Use `.env`<br>Mobile: Set `USE_PRODUCTION = true` |
| **Testing Prod on Mobile** | N/A | `https://gymfu-backend.onrender.com/api/v1` | Mobile: Set `USE_PRODUCTION = true` |

---

## How to Switch Environments

### Web App

**For Local Development:**
1. Create `web/.env.local`:
   ```env
   VITE_API_URL=http://localhost:3000/api/v1
   ```
2. Restart dev server: `npm run dev`

**For Production:**
1. Use `web/.env` (already configured)
2. Deploy to Vercel

**Priority**: `.env.local` > `.env` (Vite automatically prioritizes .env.local)

---

### Mobile App

**For Local Development:**
1. Open `mobile/src/utils/api.ts`
2. Change: `const USE_PRODUCTION = false;`
3. Restart Expo: `expo start`

**For Production Testing:**
1. Open `mobile/src/utils/api.ts`
2. Change: `const USE_PRODUCTION = true;`
3. Restart Expo: `expo start`

**For Production Build:**
- Production builds automatically use production URL (no change needed)

---

## Verification Commands

### Test Web Local
```bash
cd web
npm run dev
# Should connect to http://localhost:3000/api/v1
```

### Test Web Production
```bash
cd web
npm run build
npm run preview
# Should connect to https://gymfu-backend.onrender.com/api/v1
```

### Test Mobile Local
```bash
cd mobile
# Set USE_PRODUCTION = false in src/utils/api.ts
expo start
# Check console logs for: "📡 Using DEVELOPMENT backend"
```

### Test Mobile Production
```bash
cd mobile
# Set USE_PRODUCTION = true in src/utils/api.ts
expo start
# Check console logs for: "📡 Using PRODUCTION backend: https://gymfu-backend.onrender.com"
```

---

## Console Log Indicators

### Web App
- No automatic logging (check Network tab in browser DevTools)
- API calls will show the baseURL in network requests

### Mobile App
- ✅ **Production**: `📡 Using PRODUCTION backend: https://gymfu-backend.onrender.com`
- ✅ **Local - Android**: `📡 Using DEVELOPMENT backend` → `🤖 Android emulator detected`
- ✅ **Local - iOS**: `📡 Using DEVELOPMENT backend` → `🍎 iOS simulator detected`
- ✅ **Local - Physical**: `📡 Using DEVELOPMENT backend` → `📱 Physical device detected, using: http://192.168.x.x:3000`

---

## Common Issues & Solutions

### Web: "Network Error" in Local Dev
- ✅ Check if backend is running: `cd backend && npm run dev`
- ✅ Verify `.env.local` exists with correct URL
- ✅ Restart Vite dev server

### Mobile: "Network Error" in Local Dev
- ✅ Check if backend is running: `cd backend && npm run dev`
- ✅ Verify `USE_PRODUCTION = false`
- ✅ For Android emulator, backend must be on `http://10.0.2.2:3000`
- ✅ For physical device, use your computer's IP address
- ✅ Restart Expo app

### Mobile: "No gyms found" in Production
- ✅ Run migrations on Render: `npm run db:create-gyms-render`
- ✅ Seed gyms on Render: `npm run db:seed-gyms-render`
- ✅ Verify `USE_PRODUCTION = true`

### Web: "No gyms found" in Production
- ✅ Same as mobile - check Render database has gyms table and data
- ✅ Check CORS settings in backend allow Vercel domain

---

## Summary

✅ **Web Production**: Configured correctly via `.env`
⚠️ **Web Local**: Needs `.env.local` file (creating now)
✅ **Mobile Production**: Configured correctly via `USE_PRODUCTION = true`
⚠️ **Mobile Local**: Need to toggle `USE_PRODUCTION = false` for local dev

All configurations are now documented and ready to use!
