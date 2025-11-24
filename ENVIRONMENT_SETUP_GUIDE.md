# Environment Setup Guide - Quick Reference

## 🎯 Quick Switch Guide

### Web App

| Scenario | File | Setting | Command |
|----------|------|---------|---------|
| **Local Dev** | `web/.env.local` | `VITE_API_URL=http://localhost:3000/api/v1` | `npm run dev` |
| **Production** | `web/.env` | `VITE_API_URL=https://gymfu-backend.onrender.com/api/v1` | Deploy to Vercel |

**Note**: `.env.local` automatically overrides `.env` in development.

---

### Mobile App

| Scenario | File | Setting | Command |
|----------|------|---------|---------|
| **Local Dev** | `mobile/src/utils/api.ts` | `USE_PRODUCTION = false` | `expo start` |
| **Production** | `mobile/src/utils/api.ts` | `USE_PRODUCTION = true` | `expo start` |

**Note**: Look for console logs to confirm which backend is being used.

---

## 📋 Current Status

### ✅ Web App
- **Production**: Configured in `web/.env`
- **Local**: Configured in `web/.env.local` (just created)
- **Status**: Ready for both environments

### ✅ Mobile App
- **Production**: `USE_PRODUCTION = true` (currently active)
- **Local**: `USE_PRODUCTION = false` (switch when needed)
- **Status**: Currently using production backend

---

## 🔄 How to Switch

### Switch Web to Local Development
```bash
# Already configured! Just run:
cd web
npm run dev
# Uses .env.local automatically → http://localhost:3000/api/v1
```

### Switch Web to Production
```bash
# Deploy to Vercel (uses .env automatically)
# Or test locally:
cd web
npm run build
npm run preview
# Uses .env → https://gymfu-backend.onrender.com/api/v1
```

### Switch Mobile to Local Development
1. Open `mobile/src/utils/api.ts`
2. Find line: `const USE_PRODUCTION = true;`
3. Change to: `const USE_PRODUCTION = false;`
4. Save and restart Expo

```bash
cd mobile
expo start
# Look for: "📡 Using DEVELOPMENT backend (local)"
```

### Switch Mobile to Production
1. Open `mobile/src/utils/api.ts`
2. Find line: `const USE_PRODUCTION = false;`
3. Change to: `const USE_PRODUCTION = true;`
4. Save and restart Expo

```bash
cd mobile
expo start
# Look for: "📡 Using PRODUCTION backend: https://gymfu-backend.onrender.com"
```

---

## 🧪 Testing Checklist

### Before Testing Locally

- [ ] Backend is running: `cd backend && npm run dev`
- [ ] Backend is on port 3000
- [ ] Web `.env.local` exists with local URL
- [ ] Mobile `USE_PRODUCTION = false`

### Before Testing Production

- [ ] Render backend is deployed and running
- [ ] Gyms table exists on Render: `npm run db:create-gyms-render`
- [ ] Gyms are seeded on Render: `npm run db:seed-gyms-render`
- [ ] Web `.env` has production URL
- [ ] Mobile `USE_PRODUCTION = true`

---

## 🐛 Troubleshooting

### Web: Can't connect to local backend
```bash
# Check if backend is running
cd backend
npm run dev

# Check .env.local exists
cat web/.env.local

# Should show: VITE_API_URL=http://localhost:3000/api/v1
```

### Mobile: Can't connect to local backend
```bash
# Check USE_PRODUCTION setting
# Open mobile/src/utils/api.ts
# Verify: const USE_PRODUCTION = false;

# Check backend is running
cd backend
npm run dev

# Restart Expo
cd mobile
expo start
```

### Mobile: Can't connect to production backend
```bash
# Check USE_PRODUCTION setting
# Open mobile/src/utils/api.ts
# Verify: const USE_PRODUCTION = true;

# Check Render backend is running
# Visit: https://gymfu-backend.onrender.com/api/v1/health

# Restart Expo
cd mobile
expo start
```

---

## 📱 Mobile Platform-Specific URLs

When `USE_PRODUCTION = false`, mobile uses:

| Platform | URL | Notes |
|----------|-----|-------|
| **Android Emulator** | `http://10.0.2.2:3000/api/v1` | Special IP for host machine |
| **iOS Simulator** | `http://localhost:3000/api/v1` | Direct localhost access |
| **Physical Device** | `http://YOUR_IP:3000/api/v1` | Auto-detected from Expo |

---

## ✅ Sanity Check Results

### Web Configuration
- ✅ Production config: `web/.env` → Render backend
- ✅ Local config: `web/.env.local` → Local backend
- ✅ Example file: `web/.env.example` → Documentation

### Mobile Configuration
- ✅ Production: `USE_PRODUCTION = true` → Render backend
- ✅ Local: `USE_PRODUCTION = false` → Local backend
- ✅ Platform detection: Auto-detects Android/iOS/Physical device
- ✅ Console logging: Shows which backend is being used

### Backend Configuration
- ✅ CORS: Configured for both Vercel and mobile apps
- ✅ Local: Runs on `http://localhost:3000`
- ✅ Production: Deployed on Render

---

## 🎉 Summary

**Everything is configured correctly!**

- **Web**: Automatically uses correct backend based on `.env.local` (local) or `.env` (production)
- **Mobile**: Toggle `USE_PRODUCTION` flag to switch between local and production
- **Backend**: Same backend works for both web and mobile

**Current State**:
- Web: Ready for both local and production
- Mobile: Currently set to production (change to `false` for local dev)
- Backend: Deployed on Render, ready to use
