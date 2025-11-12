import React, { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { getProfile, updateProfile, clearError } from '../store/authSlice';

const FITNESS_GOALS = [
  { value: 'weight_loss', label: 'Weight Loss' },
  { value: 'muscle_gain', label: 'Muscle Gain' },
  { value: 'general_fitness', label: 'General Fitness' },
  { value: 'strength', label: 'Strength' },
  { value: 'endurance', label: 'Endurance' },
  { value: 'flexibility', label: 'Flexibility' },
  { value: 'sports_training', label: 'Sports Training' },
];

const GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { user, loading, error } = useAppSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    city: '',
    state: '',
    country: '',
    pincode: '',
    fitnessGoals: [] as string[],
  });

  useEffect(() => {
    if (!user) {
      dispatch(getProfile());
    } else {
      setFormData({
        name: user.name || '',
        age: user.age?.toString() || '',
        gender: user.gender || '',
        city: user.location?.city || '',
        state: user.location?.state || '',
        country: user.location?.country || '',
        pincode: user.location?.pincode || '',
        fitnessGoals: user.fitnessGoals || [],
      });
    }
  }, [user, dispatch]);

  const handleSubmit = async () => {
    dispatch(clearError());

    const profileData = {
      name: formData.name,
      age: formData.age ? parseInt(formData.age) : undefined,
      gender: formData.gender || undefined,
      location: {
        city: formData.city || undefined,
        state: formData.state || undefined,
        country: formData.country || undefined,
        pincode: formData.pincode || undefined,
      },
      fitnessGoals: formData.fitnessGoals.length > 0 ? formData.fitnessGoals : undefined,
    };

    const result = await dispatch(updateProfile(profileData));

    if (updateProfile.fulfilled.match(result)) {
      Alert.alert('Success', 'Profile updated successfully');
      navigation.goBack();
    } else if (error) {
      Alert.alert('Error', error);
    }
  };

  const toggleGoal = (goal: string) => {
    setFormData({
      ...formData,
      fitnessGoals: formData.fitnessGoals.includes(goal)
        ? formData.fitnessGoals.filter((g) => g !== goal)
        : [...formData.fitnessGoals, goal],
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {error && <Text style={styles.error}>{error}</Text>}

        <View style={styles.formGroup}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            placeholder="Enter your name"
            editable={!loading}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Age</Text>
          <TextInput
            style={styles.input}
            value={formData.age}
            onChangeText={(text) => setFormData({ ...formData, age: text })}
            placeholder="Enter your age"
            keyboardType="number-pad"
            editable={!loading}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Gender</Text>
          <View style={styles.genderContainer}>
            {GENDERS.map((g) => (
              <TouchableOpacity
                key={g.value}
                style={[
                  styles.genderButton,
                  formData.gender === g.value && styles.genderButtonActive,
                ]}
                onPress={() => setFormData({ ...formData, gender: g.value })}
                disabled={loading}
              >
                <Text
                  style={[
                    styles.genderText,
                    formData.gender === g.value && styles.genderTextActive,
                  ]}
                >
                  {g.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Location</Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>City</Text>
          <TextInput
            style={styles.input}
            value={formData.city}
            onChangeText={(text) => setFormData({ ...formData, city: text })}
            placeholder="Enter city"
            editable={!loading}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>State</Text>
          <TextInput
            style={styles.input}
            value={formData.state}
            onChangeText={(text) => setFormData({ ...formData, state: text })}
            placeholder="Enter state"
            editable={!loading}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Country</Text>
          <TextInput
            style={styles.input}
            value={formData.country}
            onChangeText={(text) => setFormData({ ...formData, country: text })}
            placeholder="Enter country"
            editable={!loading}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Pincode</Text>
          <TextInput
            style={styles.input}
            value={formData.pincode}
            onChangeText={(text) => setFormData({ ...formData, pincode: text })}
            placeholder="Enter 6-digit pincode"
            keyboardType="number-pad"
            maxLength={6}
            editable={!loading}
          />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Fitness Goals</Text>
        </View>

        <View style={styles.goalsContainer}>
          {FITNESS_GOALS.map((goal) => (
            <TouchableOpacity
              key={goal.value}
              style={[
                styles.goalButton,
                formData.fitnessGoals.includes(goal.value) && styles.goalButtonActive,
              ]}
              onPress={() => toggleGoal(goal.value)}
              disabled={loading}
            >
              <Text
                style={[
                  styles.goalButtonText,
                  formData.fitnessGoals.includes(goal.value) && styles.goalButtonTextActive,
                ]}
              >
                {goal.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.saveButton, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7fafc',
  },
  content: {
    padding: 20,
  },
  error: {
    backgroundColor: '#fed7d7',
    color: '#c53030',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#c53030',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2d3748',
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  sectionHeader: {
    marginTop: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a202c',
  },
  genderContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  genderButton: {
    flex: 1,
    minWidth: '45%',
    padding: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  genderButtonActive: {
    borderColor: '#667eea',
    backgroundColor: '#e6f2ff',
  },
  genderText: {
    fontSize: 14,
    color: '#4a5568',
  },
  genderTextActive: {
    color: '#667eea',
    fontWeight: '600',
  },
  goalsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  goalButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 20,
    backgroundColor: '#fff',
  },
  goalButtonActive: {
    borderColor: '#667eea',
    backgroundColor: '#e6f2ff',
  },
  goalButtonText: {
    fontSize: 13,
    color: '#4a5568',
  },
  goalButtonTextActive: {
    color: '#667eea',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#667eea',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  cancelButtonText: {
    color: '#718096',
    fontSize: 16,
    fontWeight: '600',
  },
});
