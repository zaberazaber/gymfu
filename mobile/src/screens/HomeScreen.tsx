import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout } from '../store/authSlice';
import { colors, shadows } from '../styles/neumorphic';

export default function HomeScreen() {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <Image 
          source={require('../../assets/logo.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.subtitle}>Your Ultimate Fitness Companion</Text>
      </View>

      {isAuthenticated && user ? (
        /* Authenticated View */
        <View style={styles.card}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials(user.name)}</Text>
            </View>
          </View>

          <Text style={styles.welcomeTitle}>Welcome, {user.name}! 👋</Text>
          <Text style={styles.welcomeInfo}>
            {user.phoneNumber || user.email}
          </Text>

          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={styles.buttonPrimary}
              onPress={() => navigation.navigate('GymList' as never)}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonTextPrimary}>Find Gyms</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate('Profile' as never)}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>View Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate('BookingHistory' as never)}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>My Bookings</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.buttonPrimary}
              onPress={() => (navigation as any).navigate('Classes')}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonTextPrimary}>🧘 Fitness Classes</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.buttonPrimary}
              onPress={() => (navigation as any).navigate('Marketplace')}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonTextPrimary}>🛒 Marketplace</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.buttonPrimary}
              onPress={() => (navigation as any).navigate('AIChat')}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonTextPrimary}>🤖 AI Fitness Coach</Text>
            </TouchableOpacity>

            {user.isPartner && (
              <TouchableOpacity
                style={styles.buttonPartner}
                onPress={() => navigation.navigate('PartnerDashboard' as never)}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonTextPrimary}>Partner Dashboard</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.buttonDanger}
              onPress={() => dispatch(logout())}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonTextPrimary}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        /* Unauthenticated View */
        <>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Get Started</Text>
            <Text style={styles.cardText}>
              Create an account to start booking gym sessions and unlock your fitness potential
            </Text>

            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={styles.buttonPrimary}
                onPress={() => navigation.navigate('Register' as never)}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonTextPrimary}>Register</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate('Login' as never)}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonText}>Login</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Features Grid */}
          <View style={styles.featuresGrid}>
            <View style={styles.featureCard}>
              <Text style={styles.featureIcon}>🏋️</Text>
              <Text style={styles.featureTitle}>Find Gyms</Text>
              <Text style={styles.featureDescription}>
                Discover gyms near you with advanced filters
              </Text>
            </View>

            <View style={styles.featureCard}>
              <Text style={styles.featureIcon}>📅</Text>
              <Text style={styles.featureTitle}>Book Sessions</Text>
              <Text style={styles.featureDescription}>
                Easy booking with instant confirmation
              </Text>
            </View>

            <View style={styles.featureCard}>
              <Text style={styles.featureIcon}>💪</Text>
              <Text style={styles.featureTitle}>AI Coach</Text>
              <Text style={styles.featureDescription}>
                Personalized workout and nutrition plans
              </Text>
            </View>

            <TouchableOpacity 
              style={styles.featureCard}
              onPress={() => (navigation as any).navigate('Marketplace')}
            >
              <Text style={styles.featureIcon}>🛒</Text>
              <Text style={styles.featureTitle}>Marketplace</Text>
              <Text style={styles.featureDescription}>
                Shop fitness gear and supplements
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  contentContainer: {
    padding: 20,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  logo: {
    width: 200,
    height: 80,
    marginBottom: 12,
  },
  title: {
    fontSize: 56,
    fontWeight: 'bold',
    color: colors.accentPrimary,
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 18,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  card: {
    backgroundColor: colors.bgPrimary,
    borderRadius: 30,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    ...shadows.large,
    marginBottom: 24,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.accentPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.large,
  },
  avatarText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomeInfo: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
  },
  cardText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  buttonGroup: {
    gap: 16,
  },
  button: {
    backgroundColor: colors.bgPrimary,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    ...shadows.medium,
  },
  buttonPrimary: {
    backgroundColor: colors.accentPrimary,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    ...shadows.medium,
  },
  buttonPartner: {
    backgroundColor: '#667eea',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    ...shadows.medium,
  },
  buttonDanger: {
    backgroundColor: colors.error,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    ...shadows.medium,
  },
  buttonText: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '600',
  },
  buttonTextPrimary: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  featuresGrid: {
    width: '100%',
    gap: 16,
  },
  featureCard: {
    backgroundColor: colors.bgPrimary,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    ...shadows.medium,
  },
  featureIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
