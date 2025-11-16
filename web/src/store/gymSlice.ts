import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

interface Gym {
    id: number;
    name: string;
    ownerId: number;
    address: string;
    latitude: number;
    longitude: number;
    city: string;
    pincode: string;
    amenities: string[];
    basePrice: number;
    capacity: number;
    rating: number | string;
    isVerified: boolean;
    operatingHours?: any;
    distance?: number;
    createdAt: string;
    updatedAt?: string;
}

interface GymState {
    gyms: Gym[];
    selectedGym: Gym | null;
    loading: boolean;
    error: string | null;
    filters: {
        latitude: number;
        longitude: number;
        radius: number;
        amenities: string[];
        minPrice: number | null;
        maxPrice: number | null;
    };
    pagination: {
        limit: number;
        offset: number;
        total: number;
        hasMore: boolean;
    };
}

const initialState: GymState = {
    gyms: [],
    selectedGym: null,
    loading: false,
    error: null,
    filters: {
        latitude: 19.076, // Default: Mumbai
        longitude: 72.8777,
        radius: 20,
        amenities: [],
        minPrice: null,
        maxPrice: null,
    },
    pagination: {
        limit: 10,
        offset: 0,
        total: 0,
        hasMore: false,
    },
};

// Async thunks
export const searchNearbyGyms = createAsyncThunk(
    'gym/searchNearby',
    async (_, { getState, rejectWithValue }) => {
        try {
            const state = getState() as { gym: GymState };
            const { filters, pagination } = state.gym;

            const params: any = {
                lat: filters.latitude,
                lng: filters.longitude,
                radius: filters.radius,
                limit: pagination.limit,
                offset: pagination.offset,
            };

            if (filters.amenities.length > 0) {
                params.amenities = filters.amenities.join(',');
            }
            if (filters.minPrice !== null) {
                params.minPrice = filters.minPrice;
            }
            if (filters.maxPrice !== null) {
                params.maxPrice = filters.maxPrice;
            }

            const response = await axios.get(`${API_BASE_URL}/api/v1/gyms/nearby`, { params });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error?.message || 'Failed to search gyms');
        }
    }
);

export const getGymById = createAsyncThunk(
    'gym/getById',
    async (gymId: number, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/v1/gyms/${gymId}`);
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error?.message || 'Failed to get gym details');
        }
    }
);

export const getAllGyms = createAsyncThunk(
    'gym/getAll',
    async (_, { getState, rejectWithValue }) => {
        try {
            const state = getState() as { gym: GymState };
            const { pagination } = state.gym;

            const response = await axios.get(`${API_BASE_URL}/api/v1/gyms`, {
                params: {
                    limit: pagination.limit,
                    offset: pagination.offset,
                },
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error?.message || 'Failed to get gyms');
        }
    }
);

export const createGym = createAsyncThunk(
    'gym/create',
    async (gymData: {
        name: string;
        address: string;
        latitude: number;
        longitude: number;
        city: string;
        pincode: string;
        amenities: string[];
        basePrice: number;
        capacity: number;
    }, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${API_BASE_URL}/api/v1/gyms/register`,
                gymData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error?.message || 'Failed to create gym');
        }
    }
);

export const updateGym = createAsyncThunk(
    'gym/update',
    async ({ gymId, gymData }: {
        gymId: number;
        gymData: Partial<{
            name: string;
            address: string;
            latitude: number;
            longitude: number;
            city: string;
            pincode: string;
            amenities: string[];
            basePrice: number;
            capacity: number;
        }>;
    }, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                `${API_BASE_URL}/api/v1/gyms/${gymId}`,
                gymData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error?.message || 'Failed to update gym');
        }
    }
);

const gymSlice = createSlice({
    name: 'gym',
    initialState,
    reducers: {
        setLocation: (state, action: PayloadAction<{ latitude: number; longitude: number }>) => {
            state.filters.latitude = action.payload.latitude;
            state.filters.longitude = action.payload.longitude;
            state.pagination.offset = 0; // Reset pagination
        },
        setRadius: (state, action: PayloadAction<number>) => {
            state.filters.radius = action.payload;
            state.pagination.offset = 0;
        },
        setAmenities: (state, action: PayloadAction<string[]>) => {
            state.filters.amenities = action.payload;
            state.pagination.offset = 0;
        },
        setPriceRange: (state, action: PayloadAction<{ min: number | null; max: number | null }>) => {
            state.filters.minPrice = action.payload.min;
            state.filters.maxPrice = action.payload.max;
            state.pagination.offset = 0;
        },
        setPage: (state, action: PayloadAction<number>) => {
            state.pagination.offset = action.payload * state.pagination.limit;
        },
        clearFilters: (state) => {
            state.filters.amenities = [];
            state.filters.minPrice = null;
            state.filters.maxPrice = null;
            state.filters.radius = 20;
            state.pagination.offset = 0;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Search nearby gyms
            .addCase(searchNearbyGyms.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(searchNearbyGyms.fulfilled, (state, action) => {
                state.loading = false;
                state.gyms = action.payload.data;
                state.pagination = action.payload.pagination;
            })
            .addCase(searchNearbyGyms.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Get gym by ID
            .addCase(getGymById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getGymById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedGym = action.payload;
            })
            .addCase(getGymById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Get all gyms
            .addCase(getAllGyms.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getAllGyms.fulfilled, (state, action) => {
                state.loading = false;
                state.gyms = action.payload.data;
                state.pagination = action.payload.pagination;
            })
            .addCase(getAllGyms.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Create gym
            .addCase(createGym.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createGym.fulfilled, (state, action) => {
                state.loading = false;
                state.gyms.unshift(action.payload); // Add to beginning of list
                state.selectedGym = action.payload;
            })
            .addCase(createGym.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Update gym
            .addCase(updateGym.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateGym.fulfilled, (state, action) => {
                state.loading = false;
                // Update in list
                const index = state.gyms.findIndex(g => g.id === action.payload.id);
                if (index !== -1) {
                    state.gyms[index] = action.payload;
                }
                state.selectedGym = action.payload;
            })
            .addCase(updateGym.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const {
    setLocation,
    setRadius,
    setAmenities,
    setPriceRange,
    setPage,
    clearFilters,
    clearError,
} = gymSlice.actions;

export default gymSlice.reducer;
