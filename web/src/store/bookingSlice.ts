import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/api';

interface Gym {
  id: number;
  name: string;
  address: string;
  city: string;
  pincode: string;
  latitude: string;
  longitude: string;
  amenities: string[];
  images: string[];
  basePrice: number;
  capacity: number;
  currentOccupancy: number;
  rating: number;
  isVerified: boolean;
}

interface Booking {
  id: number;
  userId: number;
  gymId: number;
  sessionDate: string;
  price: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'checked_in' | 'completed';
  qrCode: string | null;
  qrCodeExpiry: string | null;
  checkInTime: string | null;
  sessionType: 'gym' | 'class';
  classId?: number | null;
  qrCodeImage?: string;
  gym?: Gym;
  // Fields from joined query
  gymName?: string;
  gymAddress?: string;
  gymCity?: string;
  gymPincode?: string;
  gymLatitude?: string;
  gymLongitude?: string;
  gymAmenities?: string[];
  gymImages?: string[];
  gymRating?: number;
  gymIsVerified?: boolean;
  className?: string;
  classType?: string;
  instructorName?: string;
  createdAt: string;
  updatedAt?: string;
}

interface QRCodeData {
  bookingId: number;
  qrCodeString: string;
  qrCodeImage: string;
}

interface BookingState {
  bookings: Booking[];
  selectedBooking: Booking | null;
  qrCodeData: QRCodeData | null;
  loading: boolean;
  error: string | null;
}

const initialState: BookingState = {
  bookings: [],
  selectedBooking: null,
  qrCodeData: null,
  loading: false,
  error: null,
};

// Async thunks
export const createBooking = createAsyncThunk(
  'booking/create',
  async (data: { gymId: number; sessionDate: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('/bookings', data);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to create booking');
    }
  }
);

export const getUserBookings = createAsyncThunk(
  'booking/getUserBookings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/bookings/user');
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to get bookings');
    }
  }
);

export const getBookingById = createAsyncThunk(
  'booking/getById',
  async (bookingId: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/bookings/${bookingId}`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to get booking');
    }
  }
);

export const getBookingQRCode = createAsyncThunk(
  'booking/getQRCode',
  async (bookingId: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/bookings/${bookingId}/qrcode`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to get QR code');
    }
  }
);

export const checkInBooking = createAsyncThunk(
  'booking/checkIn',
  async (bookingId: number, { rejectWithValue }) => {
    try {
      const response = await api.post(`/bookings/${bookingId}/checkin`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to check-in');
    }
  }
);

export const cancelBooking = createAsyncThunk(
  'booking/cancel',
  async (bookingId: number, { rejectWithValue }) => {
    try {
      const response = await api.put(`/bookings/${bookingId}/cancel`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to cancel booking');
    }
  }
);

export const verifyPayment = createAsyncThunk(
  'booking/verifyPayment',
  async (data: {
    bookingId: number;
    razorpayPaymentId: string;
    razorpayOrderId: string;
    razorpaySignature: string;
  }, { rejectWithValue }) => {
    try {
      const response = await api.post('/payments/verify', data);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Payment verification failed');
    }
  }
);

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedBooking: (state) => {
      state.selectedBooking = null;
    },
    clearQRCode: (state) => {
      state.qrCodeData = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create booking
      .addCase(createBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedBooking = action.payload;
        state.bookings.unshift(action.payload);
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Get user bookings
      .addCase(getUserBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload;
      })
      .addCase(getUserBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Get booking by ID
      .addCase(getBookingById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBookingById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedBooking = action.payload;
      })
      .addCase(getBookingById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Cancel booking
      .addCase(cancelBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelBooking.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.bookings.findIndex(b => b.id === action.payload.id);
        if (index !== -1) {
          state.bookings[index] = action.payload;
        }
        if (state.selectedBooking?.id === action.payload.id) {
          state.selectedBooking = action.payload;
        }
      })
      .addCase(cancelBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Get QR code
      .addCase(getBookingQRCode.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBookingQRCode.fulfilled, (state, action) => {
        state.loading = false;
        state.qrCodeData = action.payload;
      })
      .addCase(getBookingQRCode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Check-in booking
      .addCase(checkInBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkInBooking.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.bookings.findIndex(b => b.id === action.payload.id);
        if (index !== -1) {
          state.bookings[index] = action.payload;
        }
        if (state.selectedBooking?.id === action.payload.id) {
          state.selectedBooking = action.payload;
        }
      })
      .addCase(checkInBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Verify payment
      .addCase(verifyPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedBooking = action.payload.booking;
        state.qrCodeData = {
          bookingId: action.payload.booking.id,
          qrCodeString: action.payload.booking.qrCode,
          qrCodeImage: action.payload.booking.qrCodeImage,
        };
        const index = state.bookings.findIndex(b => b.id === action.payload.booking.id);
        if (index !== -1) {
          state.bookings[index] = action.payload.booking;
        }
      })
      .addCase(verifyPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearSelectedBooking, clearQRCode } = bookingSlice.actions;
export default bookingSlice.reducer;
