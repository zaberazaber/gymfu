import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import axios from 'axios';
import Constants from 'expo-constants';

interface HealthResponse {
  success: boolean;
  message: string;
  timestamp: string;
}

// Get the correct API URL based on platform
const getApiUrl = () => {
  // For Expo Go on physical device, use the dev machine's IP
  const debuggerHost = Constants.expoConfig?.hostUri;
  
  if (debuggerHost) {
    // Extract IP from debuggerHost (format: "192.168.1.107:8081")
    const host = debuggerHost.split(':')[0];
    return `http://${host}:3000`;
  }
  
  // Fallback for different platforms
  if (Platform.OS === 'android') {
    // Android emulator
    return 'http://10.0.2.2:3000';
  } else if (Platform.OS === 'ios') {
    // iOS simulator
    return 'http://localhost:3000';
  } else {
    // Web or other platforms
    return 'http://localhost:3000';
  }
};

const HomeScreen = () => {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const checkHealth = async () => {
    try {
      const apiUrl = getApiUrl();
      const response = await axios.get<HealthResponse>(
        `${apiUrl}/health`,
        { timeout: 5000 }
      );
      setHealth(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to connect to backend API');
      console.error('Health check failed:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    checkHealth();
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>🏋️ GYMFU</Text>
        <Text style={styles.subtitle}>Your Fitness, Your Way</Text>
      </View>

      <View style={styles.statusCard}>
        <Text style={styles.cardTitle}>Backend API Status</Text>
        {loading && <ActivityIndicator size="large" color="#4F46E5" />}
        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>❌ {error}</Text>
            <Text style={styles.errorHint}>
              Make sure backend is running on http://localhost:3000
            </Text>
          </View>
        )}
        {health && (
          <View style={styles.successBox}>
            <Text style={styles.successText}>✅ {health.message}</Text>
            <Text style={styles.timestamp}>
              {new Date(health.timestamp).toLocaleString()}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.featuresGrid}>
        <View style={styles.featureCard}>
          <Text style={styles.featureIcon}>🔍</Text>
          <Text style={styles.featureTitle}>Discover Gyms</Text>
          <Text style={styles.featureText}>
            Find gyms near you and book sessions instantly
          </Text>
        </View>

        <View style={styles.featureCard}>
          <Text style={styles.featureIcon}>💳</Text>
          <Text style={styles.featureTitle}>Pay Per Session</Text>
          <Text style={styles.featureText}>
            No memberships, no commitments - pay only when you workout
          </Text>
        </View>

        <View style={styles.featureCard}>
          <Text style={styles.featureIcon}>🤖</Text>
          <Text style={styles.featureTitle}>AI Coach</Text>
          <Text style={styles.featureText}>
            Get personalized workout and nutrition plans
          </Text>
        </View>

        <View style={styles.featureCard}>
          <Text style={styles.featureIcon}>🛒</Text>
          <Text style={styles.featureTitle}>Marketplace</Text>
          <Text style={styles.featureText}>
            Shop supplements, gear, and healthy foods
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Coming soon: User registration, gym discovery, and more!
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    backgroundColor: '#4F46E5',
    padding: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#E0E7FF',
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#1F2937',
  },
  errorBox: {
    backgroundColor: '#FEE2E2',
    padding: 16,
    borderRadius: 8,
  },
  errorText: {
    color: '#991B1B',
    fontSize: 14,
    marginBottom: 4,
  },
  errorHint: {
    color: '#991B1B',
    fontSize: 12,
    opacity: 0.8,
  },
  successBox: {
    backgroundColor: '#D1FAE5',
    padding: 16,
    borderRadius: 8,
  },
  successText: {
    color: '#065F46',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  timestamp: {
    color: '#065F46',
    fontSize: 12,
    opacity: 0.8,
  },
  featuresGrid: {
    padding: 16,
  },
  featureCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4F46E5',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default HomeScreen;
