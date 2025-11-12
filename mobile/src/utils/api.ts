import axios from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Get API base URL based on platform
const getApiBaseUrl = () => {
  // For Expo Go on physical device, use the dev machine's IP
  const debuggerHost = Constants.expoConfig?.hostUri;

  if (debuggerHost) {
    // Extract IP from debuggerHost (format: "192.168.1.107:8081")
    const host = debuggerHost.split(':')[0];
    return `http://${host}:3000`;
  }

  // Fallback for different platforms
  if (Platform.OS === 'android') {
    // Android emulator uses 10.0.2.2 to access host machine's localhost
    return 'http://10.0.2.2:3000';
  } else if (Platform.OS === 'ios') {
    // iOS simulator can use localhost directly
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
