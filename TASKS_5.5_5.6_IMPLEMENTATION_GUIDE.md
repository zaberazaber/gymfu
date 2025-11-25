# Tasks 5.5 & 5.6: Payment UI Implementation Guide

## Overview
This guide covers implementing Razorpay payment UI for both web and mobile applications.

## Task 5.5: Web Payment UI

### Step 1: Add Razorpay Script to HTML
**File**: `web/index.html`

Add Razorpay checkout script in the `<head>` section:
```html
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```

### Step 2: Create Razorpay Types
**File**: `web/src/types/razorpay.d.ts` (NEW)

```typescript
interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open(): void;
  on(event: string, callback: () => void): void;
}

interface Window {
  Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
}
```

### Step 3: Update Booking Slice
**File**: `web/src/store/bookingSlice.ts`

Add payment verification action:
```typescript
export const verifyPayment = createAsyncThunk(
  'booking/verifyPayment',
  async (paymentData: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
    paymentId: number;
  }) => {
    const response = await api.post('/payments/verify', paymentData);
    return response.data;
  }
);
```

### Step 4: Update BookingPage Component
**File**: `web/src/pages/BookingPage.tsx`

```typescript
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { getGymById } from '../store/gymSlice';
import { createBooking, verifyPayment, clearError } from '../store/bookingSlice';

export default function BookingPage() {
  // ... existing state ...
  const [paymentInProgress, setPaymentInProgress] = useState(false);

  const handleBooking = async () => {
    if (!sessionDate || !sessionTime) {
      alert('Please select date and time');
      return;
    }

    const dateTime = new Date(`${sessionDate}T${sessionTime}:00`);

    const result = await dispatch(createBooking({
      gymId: parseInt(gymId!),
      sessionDate: dateTime.toISOString(),
    }));

    if (createBooking.fulfilled.match(result)) {
      const bookingData = result.payload.data;
      
      // Check if payment is required
      if (bookingData.paymentRequired && bookingData.payment) {
        // Initiate Razorpay payment
        initiatePayment(bookingData);
      } else {
        // Payment not required (development mode)
        setShowConfirmation(true);
      }
    }
  };

  const initiatePayment = (bookingData: any) => {
    const options = {
      key: bookingData.payment.keyId,
      amount: bookingData.payment.amount,
      currency: bookingData.payment.currency,
      name: 'GYMFU',
      description: `Booking for ${selectedGym?.name}`,
      order_id: bookingData.payment.orderId,
      handler: async (response: any) => {
        setPaymentInProgress(true);
        try {
          // Verify payment
          const verifyResult = await dispatch(verifyPayment({
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
            paymentId: bookingData.payment.id,
          }));

          if (verifyPayment.fulfilled.match(verifyResult)) {
            setShowConfirmation(true);
          } else {
            alert('Payment verification failed. Please contact support.');
          }
        } catch (error) {
          console.error('Payment verification error:', error);
          alert('Payment verification failed');
        } finally {
          setPaymentInProgress(false);
        }
      },
      prefill: {
        name: user?.name,
        email: user?.email,
      },
      theme: {
        color: '#FF1744',
      },
      modal: {
        ondismiss: () => {
          alert('Payment cancelled. Your booking is pending payment.');
          navigate('/bookings');
        },
      },
    };

    const razorpay = new (window as any).Razorpay(options);
    razorpay.open();
  };

  // ... rest of component ...
}
```

## Task 5.6: Mobile Payment UI

### Step 1: Install Razorpay React Native SDK
```bash
cd mobile
npm install react-native-razorpay
cd ios && pod install && cd ..
```

### Step 2: Update Booking Slice (Mobile)
**File**: `mobile/src/store/bookingSlice.ts`

Add the same `verifyPayment` action as web.

### Step 3: Update BookingScreen Component
**File**: `mobile/src/screens/BookingScreen.tsx`

```typescript
import RazorpayCheckout from 'react-native-razorpay';

const BookingScreen = ({ route, navigation }: any) => {
  // ... existing code ...

  const handleBooking = async () => {
    if (!sessionDate || !sessionTime) {
      Alert.alert('Error', 'Please select date and time');
      return;
    }

    const dateTime = new Date(`${sessionDate}T${sessionTime}:00`);

    const result = await dispatch(createBooking({
      gymId: gym.id,
      sessionDate: dateTime.toISOString(),
    }));

    if (createBooking.fulfilled.match(result)) {
      const bookingData = result.payload.data;
      
      if (bookingData.paymentRequired && bookingData.payment) {
        initiatePayment(bookingData);
      } else {
        navigation.navigate('QRCode', { bookingId: bookingData.booking.id });
      }
    }
  };

  const initiatePayment = (bookingData: any) => {
    const options = {
      description: `Booking for ${gym.name}`,
      image: 'https://your-logo-url.com/logo.png',
      currency: bookingData.payment.currency,
      key: bookingData.payment.keyId,
      amount: bookingData.payment.amount,
      name: 'GYMFU',
      order_id: bookingData.payment.orderId,
      prefill: {
        name: user?.name,
        email: user?.email,
      },
      theme: { color: '#FF1744' },
    };

    RazorpayCheckout.open(options)
      .then(async (data: any) => {
        // Payment success
        try {
          const verifyResult = await dispatch(verifyPayment({
            razorpayOrderId: data.razorpay_order_id,
            razorpayPaymentId: data.razorpay_payment_id,
            razorpaySignature: data.razorpay_signature,
            paymentId: bookingData.payment.id,
          }));

          if (verifyPayment.fulfilled.match(verifyResult)) {
            Alert.alert('Success', 'Payment successful!', [
              {
                text: 'View QR Code',
                onPress: () => navigation.navigate('QRCode', { 
                  bookingId: bookingData.booking.id 
                }),
              },
            ]);
          }
        } catch (error) {
          Alert.alert('Error', 'Payment verification failed');
        }
      })
      .catch((error: any) => {
        // Payment cancelled or failed
        Alert.alert(
          'Payment Cancelled',
          'Your booking is pending payment. You can complete it from booking history.',
          [
            { text: 'OK', onPress: () => navigation.navigate('BookingHistory') },
          ]
        );
      });
  };

  // ... rest of component ...
};
```

## Common Updates for Both Platforms

### Update Booking Slice Actions
**Files**: `web/src/store/bookingSlice.ts` & `mobile/src/store/bookingSlice.ts`

```typescript
// Add to existing slice
export const verifyPayment = createAsyncThunk(
  'booking/verifyPayment',
  async (paymentData: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
    paymentId: number;
  }) => {
    const response = await api.post('/payments/verify', paymentData);
    return response.data;
  }
);

// Add to extraReducers
.addCase(verifyPayment.pending, (state) => {
  state.loading = true;
  state.error = null;
})
.addCase(verifyPayment.fulfilled, (state, action) => {
  state.loading = false;
  // Update the booking with confirmed status
  if (state.selectedBooking) {
    state.selectedBooking = action.payload.data.booking;
  }
})
.addCase(verifyPayment.rejected, (state, action) => {
  state.loading = false;
  state.error = action.error.message || 'Payment verification failed';
});
```

## Testing

### Web Testing:
1. Navigate to a gym detail page
2. Click "Book Now"
3. Select date and time
4. Click "Confirm Booking"
5. Razorpay modal should open
6. Use test card: 4111 1111 1111 1111
7. Any CVV and future expiry
8. Payment should complete and show QR code

### Mobile Testing:
1. Navigate to a gym
2. Tap "Book Now"
3. Select date and time
4. Tap "Confirm Booking"
5. Razorpay screen should open
6. Complete payment with test card
7. Should navigate to QR code screen

### Test Cards (Razorpay Test Mode):
- Success: 4111 1111 1111 1111
- Failure: 4111 1111 1111 1112
- CVV: Any 3 digits
- Expiry: Any future date

## Environment Variables

Ensure these are set:
- `RAZORPAY_KEY_ID` in backend `.env`
- `RAZORPAY_KEY_SECRET` in backend `.env`

## Error Handling

Both platforms should handle:
1. Payment cancellation → Navigate to booking history
2. Payment failure → Show error, keep booking pending
3. Verification failure → Show error, contact support
4. Network errors → Retry mechanism

## UI States

### Loading States:
- Creating booking
- Processing payment
- Verifying payment

### Success States:
- Payment successful
- Show QR code
- Navigate to booking history

### Error States:
- Booking creation failed
- Payment failed
- Verification failed

## Next Steps

After implementing 5.5 and 5.6:
- Test end-to-end payment flow
- Handle edge cases (network failures, etc.)
- Add payment retry mechanism
- Implement Task 5.7 (refunds)
- Implement Task 5.8 (partner earnings dashboard)

## Notes

- Razorpay test mode doesn't charge real money
- Always verify payments on backend (never trust frontend)
- QR codes generated only after payment confirmation
- Bookings remain pending until payment verified
- Users can complete pending payments from booking history
