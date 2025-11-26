# Mobile Payment Setup Guide

## 📱 Installing react-native-razorpay

### Step 1: Install the Package

```bash
cd mobile
npm install react-native-razorpay
```

### Step 2: iOS Setup (if using bare React Native)

If you're using Expo (which we are), **skip this step**. The package will work automatically.

If you're using bare React Native:

```bash
cd ios
pod install
cd ..
```

### Step 3: Android Setup (if using bare React Native)

If you're using Expo, **skip this step**.

If you're using bare React Native, the package should auto-link. If not, follow the manual linking instructions from the [react-native-razorpay documentation](https://github.com/razorpay/react-native-razorpay).

### Step 4: Configure Razorpay Key

Update the Razorpay key in `mobile/src/utils/api.ts`:

```typescript
export const RAZORPAY_KEY_ID = 'rzp_test_your_actual_key_id';
```

Or for production:

```typescript
export const RAZORPAY_KEY_ID = 'rzp_live_your_actual_key_id';
```

### Step 5: Test the Integration

1. Start the mobile app:
   ```bash
   npm start
   ```

2. Select a gym and proceed to booking

3. Click "Proceed to Payment"

4. Use test card: `4111 1111 1111 1111`

5. Complete payment and verify QR code is shown

## 🧪 Testing with Razorpay Test Mode

### Test Cards

| Card Number | Result |
|-------------|--------|
| 4111 1111 1111 1111 | Success |
| 4111 1111 1111 1112 | Failure |
| 5555 5555 5555 4444 | Success |

- **Expiry**: Any future date
- **CVV**: Any 3 digits
- **OTP**: 1234 (for test mode)

## 🔧 Troubleshooting

### Issue: "Cannot find module 'react-native-razorpay'"

**Solution**: 
```bash
cd mobile
npm install
# Restart Metro bundler
npm start -- --reset-cache
```

### Issue: Payment modal not opening

**Solution**: 
1. Check that `RAZORPAY_KEY_ID` is set correctly
2. Verify booking has `razorpayOrderId`
3. Check console for errors

### Issue: Payment verification fails

**Solution**:
1. Check backend logs
2. Verify `RAZORPAY_KEY_SECRET` is set in backend `.env`
3. Ensure signature validation is working

### Issue: iOS build fails

**Solution**:
```bash
cd ios
pod deintegrate
pod install
cd ..
```

## 📝 Environment Configuration

### Development (Local Backend)

```typescript
// mobile/src/utils/api.ts
const USE_PRODUCTION = false;
export const RAZORPAY_KEY_ID = 'rzp_test_your_key_id';
```

### Production (Render Backend)

```typescript
// mobile/src/utils/api.ts
const USE_PRODUCTION = true;
export const RAZORPAY_KEY_ID = 'rzp_live_your_key_id';
```

## 🚀 Deployment Checklist

- [ ] Install react-native-razorpay
- [ ] Update Razorpay key in api.ts
- [ ] Test payment flow with test cards
- [ ] Verify QR code generation
- [ ] Test payment cancellation
- [ ] Test payment failure
- [ ] Switch to production keys for release
- [ ] Test on both iOS and Android
- [ ] Verify backend payment verification

## 📞 Support

If you encounter issues:
1. Check [react-native-razorpay GitHub](https://github.com/razorpay/react-native-razorpay)
2. Check [Razorpay Documentation](https://razorpay.com/docs/)
3. Review backend logs for payment verification errors
4. Test with Razorpay test cards first

---

**Status**: Ready for testing
**Package**: react-native-razorpay v2.3.0
**Platform**: Expo (React Native)
