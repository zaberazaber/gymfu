import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

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
    createdAt: string;
    updatedAt?: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
    registrationIdentifier: string | null; // Store phone/email for OTP verification
}

const initialState: AuthState = {
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: !!localStorage.getItem('token'),
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
            return response.data.data;
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
            localStorage.setItem('token', token);
            return { token, user };
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.error?.message || 'Login failed'
            );
        }
    }
);

// Get current user
export const getCurrentUser = createAsyncThunk(
    'auth/getCurrentUser',
    async (_, { rejectWithValue, getState }) => {
        try {
            const state = getState() as { auth: AuthState };
            const token = state.auth.token;

            const response = await axios.get(`${API_BASE_URL}/users/me`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.error?.message || 'Failed to get user'
            );
        }
    }
);

// Get user profile
export const getProfile = createAsyncThunk(
    'auth/getProfile',
    async (_, { rejectWithValue, getState }) => {
        try {
            const state = getState() as { auth: AuthState };
            const token = state.auth.token;

            const response = await axios.get(`${API_BASE_URL}/users/profile`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.error?.message || 'Failed to get profile'
            );
        }
    }
);

// Update user profile
export const updateProfile = createAsyncThunk(
    'auth/updateProfile',
    async (
        profileData: {
            name?: string;
            age?: number;
            gender?: string;
            location?: { city?: string; state?: string; country?: string; pincode?: string };
            fitnessGoals?: string[];
            profileImage?: string;
        },
        { rejectWithValue, getState }
    ) => {
        try {
            const state = getState() as { auth: AuthState };
            const token = state.auth.token;

            const response = await axios.put(`${API_BASE_URL}/users/profile`, profileData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.error?.message || 'Failed to update profile'
            );
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.registrationIdentifier = null;
            localStorage.removeItem('token');
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // Register
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
            });

        // Verify OTP
        builder
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
                localStorage.setItem('token', action.payload.token);
            })
            .addCase(verifyOTP.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Login
        builder
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
            });

        // Login with password
        builder
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
            })
            .addCase(loginWithPassword.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Get current user
        builder
            .addCase(getCurrentUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getCurrentUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                state.isAuthenticated = true;
            })
            .addCase(getCurrentUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                state.isAuthenticated = false;
                state.token = null;
                localStorage.removeItem('token');
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
            });
    },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
