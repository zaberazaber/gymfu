# Testing Profile Features - Complete Guide

## ✅ Backend Tests Status
**All 78 tests passing!**

Test suites:
- ✅ Health endpoints (5 tests)
- ✅ Validation utilities (20 tests)
- ✅ Formatting utilities (21 tests)
- ✅ Error handling (3 tests)
- ✅ Authentication middleware (9 tests)
- ✅ Auth integration (5 tests)
- ✅ Login integration (7 tests)
- ✅ Profile integration (11 tests)

## 🌐 Testing Web Application

### Access Web App
Open your browser and go to: **http://localhost:5173**

### Test Flow:

#### 1. Registration
1. Click "Register" button
2. Fill in the form:
   - Name: Your Name
   - Toggle to Phone or Email
   - Phone: 9876543210 (or any valid Indian number)
   - Password: Test1234 (must have uppercase, lowercase, number)
   - Confirm Password: Test1234
3. Click "Register"
4. Check backend console for OTP (6-digit code)
5. Enter OTP on verification page
6. You should be redirected to homepage

#### 2. View Profile
1. After login, click "View Profile" button
2. You should see:
   - Your avatar with initials
   - Personal information section
   - Location section (if set)
   - Fitness goals (if set)
   - "Edit Profile" button

#### 3. Edit Profile
1. Click "Edit Profile" button
2. Update fields:
   - Age: 25
   - Gender: Select from dropdown
   - City: Mumbai
   - State: Maharashtra
   - Country: India
   - Pincode: 400001 (must be 6 digits)
   - Fitness Goals: Select multiple goals
3. Click "Save Changes"
4. You should see success message
5. Navigate back to profile to see updates

#### 4. Logout and Login
1. Click "Logout" button
2. Click "Login" button
3. Enter your phone/email
4. Check console for OTP
5. Enter OTP
6. You should be logged in with your profile intact

## 📱 Testing Mobile Application

### Access Mobile App

**Option 1 - Android Emulator:**
- In the mobile terminal, press `a`
- Wait for app to load on emulator

**Option 2 - Physical Device:**
- Install Expo Go from Play Store/App Store
- Scan the QR code shown in terminal
- App will load on your device

### Test Flow:

#### 1. Registration
1. Tap "Register" button
2. Fill in the form:
   - Name: Your Name
   - Toggle between Phone/Email
   - Phone: 9876543210
   - Password: Test1234
   - Confirm Password: Test1234
3. Tap "Register"
4. Check backend console for OTP
5. Enter 6-digit OTP (one digit per box)
6. Tap "Verify OTP"
7. You should see home screen with welcome message

#### 2. View Profile
1. After login, tap "View Profile" button
2. You should see:
   - Avatar circle with your initials
   - Personal Information card
   - Location card (if set)
   - Fitness Goals badges (if set)
   - "Edit Profile" button at bottom

#### 3. Edit Profile
1. Tap "Edit Profile" button
2. Scroll through the form and update:
   - Full Name: Update if needed
   - Age: 25
   - Gender: Tap to select (Male/Female/Other/Prefer not to say)
   - Location section:
     - City: Mumbai
     - State: Maharashtra
     - Country: India
     - Pincode: 400001
   - Fitness Goals: Tap multiple goals to select
3. Tap "Save Changes"
4. You should see success alert
5. Navigate back to see updated profile

#### 4. Test Validation
Try these to test validation:
- Age less than 13 or more than 120 → Error
- Pincode not 6 digits → Error
- Empty name → Error
- All should show red error messages

#### 5. Logout and Login
1. Go back to home screen
2. Tap "Logout" button
3. Tap "Login" button
4. Enter phone/email
5. Check console for OTP
6. Enter OTP
7. Tap "View Profile" to verify data persisted

## 🔍 What to Look For

### ✅ Expected Behaviors:

**Web:**
- Smooth navigation between pages
- Form validation with error messages
- Loading spinners during API calls
- Success messages after updates
- Responsive design on different screen sizes

**Mobile:**
- Native feel with proper touch interactions
- Smooth scrolling
- Native alerts for errors/success
- Pull-to-refresh on profile screen
- Keyboard handling in forms

### ❌ Common Issues to Check:

1. **Profile not loading:**
   - Check if you're logged in (token in storage)
   - Check backend console for errors
   - Try logout and login again

2. **Updates not saving:**
   - Check form validation errors
   - Check backend console for API errors
   - Verify all required fields are filled

3. **Navigation not working:**
   - For mobile: Restart the app (shake device → Reload)
   - For web: Hard refresh (Ctrl+Shift+R)

## 🎯 Test Checklist

### Backend API
- [x] All 78 tests passing
- [x] Profile endpoints working
- [x] Authentication working
- [x] Validation working

### Web Application
- [ ] Registration flow works
- [ ] Login flow works
- [ ] View profile displays correctly
- [ ] Edit profile saves changes
- [ ] Form validation works
- [ ] Logout works
- [ ] Profile data persists after logout/login

### Mobile Application
- [ ] Registration flow works
- [ ] Login flow works
- [ ] View Profile button appears after login
- [ ] Profile screen displays correctly
- [ ] Edit profile saves changes
- [ ] Form validation works
- [ ] Logout works
- [ ] Profile data persists after logout/login

## 📊 Current Status

### Running Services:
- ✅ Backend: http://localhost:3000
- ✅ Web: http://localhost:5173
- ✅ Mobile: Expo running (scan QR or press 'a')
- ✅ Databases: PostgreSQL, MongoDB, Redis

### Features Complete:
- ✅ User Registration (phone/email)
- ✅ OTP Verification
- ✅ Login
- ✅ JWT Authentication
- ✅ Profile Management (view/edit)
- ✅ Form Validation
- ✅ Error Handling
- ✅ Both Web and Mobile platforms

## 🐛 Troubleshooting

### Backend Issues:
```bash
# Check if backend is running
curl http://localhost:3000/health

# Check database connections
curl http://localhost:3000/health/db

# Restart backend
cd backend
npm run dev
```

### Web Issues:
```bash
# Restart web app
cd web
npm run dev
```

### Mobile Issues:
```bash
# Restart mobile app
cd mobile
npm start

# Then press 'r' to reload
# Or shake device and tap "Reload"
```

### Database Issues:
```bash
# Check if Docker is running
docker ps

# Restart databases
cd backend
docker-compose restart

# Check logs
docker-compose logs
```

## 📝 Notes

- OTP codes appear in the backend console (not sent via SMS/Email yet)
- Profile images are stored as base64 or URLs (not uploaded yet)
- All validation follows the requirements (age 13-120, 6-digit pincode, etc.)
- Fitness goals are predefined: weight_loss, muscle_gain, general_fitness, strength, endurance, flexibility, sports_training

## 🎉 Success Criteria

You've successfully tested the profile features when:
1. ✅ You can register and login on both platforms
2. ✅ You can view your profile with all information
3. ✅ You can edit and save profile changes
4. ✅ Changes persist after logout/login
5. ✅ Form validation works correctly
6. ✅ Navigation works smoothly
7. ✅ No console errors during normal usage

Happy Testing! 🚀
