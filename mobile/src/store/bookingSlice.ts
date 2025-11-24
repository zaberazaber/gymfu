import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL } from '../utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Booking {
  id: number;
  userId: number;
  gymId: number;
  sessionDate: string;
  price: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'checked_in' | 'completed';
  qrCode: string | null;
  createdAt: string;
  updatedAt?: string;
}

interface BookingState {
  bookings: Booking[];
  selectedBooking: Booking | null;
  loading: boolean;
  error: string | null;
}

const initialState: BookingState = {
  bookings: [],
  selectedBooking: null,
  loading: false,
  error: null,
};

// Async thunks
export const createBooking = createAsyncThunk(
  'booking/create',
  async (data: { gymId: number; sessionDate: string }, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.post(`${API_BASE_URL}/bookings`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
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
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/bookings/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
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
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/bookings/${bookingId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to get booking');
    }
  }
);

export const cancelBooking = createAsyncThunk(
  'booking/cancel',
  async (bookingId: number, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.put(`${API_BASE_URL}/bookings/${bookingId}/cancel`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to cancel booking');
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
      });
  },
});

export const { clearError, clearSelectedBooking } = bookingSlice.actions;
export default bookingSlice.reducer;
