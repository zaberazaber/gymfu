import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { getProfile } from '../store/authSlice';

const FITNESS_GOAL_LABELS: Record<string, string> = {
  weight_loss: 'Weight Loss',
  muscle_gain: 'Muscle Gain',
  general_fitness: 'General Fitness',
  strength: 'Strength',
  endurance: 'Endurance',
  flexibility: 'Flexibility',
  sports_training: 'Sports Training',
};

export default function ProfileScreen() {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { user, loading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getProfile());
  }, [dispatch]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>No profile data available</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.contact}>{user.phoneNumber || user.email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Age</Text>
            <Text style={styles.infoValue}>{user.age || 'Not set'}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Gender</Text>
            <Text style={styles.infoValue}>
              {user.gender ? user.gender.replace('_', ' ') : 'Not set'}
            </Text>
          </View>
        </View>
      </View>

      {user.location && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <Text style={styles.locationText}>
            {user.location.city}, {user.location.state}
          </Text>
          <Text style={styles.locationText}>
            {user.location.country} - {user.location.pincode}
          </Text>
        </View>
      )}

      {user.fitnessGoals && user.fitnessGoals.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fitness Goals</Text>
          <View style={styles.goalsContainer}>
            {user.fitnessGoals.map((goal) => (
              <View key={goal} style={styles.goalBadge}>
                <Text style={styles.goalText}>{FITNESS_GOAL_LABELS[goal] || goal}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <TouchableOpacity
        style={styles.editButton}
        onPress={() => navigation.navigate('EditProfile' as never)}
      >
        <Text style={styles.editButtonText}>Edit Profile</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7fafc',
  },
  header: {
    backgroundColor: '#fff',
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#667eea',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a202c',
    marginBottom: 4,
  },
  contact: {
    fontSize: 14,
    color: '#718096',
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 16,
  },
  infoGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#718096',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#2d3748',
    fontWeight: '500',
  },
  locationText: {
    fontSize: 14,
    color: '#4a5568',
    marginBottom: 4,
  },
  goalsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  goalBadge: {
    backgroundColor: '#e6f2ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  goalText: {
    fontSize: 12,
    color: '#667eea',
    fontWeight: '500',
  },
  editButton: {
    backgroundColor: '#667eea',
    padding: 16,
    margin: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
