import axios from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Get API base URL based on platform and environment
const getApiBaseUrl = () => {
  // Production backend URL (Render) - works for both iOS and Android
  const PRODUCTION_URL = 'https://gymfu-backend.onrender.com';

  // Check if we should use production (for testing on real devices with production backend)
  // You can change this to true when you want to test with production backend
  const USE_PRODUCTION = true;

  if (USE_PRODUCTION) {
    console.log('📡 Using PRODUCTION backend:', PRODUCTION_URL);
    return PRODUCTION_URL;
  }

  // Development mode - use local backend
  console.log('📡 Using DEVELOPMENT backend');

  // For Expo Go on physical device, use the dev machine's IP
  const debuggerHost = Constants.expoConfig?.hostUri;

  if (debuggerHost) {
    // Extract IP from debuggerHost (format: "192.168.1.107:8081")
    const host = debuggerHost.split(':')[0];
    const devUrl = `http://${host}:3000`;
    console.log('📱 Physical device detected, using:', devUrl);
    return devUrl;
  }

  // Fallback for different platforms
  if (Platform.OS === 'android') {
    // Android emulator uses 10.0.2.2 to access host machine's localhost
    console.log('🤖 Android emulator detected');
    return 'http://10.0.2.2:3000';
  } else if (Platform.OS === 'ios') {
    // iOS simulator can use localhost directly
    console.log('🍎 iOS simulator detected');
    return 'http://localhost:3000';
  } else {
    // Web and other platforms
    return 'http://localhost:3000';
  }
};

const BASE_URL = getApiBaseUrl();
const API_BASE_URL = `${BASE_URL}/api/v1`;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for auth tokens
api.interceptors.request.use(
  (config) => {
    // Token will be added here later when we implement authentication
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      // Will implement navigation to login screen later
    }
    return Promise.reject(error);
  }
);

export default api;
export { API_BASE_URL };
