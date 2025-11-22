# Mobile Authentication Persistence

## Overview
The mobile app now maintains authentication state across app restarts and prevents navigation back to login screens after successful login.

## What Was Fixed

### 1. Navigation Structure
**Before:**
- Single stack navigator with all screens
- Back button could navigate from Home → Login
- No separation between auth and main flows

**After:**
- Separate Auth Stack (Login/Register/OTP)
- Separate Main Stack (Home/Profile/Gyms)
- Conditional rendering based on auth status
- Back button cannot go from Main Stack to Auth Stack

### 2. Auth Persistence
**Added:**
- Token and user data saved to AsyncStorage on login
- Auto-restore auth state on app start
- Seamless experience across app restarts

### 3. Navigation Flow

#### Unauthenticated User:
```
App Start
  ↓
Check AsyncStorage
  ↓
No Token Found
  ↓
Show Auth Stack
  ↓
Welcome Screen (HomeScreen with Login/Register buttons)
  ↓
Login/Register
  ↓
OTP Verification
  ↓
Save to AsyncStorage
  ↓
Switch to Main Stack
```

#### Authenticated User:
```
App Start
  ↓
Check AsyncStorage
  ↓
Token Found
  ↓
Restore Auth State
  ↓
Show Main Stack
  ↓
Home Screen (with user info)
```

## Technical Implementation

### App.tsx Structure
```typescript
<Provider store={store}>
  <NavigationContainer>
    <RootNavigator />
      ↓
    {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
  </NavigationContainer>
</Provider>
```

### Auth Stack (Unauthenticated)
```typescript
<AuthStack.Navigator>
  <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
  <AuthStack.Screen name="Register" component={RegisterScreen} />
  <AuthStack.Screen name="Login" component={LoginScreen} />
  <AuthStack.Screen name="OTPVerification" component={OTPVerificationScreen} />
</AuthStack.Navigator>
```

### Main Stack (Authenticated)
```typescript
<MainStack.Navigator>
  <MainStack.Screen name="Home" component={HomeScreen} />
  <MainStack.Screen name="Profile" component={ProfileScreen} />
  <MainStack.Screen name="EditProfile" component={EditProfileScreen} />
  <MainStack.Screen name="GymList" component={GymListScreen} />
  <MainStack.Screen name="GymDetail" component={GymDetailScreen} />
</MainStack.Navigator>
```

## AsyncStorage Keys

### Stored Data:
- `token`: JWT authentication token
- `user`: Serialized user object (JSON string)

### Storage Operations:

**On Login Success:**
```typescript
AsyncStorage.setItem('token', token);
AsyncStorage.setItem('user', JSON.stringify(user));
```

**On App Start:**
```typescript
const token = await AsyncStorage.getItem('token');
const userStr = await AsyncStorage.getItem('user');
if (token && userStr) {
  const user = JSON.parse(userStr);
  dispatch(setCredentials({ user, token }));
}
```

**On Logout:**
```typescript
AsyncStorage.removeItem('token');
AsyncStorage.removeItem('user');
```

## New Redux Actions

### setCredentials
```typescript
setCredentials: (state, action) => {
  state.user = action.payload.user;
  state.token = action.payload.token;
  state.isAuthenticated = true;
}
```

Used to restore auth state from AsyncStorage on app start.

## User Experience

### First Time User:
1. Opens app
2. Sees Welcome screen with Login/Register buttons
3. Registers/Logs in
4. Completes OTP verification
5. Automatically navigates to Main Stack
6. **Cannot go back to login screens**

### Returning User:
1. Opens app
2. Auth state restored automatically
3. Directly shows Main Stack (Home screen)
4. No need to login again

### Logout:
1. User taps Logout button
2. Token and user data cleared from AsyncStorage
3. Redux state cleared
4. Automatically switches to Auth Stack
5. Shows Welcome screen

## Back Button Behavior

### In Auth Stack:
- Welcome → (back) → Exit app
- Login → (back) → Welcome
- Register → (back) → Welcome
- OTP → (back) → Login/Register

### In Main Stack:
- Home → (back) → Exit app (NOT to Welcome!)
- Profile → (back) → Home
- GymList → (back) → Home
- GymDetail → (back) → GymList

### Key Point:
**Once logged in, back button NEVER goes to Auth Stack unless user explicitly logs out.**

## Testing

### Test 1: Fresh Install
1. Install app
2. Should see Welcome screen
3. Login
4. Should see Home with user info
5. Press back
6. Should NOT go to login
7. Should exit app or stay on Home

### Test 2: App Restart
1. Login to app
2. Close app completely
3. Reopen app
4. Should automatically show Home (logged in)
5. Should NOT see Welcome/Login screens

### Test 3: Logout
1. Login to app
2. Go to Profile
3. Tap Logout
4. Should see Welcome screen
5. Should NOT be able to go back to Home

### Test 4: Token Expiry
1. Login to app
2. Wait for token to expire (or manually delete from AsyncStorage)
3. Make an API call
4. Should get 401 error
5. Should automatically logout and show Welcome screen

## Files Modified

### mobile/App.tsx
- Restructured to use conditional navigation
- Added auth state check on app start
- Separated Auth and Main stacks

### mobile/src/store/authSlice.ts
- Added `setCredentials` action
- Added AsyncStorage persistence on login
- Added AsyncStorage cleanup on logout

## Benefits

✅ **Better UX** - Users stay logged in
✅ **Secure** - Token stored securely in AsyncStorage
✅ **Intuitive** - Back button behaves as expected
✅ **Professional** - Standard mobile app behavior
✅ **Persistent** - Auth survives app restarts

## Future Enhancements

- Add token refresh mechanism
- Add biometric authentication
- Add "Remember Me" option
- Add session timeout
- Add multiple device management
