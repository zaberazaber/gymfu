# Refund System Testing Guide

## 🧪 Complete Testing Checklist

### Prerequisites

1. **Backend Running**:
   ```bash
   cd backend
   npm run dev
   ```

2. **Database Migration Run**:
   ```bash
   npm run db:migrate-refunds
   ```

3. **Razorpay Keys Configured** (same as payment setup)

---

## 📋 Test Scenarios

### Scenario 1: Automatic Refund on Cancellation ✅

**Steps**:

1. **Create and Pay for Booking**:
   ```bash
   # Login first
   POST /api/v1/auth/login-password
   {
     "email": "user@example.com",
     "password": "password123"
   }
   
   # Create booking
   POST /api/v1/bookings
   {
     "gymId": 1,
     "sessionDate": "2024-12-15T10:00:00Z"
   }
   
   # Complete payment with test card: 4111 1111 1111 1111
   # Booking status should be 'confirmed'
   ```

2. **Cancel the Booking**:
   ```bash
   PUT /api/v1/bookings/{bookingId}/cancel
   ```

3. **Verify Response**:
   ```json
   {
     "success": true,
     "data": {
       "booking": {
         "id": 123,
         "status": "cancelled"
       },
       "refund": {
         "refundId": "rfnd_XXXXX",
         "amount": 500,
         "status": "processed"
       }
     },
     "message": "Booking cancelled and refund initiated successfully"
   }
   ```

4. **Check Database**:
   ```sql
   SELECT * FROM payments WHERE booking_id = 123;
   -- status should be 'refunded'
   -- razorpay_refund_id should be populated
   -- refund_amount should equal amount
   ```

**Expected Result**: ✅ Refund automatically processed

---

### Scenario 2: Manual Refund Request ✅

**Steps**:

1. **Cancel a Booking** (without automatic refund, or if it failed)

2. **Request Refund Manually**:
   ```bash
   POST /api/v1/payments/refund
   {
     "bookingId": 123
   }
   ```

3. **Verify Response**:
   ```json
   {
     "success": true,
     "data": {
       "payment": {
         "id": 1,
         "status": "refunded",
         "razorpayRefundId": "rfnd_XXXXX",
         "refundAmount": 500
       },
       "refund": {
         "id": "rfnd_XXXXX",
         "amount": 500,
         "status": "processed"
       }
     },
     "message": "Refund processed successfully"
   }
   ```

**Expected Result**: ✅ Manual refund processed

---

### Scenario 3: Partial Refund ✅

**Steps**:

1. **Request Partial Refund**:
   ```bash
   POST /api/v1/payments/refund
   {
     "bookingId": 123,
     "amount": 250  // Half of 500
   }
   ```

2. **Verify Response**:
   ```json
   {
     "success": true,
     "data": {
       "payment": {
         "refundAmount": 250  // Partial amount
       },
       "refund": {
         "amount": 250
       }
     }
   }
   ```

**Expected Result**: ✅ Partial refund processed

---

### Scenario 4: Error Cases ❌

#### Test 4.1: Refund Non-Cancelled Booking

```bash
POST /api/v1/payments/refund
{
  "bookingId": 123  // Booking status: confirmed
}
```

**Expected**: `400 - Only cancelled bookings can be refunded`

#### Test 4.2: Refund Already Refunded Payment

```bash
POST /api/v1/payments/refund
{
  "bookingId": 123  // Already refunded
}
```

**Expected**: `400 - Payment has already been refunded`

#### Test 4.3: Refund Pending Payment

```bash
POST /api/v1/payments/refund
{
  "bookingId": 123  // Payment status: pending
}
```

**Expected**: `400 - Cannot refund a payment that was not successful`

#### Test 4.4: Refund Excessive Amount

```bash
POST /api/v1/payments/refund
{
  "bookingId": 123,
  "amount": 1000  // Payment was only 500
}
```

**Expected**: `400 - Refund amount cannot exceed payment amount`

#### Test 4.5: Refund Someone Else's Booking

```bash
# Login as User A
# Try to refund User B's booking

POST /api/v1/payments/refund
{
  "bookingId": 456  // Belongs to User B
}
```

**Expected**: `403 - You do not have permission to refund this booking`

---

## 🔍 Verification Checklist

After each test, verify:

- [ ] Payment status updated correctly
- [ ] Refund ID stored in database
- [ ] Refund amount recorded
- [ ] Booking status is 'cancelled'
- [ ] Response includes refund details
- [ ] No errors in backend logs

---

## 📊 Database Verification

### Check Payment Status

```sql
SELECT 
  id,
  booking_id,
  amount,
  status,
  razorpay_payment_id,
  razorpay_refund_id,
  refund_amount,
  created_at,
  updated_at
FROM payments
WHERE booking_id = 123;
```

**Expected for Refunded Payment**:
- `status`: 'refunded'
- `razorpay_refund_id`: 'rfnd_XXXXX'
- `refund_amount`: Amount refunded
- `updated_at`: Recent timestamp

### Check Booking Status

```sql
SELECT id, status, created_at, updated_at
FROM bookings
WHERE id = 123;
```

**Expected**:
- `status`: 'cancelled'
- `updated_at`: Recent timestamp

---

## 🎯 Razorpay Dashboard Verification

1. **Login to Razorpay Dashboard**: https://dashboard.razorpay.com/

2. **Go to Transactions** → **Refunds**

3. **Find your refund**:
   - Refund ID matches `razorpay_refund_id`
   - Amount matches `refund_amount`
   - Status is 'Processed'

4. **Check Payment Details**:
   - Original payment shows refund
   - Refund linked to payment

---

## 🐛 Common Issues & Solutions

### Issue 1: Automatic Refund Not Triggered

**Check**:
```bash
# View backend logs
# Look for: "Error processing automatic refund"
```

**Solutions**:
- Verify Razorpay keys are correct
- Check payment has `razorpayPaymentId`
- Use manual refund endpoint
- Check payment status is 'success'

### Issue 2: "Payment Not Found"

**Solutions**:
- Verify booking has associated payment
- Check payment was created during booking
- Query database: `SELECT * FROM payments WHERE booking_id = X`

### Issue 3: Refund API Returns 500

**Check Backend Logs**:
```bash
# Common errors:
# - Razorpay authentication failed
# - Payment ID invalid
# - Network timeout
```

**Solutions**:
- Verify Razorpay credentials
- Check payment ID exists in Razorpay
- Retry the request

---

## 📝 Test Data Setup

### Create Test Booking with Payment

```bash
# 1. Register/Login
POST /api/v1/auth/login-password
{
  "email": "test@example.com",
  "password": "test123"
}

# 2. Create Booking
POST /api/v1/bookings
{
  "gymId": 1,
  "sessionDate": "2024-12-20T14:00:00Z"
}

# 3. Complete Payment
# Use Razorpay test card: 4111 1111 1111 1111
# Expiry: 12/25, CVV: 123

# 4. Verify Booking Confirmed
GET /api/v1/bookings/{bookingId}
# status should be 'confirmed'

# 5. Now ready to test refunds!
```

---

## ✅ Success Metrics

After testing, verify:

- [x] Automatic refund works on cancellation
- [x] Manual refund endpoint works
- [x] Partial refunds work correctly
- [x] Full refunds work correctly
- [x] Error cases handled properly
- [x] Database updates correctly
- [x] Razorpay refunds appear in dashboard
- [x] No errors in backend logs
- [x] Response format is correct
- [x] Security validations work

---

## 🚀 Production Checklist

Before deploying to production:

- [ ] Test with live Razorpay keys
- [ ] Test with real (small amount) payments
- [ ] Verify refund timing (5-7 business days)
- [ ] Set up refund notifications
- [ ] Configure refund policy
- [ ] Add refund tracking for users
- [ ] Set up monitoring/alerts
- [ ] Document refund SLA
- [ ] Train support team
- [ ] Add refund analytics

---

## 📞 Support Resources

- **Razorpay Refunds Docs**: https://razorpay.com/docs/payments/refunds/
- **Razorpay Dashboard**: https://dashboard.razorpay.com/
- **Test Cards**: https://razorpay.com/docs/payments/payments/test-card-details/

---

**Happy Testing!** 🎉
