// Shared TypeScript types across all applications

export interface User {
  id: string;
  phoneNumber?: string;
  email?: string;
  name: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  location?: {
    latitude: number;
    longitude: number;
    city: string;
  };
  fitnessGoals?: string[];
  profileImage?: string;
  referralCode?: string;
  referredBy?: string;
  rewardPoints: number;
  createdAt: string;
  updatedAt: string;
}

export interface HealthResponse {
  success: boolean;
  message: string;
  timestamp: string;
}

export interface DatabaseHealthResponse {
  success: boolean;
  databases: {
    postgres: boolean;
    mongodb: boolean;
    redis: boolean;
  };
  timestamp: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  timestamp: string;
}

// Auth types
export interface LoginRequest {
  phoneNumber?: string;
  email?: string;
}

export interface RegisterRequest {
  phoneNumber?: string;
  email?: string;
  name: string;
  password: string;
  referralCode?: string;
}

export interface OTPVerifyRequest {
  phoneNumber?: string;
  email?: string;
  otp: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
  timestamp: string;
}
