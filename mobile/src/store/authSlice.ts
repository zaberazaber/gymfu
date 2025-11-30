import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL } from '../utils/api';

interface Location {
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
}

interface User {
  id: number;
  phoneNumber?: string;
  email?: string;
  name: string;
  age?: number;
  gender?: string;
  location?: Location;
  fitnessGoals?: string[];
  profileImage?: string;
  isPartner?: boolean;
  isAdmin?: boolean;
  role?: string;
  createdAt: string;
  updatedAt?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  registrationIdentifier: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  registrationIdentifier: null,
};

// Register user
export const register = createAsyncThunk(
  'auth/register',
  async (
    data: { phoneNumber?: string; email?: string; name: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, data);
      return {
        identifier: data.phoneNumber || data.email!,
        message: response.data.message,
      };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error?.message || 'Registration failed'
      );
    }
  }
);

// Verify OTP
export const verifyOTP = createAsyncThunk(
  'auth/verifyOTP',
  async (
    data: { phoneNumber?: string; email?: string; otp: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/verify-otp`, data);
      const { token, user } = response.data.data;
      await AsyncStorage.setItem('token', token);
      return { token, user };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error?.message || 'OTP verification failed'
      );
    }
  }
);

// Login user
export const login = createAsyncThunk(
  'auth/login',
  async (
    data: { phoneNumber?: string; email?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, data);
      return {
        identifier: data.phoneNumber || data.email!,
        message: response.data.message,
      };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error?.message || 'Login failed'
      );
    }
  }
);

// Login with password
export const loginWithPassword = createAsyncThunk(
  'auth/loginWithPassword',
  async (
    data: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login-password`, data);
      const { token, user } = response.data.data;
      await AsyncStorage.setItem('token', token);
      return { token, user };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error?.message || 'Login failed'
      );
    }
  }
);

// Get user profile
export const getProfile = createAsyncThunk('auth/getProfile', async (_, { rejectWithValue }) => {
  try {
    const token = await AsyncStorage.getItem('token');
    const response = await axios.get(`${API_BASE_URL}/users/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.error?.message || 'Failed to get profile');
  }
});

// Update user profile
export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (
    profileData: {
      name?: string;
      age?: number;
      gender?: string;
      location?: Location;
      fitnessGoals?: string[];
      profileImage?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.put(`${API_BASE_URL}/users/profile`, profileData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to update profile');
    }
  }
);

// Load token from storage
export const loadToken = createAsyncThunk('auth/loadToken', async () => {
  const token = await AsyncStorage.getItem('token');
  return token;
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.registrationIdentifier = null;
      AsyncStorage.removeItem('token');
      AsyncStorage.removeItem('user');
    },
    clearError: (state) => {
      state.error = null;
    },
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.registrationIdentifier = action.payload.identifier;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(verifyOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.registrationIdentifier = null;
        // Persist to AsyncStorage
        AsyncStorage.setItem('token', action.payload.token);
        AsyncStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.registrationIdentifier = action.payload.identifier;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(loginWithPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginWithPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.registrationIdentifier = null;
        // Persist to AsyncStorage
        AsyncStorage.setItem('token', action.payload.token);
        AsyncStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(loginWithPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(getProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(loadToken.fulfilled, (state, action) => {
        if (action.payload) {
          state.token = action.payload;
          state.isAuthenticated = true;
        }
      });
  },
});

export const { logout, clearError, setCredentials } = authSlice.actions;
export default authSlice.reducer;
