# Testing GYMFU Registration Flow

## Prerequisites
- Backend running on http://localhost:3000
- Web app running on http://localhost:5173
- Docker containers running (PostgreSQL, MongoDB, Redis)

## Manual Testing Steps

### 1. Test Backend Health
```bash
curl http://localhost:3000/health
```
Expected: `{"success":true,"message":"GYMFU API is running",...}`

### 2. Test Registration API
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "phoneNumber": "9876543210",
    "password": "Test@1234"
  }'
```
Expected: Success response with user data
**Check backend console for OTP!**

### 3. Test OTP Verification API
```bash
# Replace YOUR_OTP with the OTP from backend console
curl -X POST http://localhost:3000/api/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "9876543210",
    "otp": "YOUR_OTP"
  }'
```
Expected: Success response with JWT token

### 4. Test Protected Endpoint
```bash
# Replace YOUR_TOKEN with the token from step 3
curl http://localhost:3000/api/v1/users/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```
Expected: User profile data

## Web UI Testing

### Test Registration Flow
1. Open http://localhost:5173 in your browser
2. Click "Register" button
3. Fill in the form:
   - Name: Test User
   - Phone: 9876543210 (or toggle to email)
   - Password: Test@1234
   - Confirm Password: Test@1234
4. Click "Create Account"
5. Check backend console for OTP
6. Enter the 6-digit OTP on verification page
7. Click "Verify OTP"
8. You should be redirected to homepage
9. Homepage should show "Welcome, Test User!"

### Test Validation
1. Try registering with invalid data:
   - Short name (< 2 chars)
   - Invalid phone (not 10 digits or doesn't start with 6-9)
   - Invalid email format
   - Weak password (< 8 chars, no uppercase, no number)
   - Mismatched passwords
2. Verify error messages appear

### Test OTP Input
1. On OTP page, try:
   - Typing digits (should auto-focus next input)
   - Backspace (should focus previous input)
   - Paste 6-digit code (should fill all inputs)
   - Submit with incomplete OTP (button should be disabled)

### Test Logout
1. After logging in, click "Logout" button
2. Verify you're logged out
3. Homepage should show Register/Login buttons again

## Expected Results

✅ Backend API responds correctly
✅ Registration creates user and sends OTP
✅ OTP verification returns JWT token
✅ Protected endpoint requires valid token
✅ Web UI shows registration form
✅ Form validation works
✅ OTP input has auto-focus and paste support
✅ Successful registration redirects to homepage
✅ Homepage shows user info when logged in
✅ Logout works correctly

## Troubleshooting

### Backend not responding
- Check if backend is running: `npm run dev` in backend folder
- Check if databases are running: `docker-compose ps`
- Check backend logs for errors

### Web app not loading
- Check if web server is running: `npm run dev` in web folder
- Check browser console for errors
- Clear browser cache and reload

### OTP not received
- Check backend console output
- OTP is printed in development mode
- OTP expires in 10 minutes

### Token not working
- Check if token is stored in localStorage
- Open browser DevTools → Application → Local Storage
- Look for 'token' key
- Token format should be: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## Notes

- In development, OTP is printed to backend console
- In production, OTP would be sent via SMS/Email
- JWT token is stored in localStorage
- Token expires in 7 days (configurable)
