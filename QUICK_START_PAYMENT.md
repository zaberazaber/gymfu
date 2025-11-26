# Quick Start: Payment Integration

## 🚀 Get Started in 3 Steps

### Step 1: Install Mobile Dependencies
```bash
cd mobile
npm install
```

### Step 2: Configure Razorpay Keys

**Backend** (`backend/.env`):
```env
RAZORPAY_KEY_ID=rzp_test_your_actual_key
RAZORPAY_KEY_SECRET=your_actual_secret
```

**Web** (`web/.env.local`):
```env
VITE_RAZORPAY_KEY_ID=rzp_test_your_actual_key
```

**Mobile** (`mobile/src/utils/api.ts`):
```typescript
export const RAZORPAY_KEY_ID = 'rzp_test_your_actual_key';
```

### Step 3: Test Payment Flow

**Web**:
```bash
cd web
npm run dev
# Navigate to booking page
# Use test card: 4111 1111 1111 1111
```

**Mobile**:
```bash
cd mobile
npm start
# Navigate to booking screen
# Use test card: 4111 1111 1111 1111
```

---

## 🧪 Test Cards

| Card | Result |
|------|--------|
| 4111 1111 1111 1111 | ✅ Success |
| 4111 1111 1111 1112 | ❌ Failure |

**Expiry**: Any future date  
**CVV**: Any 3 digits

---

## ✅ What's Working

- ✅ Web payment integration
- ✅ Mobile payment integration
- ✅ Payment verification
- ✅ QR code generation
- ✅ Error handling
- ✅ Payment cancellation

---

## 📚 Full Documentation

- **Implementation Details**: `TASK_5.5_5.6_COMPLETED.md`
- **Mobile Setup**: `MOBILE_PAYMENT_SETUP.md`
- **Testing Guide**: `PAYMENT_TESTING_GUIDE.md`
- **Summary**: `TASKS_5.5_5.6_SUMMARY.md`

---

## 🆘 Quick Troubleshooting

**Razorpay modal not opening?**
→ Check browser console, verify Razorpay script loaded

**Payment verification fails?**
→ Check backend logs, verify RAZORPAY_KEY_SECRET

**Mobile build fails?**
→ Run `npm install` and restart Metro bundler

---

**Ready to test!** 🎉
