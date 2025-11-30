import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { API_BASE_URL } from '../utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Class {
  id: number;
  gymId: number;
  instructorId: number;
  name: string;
  type: 'yoga' | 'zumba' | 'dance' | 'pilates' | 'spinning' | 'crossfit' | 'boxing';
  schedule: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }[];
  capacity: number;
  price: number | string;
  description?: string;
  gymName: string;
  instructorName: string;
  instructorRating: number | string;
  instructorSpecialization: string;
}

const ClassDetailScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { classId } = route.params as { classId: number };
  const { user } = useSelector((state: RootState) => state.auth);

  const [classData, setClassData] = useState<Class | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    fetchClassDetails();
  }, [classId]);

  const fetchClassDetails = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/classes/${classId}`);
      const data = await response.json();
      if (data.success) {
        setClassData(data.data);
      } else {
        setError(data.message || 'Failed to fetch class details');
      }
    } catch (err: any) {
      setError('Failed to fetch class details');
      console.error('Error fetching class details:', err);
    } finally {
      setLoading(false);
    }
  };

  const getNextClassDate = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const getNextClassTimeSlot = () => {
    if (!classData || classData.schedule.length === 0) return '10:00-11:00';
    const firstSchedule = classData.schedule[0];
    return `${firstSchedule.startTime}-${firstSchedule.endTime}`;
  };

  const handleBookClass = async () => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to book this class', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Login', onPress: () => navigation.navigate('Login' as never) },
      ]);
      return;
    }

    if (!classData) return;

    setBooking(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          gymId: classData.gymId,
          date: getNextClassDate(),
          timeSlot: getNextClassTimeSlot(),
          sessionType: 'class',
          classId: classData.id,
        }),
      });

      const data = await response.json();
      if (data.success) {
        Alert.alert('Success', 'Class booked successfully!', [
          { text: 'OK', onPress: () => navigation.navigate('BookingHistory' as never) },
        ]);
      } else {
        Alert.alert('Error', data.message || 'Failed to book class');
      }
    } catch (err: any) {
      console.error('Error booking class:', err);
      Alert.alert('Error', 'Failed to book class');
    } finally {
      setBooking(false);
    }
  };

  const getTypeIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      yoga: '🧘',
      zumba: '💃',
      dance: '🕺',
      pilates: '🤸',
      spinning: '🚴',
      crossfit: '🏋️',
      boxing: '🥊',
    };
    return icons[type] || '🏃';
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Loading class details...</Text>
      </View>
    );
  }

  if (error || !classData) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorTitle}>Error</Text>
        <Text style={styles.errorText}>{error || 'Class not found'}</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.typeBadge}>
          <Text style={styles.typeIcon}>{getTypeIcon(classData.type)}</Text>
          <Text style={styles.typeName}>{classData.type}</Text>
        </View>
        <Text style={styles.title}>{classData.name}</Text>
        
        <View style={styles.metaContainer}>
          <View style={styles.metaItem}>
            <Text style={styles.metaIcon}>📍</Text>
            <Text style={styles.metaText}>{classData.gymName}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaIcon}>💰</Text>
            <Text style={styles.metaText}>₹{typeof classData.price === 'string' ? parseFloat(classData.price) : classData.price} per session</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaIcon}>👥</Text>
            <Text style={styles.metaText}>Max {classData.capacity} participants</Text>
          </View>
        </View>
      </View>

      {classData.description && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About This Class</Text>
          <Text style={styles.description}>{classData.description}</Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Instructor</Text>
        <View style={styles.instructorCard}>
          <View style={styles.instructorAvatar}>
            <Text style={styles.instructorAvatarText}>👨‍🏫</Text>
          </View>
          <View style={styles.instructorInfo}>
            <Text style={styles.instructorName}>{classData.instructorName}</Text>
            <Text style={styles.instructorSpecialization}>
              {classData.instructorSpecialization}
            </Text>
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingStars}>⭐⭐⭐⭐⭐</Text>
              <Text style={styles.ratingNumber}>{typeof classData.instructorRating === 'string' ? parseFloat(classData.instructorRating).toFixed(1) : classData.instructorRating.toFixed(1)}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Class Schedule</Text>
        {classData.schedule.map((schedule, index) => (
          <View key={index} style={styles.scheduleItem}>
            <Text style={styles.scheduleDay}>{dayNames[schedule.dayOfWeek]}</Text>
            <Text style={styles.scheduleTime}>
              {schedule.startTime} - {schedule.endTime}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.bookingSection}>
        <View style={styles.priceDisplay}>
          <Text style={styles.priceLabel}>Price per session</Text>
          <Text style={styles.priceAmount}>₹{typeof classData.price === 'string' ? parseFloat(classData.price) : classData.price}</Text>
        </View>
        <TouchableOpacity
          style={[styles.bookButton, booking && styles.bookButtonDisabled]}
          onPress={handleBookClass}
          disabled={booking}
        >
          <Text style={styles.bookButtonText}>
            {booking ? 'Booking...' : 'Book This Class'}
          </Text>
        </TouchableOpacity>
        {!user && (
          <Text style={styles.loginNotice}>Please login to book this class</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#667eea',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginBottom: 15,
  },
  typeIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  typeName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'capitalize',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  metaContainer: {
    gap: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  metaText: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e9ecef',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: '#666',
  },
  instructorCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  instructorAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  instructorAvatarText: {
    fontSize: 30,
  },
  instructorInfo: {
    flex: 1,
  },
  instructorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  instructorSpecialization: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingStars: {
    fontSize: 12,
    color: '#ff9500',
    marginRight: 6,
  },
  ratingNumber: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  scheduleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  scheduleDay: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  scheduleTime: {
    fontSize: 13,
    color: '#666',
  },
  bookingSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 10,
    marginBottom: 20,
  },
  priceDisplay: {
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  priceLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 5,
  },
  priceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#667eea',
  },
  bookButton: {
    backgroundColor: '#667eea',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  bookButtonDisabled: {
    backgroundColor: '#ccc',
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loginNotice: {
    textAlign: 'center',
    fontSize: 13,
    color: '#666',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 10,
  },
  errorText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ClassDetailScreen;
