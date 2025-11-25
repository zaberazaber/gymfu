import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { getGymById } from '../store/gymSlice';
import { createBooking, clearError } from '../store/bookingSlice';
import { colors, shadows } from '../styles/neumorphic';

export default function BookingScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  
  const { gymId } = route.params as { gymId: number };
  const { selectedGym, loading: gymLoading } = useAppSelector(state => state.gym);
  const { selectedBooking, loading: bookingLoading, error } = useAppSelector(state => state.booking);
  const { user } = useAppSelector(state => state.auth);
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    if (gymId) {
      dispatch(getGymById(gymId));
    }
  }, [gymId, dispatch]);

  useEffect(() => {
    // Set default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSelectedDate(tomorrow);
    
    // Set default time to 10 AM
    const defaultTime = new Date();
    defaultTime.setHours(10, 0, 0, 0);
    setSelectedTime(defaultTime);
  }, []);

  useEffect(() => {
    if (selectedBooking && selectedBooking.status === 'confirmed') {
      // Navigate to QR code screen
      (navigation as any).navigate('QRCode', { booking: selectedBooking });
    }
  }, [selectedBooking, navigation]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleTimeChange = (event: any, time?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (time) {
      setSelectedTime(time);
    }
  };

  const handleBooking = async () => {
    if (!user) {
      Alert.alert('Authentication Required', 'Please log in to book a session');
      navigation.navigate('Login' as never);
      return;
    }

    // Combine date and time
    const sessionDateTime = new Date(selectedDate);
    sessionDateTime.setHours(selectedTime.getHours(), selectedTime.getMinutes(), 0, 0);
    
    // Check if the selected time is in the future
    if (sessionDateTime <= new Date()) {
      Alert.alert('Invalid Date', 'Please select a future date and time');
      return;
    }

    try {
      await dispatch(createBooking({
        gymId,
        sessionDate: sessionDateTime.toISOString(),
      })).unwrap();
    } catch (error) {
      Alert.alert('Booking Failed', error as string || 'Failed to create booking');
    }
  };

  if (!user) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.messageText}>Please log in to book a session</Text>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('Login' as never)}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (gymLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.accentPrimary} />
        <Text style={styles.loadingText}>Loading gym details...</Text>
      </View>
    );
  }

  if (!selectedGym) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Gym not found</Text>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Gym Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gym Details</Text>
          <Text style={styles.gymName}>{selectedGym.name}</Text>
          <Text style={styles.address}>{selectedGym.address}</Text>
          <Text style={styles.city}>{selectedGym.city}, {selectedGym.pincode}</Text>
          
          {selectedGym.amenities && selectedGym.amenities.length > 0 && (
            <View style={styles.amenitiesContainer}>
              {selectedGym.amenities.map((amenity, index) => (
                <View key={index} style={styles.amenityTag}>
                  <Text style={styles.amenityText}>{amenity}</Text>
                </View>
              ))}
            </View>
          )}
          
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Price:</Text>
            <Text style={styles.priceValue}>₹{selectedGym.basePrice}</Text>
          </View>
        </View>

        {/* Date & Time Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Date & Time</Text>
          
          <TouchableOpacity
            style={styles.dateTimeButton}
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.dateTimeLabel}>Date:</Text>
            <Text style={styles.dateTimeValue}>
              {selectedDate.toLocaleDateString()}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dateTimeButton}
            onPress={() => setShowTimePicker(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.dateTimeLabel}>Time:</Text>
            <Text style={styles.dateTimeValue}>
              {selectedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              minimumDate={new Date()}
            />
          )}

          {showTimePicker && (
            <DateTimePicker
              value={selectedTime}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleTimeChange}
            />
          )}
        </View>

        {/* Booking Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Booking Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Gym:</Text>
            <Text style={styles.summaryValue}>{selectedGym.name}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Session:</Text>
            <Text style={styles.summaryValue}>
              {selectedDate.toLocaleDateString()} at{' '}
              {selectedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Price:</Text>
            <Text style={styles.summaryValuePrice}>₹{selectedGym.basePrice}</Text>
          </View>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </ScrollView>

      {/* Book Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.bookButton, bookingLoading && styles.bookButtonDisabled]}
          onPress={handleBooking}
          disabled={bookingLoading}
          activeOpacity={0.8}
        >
          {bookingLoading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.bookButtonText}>Book Now</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  section: {
    backgroundColor: colors.bgPrimary,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    ...shadows.large,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  gymName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  address: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  city: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  amenityTag: {
    backgroundColor: colors.bgSecondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  amenityText: {
    color: colors.textPrimary,
    fontSize: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.bgSecondary,
  },
  priceLabel: {
    fontSize: 16,
    color: colors.textSecondary,
    marginRight: 8,
  },
  priceValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.accentPrimary,
  },
  dateTimeButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.bgSecondary,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  dateTimeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  dateTimeValue: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  summaryValuePrice: {
    fontSize: 18,
    color: colors.accentPrimary,
    fontWeight: 'bold',
  },
  errorContainer: {
    backgroundColor: '#fee',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.bgPrimary,
    padding: 20,
    ...shadows.large,
  },
  bookButton: {
    backgroundColor: colors.accentPrimary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    ...shadows.medium,
  },
  bookButtonDisabled: {
    opacity: 0.6,
  },
  bookButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  primaryButton: {
    backgroundColor: colors.accentPrimary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    ...shadows.medium,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: colors.bgSecondary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  secondaryButtonText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  messageText: {
    fontSize: 16,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 12,
  },
});
