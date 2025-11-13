import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import gymReducer from './gymSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    gym: gymReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
