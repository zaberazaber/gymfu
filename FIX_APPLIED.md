# Fix Applied: Route /auth/register Not Found

## Problem
When trying to register a user through the web UI, the error "Route /auth/register not found" was occurring.

## Root Cause
The `.env` file in the web directory had:
```
VITE_API_URL=http://localhost:3000
```

This caused the frontend to make requests to:
- `http://localhost:3000/auth/register` ❌

But the backend API is actually at:
- `http://localhost:3000/api/v1/auth/register` ✅

## Solution
Updated `web/.env` to include the full API path:
```
VITE_API_URL=http://localhost:3000/api/v1
```

## Changes Made
1. Updated `web/.env` file
2. Restarted web development server to pick up new environment variable

## How to Verify the Fix

### Method 1: Test via Web UI
1. Open http://localhost:5173
2. Click "Register"
3. Fill in the form:
   - Name: Test User
   - Phone: 9876543210
   - Password: Test@1234
   - Confirm Password: Test@1234
4. Click "Create Account"
5. Should now successfully send request to backend

### Method 2: Check Browser DevTools
1. Open http://localhost:5173
2. Open DevTools (F12) → Network tab
3. Try to register
4. Check the request URL - should be: `http://localhost:3000/api/v1/auth/register`

### Method 3: Test API Directly
```powershell
# This should work
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/auth/register" -Method POST `
  -Body (@{name="Test";phoneNumber="9876543210";password="Test@1234"} | ConvertTo-Json) `
  -ContentType "application/json"
```

## Expected Behavior After Fix

1. ✅ Registration form submits successfully
2. ✅ OTP is generated and sent (check backend console)
3. ✅ User is redirected to OTP verification page
4. ✅ After OTP verification, user is logged in
5. ✅ Homepage shows "Welcome, [User Name]!"

## API Endpoints (Correct URLs)

All API endpoints are under `/api/v1`:

- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login existing user
- `POST /api/v1/auth/verify-otp` - Verify OTP
- `GET /api/v1/users/me` - Get current user (protected)

## Notes

- Environment variables in Vite require the `VITE_` prefix
- Changes to `.env` files require restarting the dev server
- The `import.meta.env.VITE_API_URL` is used in `web/src/store/authSlice.ts`
- If the env variable is not set, it falls back to `http://localhost:3000/api/v1`

## Additional Fix: Health Endpoint

### Problem
After fixing the API URL, the homepage was showing "Failed to connect to backend API" because it was trying to call `/api/v1/health` which doesn't exist.

### Root Cause
The health endpoint is at the root level (`/health`), not under `/api/v1`. When we updated the API base URL to include `/api/v1`, the health check started failing.

### Solution
Updated `HomePage.tsx` to call the health endpoint directly using `fetch` instead of the `api` utility:
```typescript
// Before (incorrect)
const response = await api.get<HealthResponse>('/health');
// This was calling: http://localhost:3000/api/v1/health ❌

// After (correct)
const response = await fetch('http://localhost:3000/health');
// This calls: http://localhost:3000/health ✅
```

## Endpoint Structure

### Root Level Endpoints (no /api/v1 prefix)
- `GET /health` - API health check
- `GET /health/db` - Database health check

### API Endpoints (under /api/v1)
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login existing user  
- `POST /api/v1/auth/verify-otp` - Verify OTP
- `GET /api/v1/users/me` - Get current user (protected)

## Status
✅ **FIXED** - Web server restarted with correct API URL configuration
✅ **FIXED** - Health endpoint now calls correct URL
