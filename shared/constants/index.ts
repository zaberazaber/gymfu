// Shared constants across all applications

export const API_ENDPOINTS = {
  // Auth
  AUTH_REGISTER: '/api/v1/auth/register',
  AUTH_LOGIN: '/api/v1/auth/login',
  AUTH_VERIFY_OTP: '/api/v1/auth/verify-otp',
  AUTH_REFRESH_TOKEN: '/api/v1/auth/refresh',
  
  // User
  USER_PROFILE: '/api/v1/users/profile',
  USER_ME: '/api/v1/users/me',
  USER_REWARDS: '/api/v1/users/rewards',
  
  // Gym
  GYMS_LIST: '/api/v1/gyms',
  GYMS_NEARBY: '/api/v1/gyms/nearby',
  GYMS_REGISTER: '/api/v1/gyms/register',
  GYMS_DETAILS: (id: string) => `/api/v1/gyms/${id}`,
  
  // Booking
  BOOKINGS_CREATE: '/api/v1/bookings',
  BOOKINGS_USER: '/api/v1/bookings/user',
  BOOKINGS_DETAILS: (id: string) => `/api/v1/bookings/${id}`,
  BOOKINGS_QR_CODE: (id: string) => `/api/v1/bookings/${id}/qrcode`,
  BOOKINGS_CHECKIN: (id: string) => `/api/v1/bookings/${id}/checkin`,
  
  // Payment
  PAYMENTS_INITIATE: '/api/v1/payments/initiate',
  PAYMENTS_VERIFY: '/api/v1/payments/verify',
  PAYMENTS_REFUND: '/api/v1/payments/refund',
  
  // Health
  HEALTH: '/health',
  HEALTH_DB: '/health/db',
};

export const ERROR_CODES = {
  // Auth errors
  AUTH_TOKEN_MISSING: 'AUTH_TOKEN_MISSING',
  AUTH_TOKEN_INVALID: 'AUTH_TOKEN_INVALID',
  AUTH_OTP_INVALID: 'AUTH_OTP_INVALID',
  AUTH_USER_NOT_FOUND: 'AUTH_USER_NOT_FOUND',
  
  // Validation errors
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  INVALID_PHONE_NUMBER: 'INVALID_PHONE_NUMBER',
  INVALID_EMAIL: 'INVALID_EMAIL',
  
  // Business logic errors
  BOOKING_CONFLICT: 'BOOKING_CONFLICT',
  GYM_UNAVAILABLE: 'GYM_UNAVAILABLE',
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  
  // Payment errors
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  PAYMENT_GATEWAY_ERROR: 'PAYMENT_GATEWAY_ERROR',
  
  // Server errors
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
};

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  THEME: 'theme',
  LANGUAGE: 'language',
};

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};

export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
  OTP_LENGTH: 6,
  OTP_EXPIRY_MINUTES: 10,
};

export const COLORS = {
  PRIMARY: '#4F46E5',
  SECONDARY: '#764ba2',
  SUCCESS: '#10B981',
  ERROR: '#EF4444',
  WARNING: '#F59E0B',
  INFO: '#3B82F6',
  BACKGROUND: '#F3F4F6',
  TEXT: '#1F2937',
  TEXT_SECONDARY: '#6B7280',
};
