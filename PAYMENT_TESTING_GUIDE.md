# Payment Integration Testing Guide

## 🧪 Complete Testing Checklist

### Prerequisites

1. **Backend Running**:
   ```bash
   cd backend
   npm run dev
   ```

2. **Razorpay Keys Configured**:
   - Backend: `backend/.env` has `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`
   - Web: `web/.env.local` has `VITE_RAZORPAY_KEY_ID`
   - Mobile: `mobile/src/utils/api.ts` has `RAZORPAY_KEY_ID`

3. **Database Migrations Run**:
   ```bash
   cd backend
   npm run db:create-bookings
   npm run db:migrate-payments
   ```

---

## 🌐 Web Testing

### Test 1: Successful Payment Flow

1. **Start Web App**:
   ```bash
   cd web
   npm run dev
   ```

2. **Navigate to Booking**:
   - Login to the app
   - Browse gyms
   - Select a gym
   - Click "Book Now"

3. **Complete Booking**:
   - Select date and time
   - Click "Proceed to Payment"
   - Verify booking is created with `pending` status

4. **Complete Payment**:
   - Razorpay modal should open
   - Enter test card: `4111 1111 1111 1111`
   - Expiry: Any future date (e.g., 12/25)
   - CVV: Any 3 digits (e.g., 123)
   - Click "Pay"

5. **Verify Success**:
   - Payment should succeed
   - Booking status should update to `confirmed`
   - QR code should be displayed
   - User should see confirmation screen

### Test 2: Failed Payment

1. Follow steps 1-3 from Test 1
2. In Razorpay modal, enter: `4111 1111 1111 1112`
3. Payment should fail
4. Error message should be shown
5. Booking should remain `pending`

### Test 3: Payment Cancellation

1. Follow steps 1-3 from Test 1
2. Close Razorpay modal without completing payment
3. Alert should show: "Payment cancelled. Your booking is still pending."
4. Booking should remain `pending`

---

## 📱 Mobile Testing

### Test 1: Successful Payment Flow

1. **Install Dependencies**:
   ```bash
   cd mobile
   npm install
   ```

2. **Start Mobile App**:
   ```bash
   npm start
   ```

3. **Navigate to Booking**:
   - Login to the app
   - Browse gyms
   - Select a gym
   - Tap "Book Now"

4. **Complete Booking**:
   - Select date and time
   - Tap "Proceed to Payment"
   - Verify booking is created

5. **Complete Payment**:
   - Razorpay checkout should open
   - Enter test card: `4111 1111 1111 1111`
   - Complete payment

6. **Verify Success**:
   - Success alert should appear
   - Should navigate to QR code screen
   - QR code should be displayed

### Test 2: Failed Payment

1. Follow steps 1-4 from Test 1
2. In Razorpay checkout, enter: `4111 1111 1111 1112`
3. Payment should fail
4. Error alert should be shown

### Test 3: Payment Cancellation

1. Follow steps 1-4 from Test 1
2. Close Razorpay checkout
3. Alert should show payment cancelled message
4. Booking should remain pending

---

## 🔍 Backend Verification

### Check Booking Status

```bash
# In backend directory
psql -U postgres -d gymfu

# Query bookings
SELECT id, user_id, gym_id, status, price, razorpay_order_id, created_at 
FROM bookings 
ORDER BY created_at DESC 
LIMIT 5;
```

### Check Payment Records

```sql
SELECT id, booking_id, amount, platform_commission, gym_earnings, status, razorpay_payment_id 
FROM payments 
ORDER BY created_at DESC 
LIMIT 5;
```

### Check Logs

```bash
# Backend logs should show:
# - Booking creation
# - Razorpay order creation
# - Payment verification
# - Signature validation
# - Booking status update
```

---

## 🎯 Test Scenarios Matrix

| Scenario | Web | Mobile | Expected Result |
|----------|-----|--------|-----------------|
| Valid card payment | ✅ | ✅ | Booking confirmed, QR shown |
| Invalid card | ✅ | ✅ | Error shown, booking pending |
| Payment cancelled | ✅ | ✅ | Alert shown, booking pending |
| Network error | ✅ | ✅ | Error handled gracefully |
| Invalid signature | ✅ | ✅ | Verification fails |
| Expired order | ✅ | ✅ | Error shown |

---

## 🐛 Common Issues & Solutions

### Issue 1: Razorpay Modal Not Opening (Web)

**Symptoms**: Button click does nothing

**Solutions**:
1. Check browser console for errors
2. Verify Razorpay script is loaded in `web/index.html`
3. Check `VITE_RAZORPAY_KEY_ID` is set
4. Verify booking has `razorpayOrderId`

### Issue 2: Payment Verification Fails

**Symptoms**: Payment succeeds but booking not confirmed

**Solutions**:
1. Check backend logs for signature verification errors
2. Verify `RAZORPAY_KEY_SECRET` is correct in backend `.env`
3. Check payment verification endpoint is being called
4. Verify signature calculation matches Razorpay format

### Issue 3: Mobile Build Fails

**Symptoms**: Cannot find module 'react-native-razorpay'

**Solutions**:
```bash
cd mobile
rm -rf node_modules
npm install
npm start -- --reset-cache
```

### Issue 4: QR Code Not Showing

**Symptoms**: Payment succeeds but no QR code

**Solutions**:
1. Check booking status is `confirmed`
2. Verify `qrCode` and `qrCodeImage` fields are populated
3. Check QR code generation in backend
4. Verify frontend is receiving QR code data

---

## 📊 Success Metrics

After testing, verify:

- [ ] Web payment flow works end-to-end
- [ ] Mobile payment flow works end-to-end
- [ ] Payment verification working correctly
- [ ] QR codes generated after payment
- [ ] Error handling for failed payments
- [ ] Payment cancellation handled properly
- [ ] Booking status updates correctly
- [ ] Commission calculations correct
- [ ] Database records created properly
- [ ] Logs show complete flow

---

## 🔐 Security Checklist

- [ ] Payment signature verified on backend
- [ ] Razorpay keys not exposed in frontend code
- [ ] JWT authentication required for bookings
- [ ] Order IDs are unique and validated
- [ ] Payment amounts match booking prices
- [ ] Status transitions are validated
- [ ] Error messages don't expose sensitive data

---

## 📝 Test Data

### Test Cards (Razorpay Test Mode)

| Card Number | Type | Result |
|-------------|------|--------|
| 4111 1111 1111 1111 | Visa | Success |
| 4111 1111 1111 1112 | Visa | Failure |
| 5555 5555 5555 4444 | Mastercard | Success |
| 5555 5555 5555 5557 | Mastercard | Failure |

**For all cards**:
- Expiry: Any future date
- CVV: Any 3 digits
- OTP (if prompted): 1234

### Test Users

Create test users with different scenarios:
- New user (first booking)
- Existing user (multiple bookings)
- User with pending bookings
- User with cancelled bookings

### Test Gyms

Use gyms with different:
- Prices (₹100, ₹500, ₹1000)
- Capacities (full, partial, empty)
- Locations (different cities)

---

## 🚀 Production Readiness

Before going to production:

1. **Switch to Live Keys**:
   - Replace `rzp_test_*` with `rzp_live_*`
   - Update in backend `.env`, web `.env`, mobile `api.ts`

2. **Test with Real Cards**:
   - Use small amounts (₹1-10)
   - Test with different card types
   - Verify refunds work

3. **Monitor Logs**:
   - Set up error tracking (Sentry, etc.)
   - Monitor payment success rates
   - Track failed payments

4. **Compliance**:
   - Ensure PCI compliance
   - Add terms and conditions
   - Add privacy policy
   - Display refund policy

---

## 📞 Support Resources

- **Razorpay Docs**: https://razorpay.com/docs/
- **Test Cards**: https://razorpay.com/docs/payments/payments/test-card-details/
- **Webhooks**: https://razorpay.com/docs/webhooks/
- **API Reference**: https://razorpay.com/docs/api/

---

**Happy Testing!** 🎉
