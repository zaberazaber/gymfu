# Fix: Razorpay Authentication Error

## 🐛 Error

```
Razorpay order creation failed: {
  statusCode: 401,
  error: { 
    code: 'BAD_REQUEST_ERROR', 
    description: 'Authentication failed' 
  }
}
```

## 🔍 Root Cause

The Razorpay API keys in `backend/.env` are still set to placeholder values:
```env
RAZORPAY_KEY_ID=rzp_test_your_key_id_here
RAZORPAY_KEY_SECRET=your_key_secret_here
```

## ✅ Solution

### Step 1: Get Your Razorpay Test Keys

1. **Login to Razorpay Dashboard**: https://dashboard.razorpay.com/
2. **Go to Settings** → **API Keys**
3. **Generate Test Keys** (if you haven't already)
4. **Copy both**:
   - Key ID (starts with `rzp_test_`)
   - Key Secret

### Step 2: Update Backend Environment

Edit `backend/.env`:

```env
# Razorpay (Test Mode)
RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXXXXX
RAZORPAY_KEY_SECRET=YYYYYYYYYYYYYYYYYYYYYYYY
```

Replace:
- `rzp_test_XXXXXXXXXXXXXXXX` with your actual Key ID
- `YYYYYYYYYYYYYYYYYYYYYYYYYYYY` with your actual Key Secret

### Step 3: Update Frontend Environment

**Web** (`web/.env.local`):
```env
VITE_RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXXXXX
```

**Mobile** (`mobile/src/utils/api.ts`):
```typescript
export const RAZORPAY_KEY_ID = 'rzp_test_XXXXXXXXXXXXXXXX';
```

### Step 4: Restart Backend

```bash
cd backend
# Stop the server (Ctrl+C)
npm run dev
```

### Step 5: Test Again

Try creating a booking again. The Razorpay order should now be created successfully.

---

## 🔐 Security Notes

### For Development
- Use **Test Mode** keys (start with `rzp_test_`)
- Test keys are safe to use in development
- No real money is charged with test keys

### For Production
- Use **Live Mode** keys (start with `rzp_live_`)
- Never commit live keys to version control
- Use environment variables or secret management
- Enable webhook signature verification

---

## 📝 Quick Reference

### Where to Update Keys

| Location | File | Variable |
|----------|------|----------|
| Backend | `backend/.env` | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` |
| Web | `web/.env.local` | `VITE_RAZORPAY_KEY_ID` |
| Mobile | `mobile/src/utils/api.ts` | `RAZORPAY_KEY_ID` |

### Test Keys Format

- **Key ID**: `rzp_test_` followed by 16 characters
- **Key Secret**: 24-32 characters

---

## 🧪 Verify It's Working

After updating keys, you should see:

1. **Backend logs**:
   ```
   Razorpay order created successfully: order_XXXXXXXXXXXXX
   ```

2. **Booking created** with:
   - `status: 'pending'`
   - `razorpayOrderId: 'order_XXXXXXXXXXXXX'`

3. **Frontend** receives the booking with Razorpay order ID

---

## 🆘 Still Having Issues?

### Check 1: Keys are Correct
- Login to Razorpay dashboard
- Verify you copied the correct keys
- Make sure there are no extra spaces

### Check 2: Test Mode is Enabled
- In Razorpay dashboard, ensure you're in "Test Mode"
- Test keys only work in test mode

### Check 3: Backend Restarted
- Stop and restart the backend server
- Environment variables are loaded on startup

### Check 4: API Keys are Active
- In Razorpay dashboard, check if keys are active
- Regenerate keys if needed

---

## 📞 Get Razorpay Keys

If you don't have a Razorpay account:

1. **Sign up**: https://dashboard.razorpay.com/signup
2. **Complete KYC** (for test mode, basic info is enough)
3. **Generate Test Keys**: Settings → API Keys → Generate Test Key
4. **Copy and use** in your application

---

## ✅ Expected Flow After Fix

```
1. User clicks "Proceed to Payment"
   ↓
2. Backend creates booking (status: pending)
   ↓
3. Backend calls Razorpay API with valid keys ✅
   ↓
4. Razorpay returns order ID
   ↓
5. Frontend opens Razorpay checkout
   ↓
6. User completes payment
   ↓
7. Payment verified
   ↓
8. Booking confirmed with QR code
```

---

**After updating the keys, your payment integration will work perfectly!** 🎉
