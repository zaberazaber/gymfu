# GYMFU Testing Guide

## ✅ What's Been Completed

### Backend (Tasks 1.1 - 2.5)
- Express server with TypeScript
- PostgreSQL, MongoDB, Redis connections
- User registration and login endpoints
- OTP generation and verification
- JWT authentication middleware
- Protected routes
- Error handling and logging
- 67 passing tests

### Web Frontend (Task 2.6)
- React app with Vite
- Redux Toolkit state management
- Registration UI with validation
- OTP verification UI
- JWT token storage
- User authentication flow
- Responsive design

## 🧪 Testing the Registration Flow

### Step 1: Ensure Services are Running

```bash
# Check if Docker containers are running
docker ps

# Should see: postgres, mongo, redis containers

# Backend should be running on http://localhost:3000
# Web should be running on http://localhost:5173
```

### Step 2: Test via Web UI

1. **Open the web app**: http://localhost:5173

2. **Click "Register" button**

3. **Fill the registration form**:
   - Name: `Test User`
   - Toggle to Phone or Email
   - Phone: `9876543210` (or Email: `test@example.com`)
   - Password: `Test@1234`
   - Confirm Password: `Test@1234`

4. **Click "Create Account"**

5. **Check backend console** for OTP:
   - Look for a message like:
   ```
   ==================================================
   📱 SMS SENT
   To: 9876543210
   Message: Your GYMFU verification code is: 123456. Valid for 10 minutes.
   ==================================================
   ```

6. **Enter the 6-digit OTP** on the verification page

7. **Click "Verify OTP"**

8. **Success!** You should be redirected to the homepage showing:
   - "Welcome, Test User! 👋"
   - Your phone number or email
   - A "Logout" button

### Step 3: Test API Directly

```powershell
# 1. Register a user
$body = @{
    name = "API Test User"
    phoneNumber = "9123456789"
    password = "Test@1234"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/auth/register" `
    -Method POST -Body $body -ContentType "application/json"

# Check backend console for OTP

# 2. Verify OTP (replace YOUR_OTP with actual OTP from console)
$otpBody = @{
    phoneNumber = "9123456789"
    otp = "YOUR_OTP"
} | ConvertTo-Json

$authResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/auth/verify-otp" `
    -Method POST -Body $otpBody -ContentType "application/json"

# Save the token
$token = $authResponse.data.token

# 3. Test protected endpoint
$headers = @{
    Authorization = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:3000/api/v1/users/me" `
    -Method GET -Headers $headers
```

## 🎯 What to Test

### Registration Form Validation
- ✅ Name too short (< 2 characters)
- ✅ Invalid phone number (not 10 digits, doesn't start with 6-9)
- ✅ Invalid email format
- ✅ Weak password (< 8 chars, no uppercase, no lowercase, no number)
- ✅ Passwords don't match
- ✅ Toggle between phone and email

### OTP Verification
- ✅ Auto-focus on next input when typing
- ✅ Backspace focuses previous input
- ✅ Paste 6-digit code fills all inputs
- ✅ Submit button disabled until all 6 digits entered
- ✅ Invalid OTP shows error message
- ✅ Expired OTP shows error message

### Authentication Flow
- ✅ JWT token stored in localStorage
- ✅ User info displayed on homepage when logged in
- ✅ Logout clears token and redirects
- ✅ Protected routes require authentication

## 📊 Test Results

### Backend Tests
```bash
cd backend
npm test
```
Expected: **67 tests passing**
- 17 validation tests
- 21 formatting tests
- 3 error handler tests
- 9 auth middleware tests
- 5 auth integration tests
- 7 login integration tests
- 5 health endpoint tests

### API Endpoints Working
- ✅ `GET /health` - Health check
- ✅ `GET /health/db` - Database health
- ✅ `POST /api/v1/auth/register` - User registration
- ✅ `POST /api/v1/auth/login` - User login
- ✅ `POST /api/v1/auth/verify-otp` - OTP verification
- ✅ `GET /api/v1/users/me` - Get current user (protected)

### Web UI Working
- ✅ Homepage loads
- ✅ Registration page loads
- ✅ OTP verification page loads
- ✅ Form validation works
- ✅ API integration works
- ✅ Redux state management works
- ✅ Navigation works
- ✅ Responsive design works

## 🐛 Troubleshooting

### OTP not visible in logs
The OTP is printed to the backend console. If you don't see it:
1. Check the terminal where `npm run dev` is running in the backend folder
2. Look for the "SMS SENT" or "EMAIL SENT" message
3. The OTP is a 6-digit number

### Token not persisting
1. Open browser DevTools (F12)
2. Go to Application → Local Storage
3. Check if 'token' key exists
4. If not, check browser console for errors

### Backend not responding
1. Ensure Docker containers are running: `docker ps`
2. Ensure backend is running: `cd backend && npm run dev`
3. Check http://localhost:3000/health

### Web app not loading
1. Ensure web server is running: `cd web && npm run dev`
2. Check http://localhost:5173
3. Clear browser cache and reload

## 🎉 Success Criteria

All of the following should work:

1. ✅ User can register with phone or email
2. ✅ OTP is generated and can be verified
3. ✅ JWT token is returned and stored
4. ✅ User can access protected endpoints with token
5. ✅ Homepage shows user info when logged in
6. ✅ User can logout
7. ✅ Form validation prevents invalid input
8. ✅ Error messages are clear and helpful
9. ✅ UI is responsive and looks good
10. ✅ All backend tests pass

## 📝 Notes

- OTP expires in 10 minutes
- JWT token expires in 7 days
- In development, OTP is printed to console
- In production, OTP would be sent via SMS/Email service
- Password must be at least 8 characters with uppercase, lowercase, and number
- Phone numbers must be Indian format (10 digits starting with 6-9)

## 🚀 Next Steps

Task 2.7: Build registration UI for mobile (React Native)
- Similar functionality to web
- Native mobile components
- AsyncStorage for token storage
- Mobile-specific navigation
