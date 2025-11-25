# Quick Refund Reference

## 🚀 Setup (One Time)

```bash
cd backend
npm run db:migrate-refunds
npm run dev
```

---

## 🔄 How Refunds Work

### Automatic (Default)
```
Cancel Booking → Auto Refund → Done ✅
```

### Manual (If Needed)
```bash
POST /api/v1/payments/refund
{
  "bookingId": 123
}
```

---

## 🧪 Quick Test

```bash
# 1. Create & pay for booking
POST /api/v1/bookings
{ "gymId": 1, "sessionDate": "2024-12-20T10:00:00Z" }

# 2. Cancel it
PUT /api/v1/bookings/{id}/cancel

# 3. Check refund in response ✅
```

---

## 📊 Check Refund Status

```sql
SELECT status, razorpay_refund_id, refund_amount
FROM payments
WHERE booking_id = 123;
```

---

## 🎯 Key Features

- ✅ Auto-refund on cancel
- ✅ Manual refund endpoint
- ✅ Full & partial refunds
- ✅ Razorpay integration
- ✅ Complete tracking

---

## 📝 Refund Endpoint

```bash
POST /api/v1/payments/refund
{
  "bookingId": 123,
  "amount": 250  # Optional, defaults to full
}
```

---

## 🐛 Troubleshooting

**Refund not working?**
1. Check Razorpay keys
2. Verify payment is 'success'
3. Check booking is 'cancelled'
4. View backend logs

---

## 📚 Full Docs

- `TASK_5.7_COMPLETED.md` - Complete details
- `REFUND_TESTING_GUIDE.md` - Testing guide
- `TASK_5.7_SUMMARY.md` - Summary

---

**Ready to use!** 🎉
