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
  TextInput,
  Switch,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import RazorpayCheckout from 'react-native-razorpay';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { getGymById } from '../store/gymSlice';
import { createBooking, verifyPayment, clearError } from '../store/bookingSlice';
import { colors, shadows } from '../styles/neumorphic';
import { API_BASE_URL, RAZORPAY_KEY_ID } from '../utils/api';

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
  const [processingPayment, setProcessingPayment] = useState(false);
  
  // Corporate booking states
  const [useCorporateCode, setUseCorporateCode] = useState(false);
  const [corporateAccessCode, setCorporateAccessCode] = useState('');
  const [validatingCode, setValidatingCode] = useState(false);
  const [corporateInfo, setCorporateInfo] = useState<any>(null);
  const [codeValidated, setCodeValidated] = useState(false);

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
    if (selectedBooking && selectedBooking.status === 'confirmed' && !processingPayment) {
      // Navigate to QR code screen after successful payment
      (navigation as any).navigate('QRCode', { booking: selectedBooking });
    }
  }, [selectedBooking, navigation, processingPayment]);

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

  const validateCorporateCode = async () => {
    if (!corporateAccessCode.trim()) {
      Alert.alert('Invalid Code', 'Please enter a corporate access code');
      return;
    }

    setValidatingCode(true);
    try {
      const response = await fetch(`${API_BASE_URL}/corporate/validate-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accessCode: corporateAccessCode.trim() }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setCorporateInfo(data.data);
        setCodeValidated(true);
        Alert.alert(
          'Code Validated',
          `Welcome ${data.data.employee.employeeName}! You have access to ${data.data.corporateAccount.companyName}'s corporate wellness program.\n\nRemaining sessions: ${data.data.corporateAccount.remainingSessions}`
        );
      } else {
        Alert.alert('Invalid Code', data.message || 'The access code is invalid or expired');
        setCodeValidated(false);
        setCorporateInfo(null);
      }
    } catch (error) {
      Alert.alert('Validation Error', 'Failed to validate access code. Please try again.');
      setCodeValidated(false);
      setCorporateInfo(null);
    } finally {
      setValidatingCode(false);
    }
  };

  const handleBooking = async () => {
    if (!user) {
      Alert.alert('Authentication Required', 'Please log in to book a session');
      navigation.navigate('Login' as never);
      return;
    }

    // Validate corporate code if enabled
    if (useCorporateCode && !codeValidated) {
      Alert.alert('Validation Required', 'Please validate your corporate access code first');
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
      // For corporate bookings, skip payment
      if (useCorporateCode && codeValidated) {
        // Create booking with corporate code (no payment needed)
        const result = await dispatch(createBooking({
          gymId,
          sessionDate: sessionDateTime.toISOString(),
          corporateAccessCode: corporateAccessCode.trim(),
        })).unwrap();

        Alert.alert('Success', 'Your corporate booking is confirmed!');
        (navigation as any).navigate('QRCode', { booking: result });
        return;
      }

      // Regular booking flow with payment
      // Step 1: Create booking (status: pending)
      const result = await dispatch(createBooking({
        gymId,
        sessionDate: sessionDateTime.toISOString(),
      })).unwrap();

      // Step 2: Open Razorpay payment
      if (result.razorpayOrderId) {
        openRazorpayPayment(result);
      } else {
        Alert.alert('Payment Error', 'Failed to initialize payment. Please try again.');
      }
    } catch (error) {
      Alert.alert('Booking Failed', error as string || 'Failed to create booking');
    }
  };

  const openRazorpayPayment = async (booking: any) => {
    const options = {
      description: `Booking for ${selectedGym?.name}`,
      image: 'https://i.imgur.com/3g7nmJC.png', // Your app logo
      currency: 'INR',
      key: RAZORPAY_KEY_ID,
      amount: booking.price * 100, // Amount in paise
      name: 'GymFu',
      order_id: booking.razorpayOrderId,
      prefill: {
        email: user?.email || '',
        contact: user?.phoneNumber || '',
        name: user?.name || '',
      },
      theme: { color: colors.accentPrimary },
    };

    try {
      setProcessingPayment(true);
      const data = await RazorpayCheckout.open(options);
      
      // Step 3: Verify payment on backend
      await dispatch(verifyPayment({
        bookingId: booking.id,
        razorpayPaymentId: data.razorpay_payment_id,
        razorpayOrderId: data.razorpay_order_id,
        razorpaySignature: data.razorpay_signature,
      })).unwrap();

      setProcessingPayment(false);
      Alert.alert('Success', 'Payment successful! Your booking is confirmed.');
    } catch (error: any) {
      setProcessingPayment(false);
      
      if (error.code === RazorpayCheckout.PAYMENT_CANCELLED) {
        Alert.alert(
          'Payment Cancelled',
          'Your booking is still pending. You can complete payment from booking history.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Payment Failed', error.description || 'Payment verification failed');
      }
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

          <View style={styles.capacityContainer}>
            <Text style={styles.capacityLabel}>Capacity:</Text>
            <Text style={styles.capacityValue}>
              {selectedGym.currentOccupancy || 0}/{selectedGym.capacity} people
              {selectedGym.currentOccupancy >= selectedGym.capacity && ' (Full)'}
            </Text>
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

        {/* Corporate Access Code */}
        <View style={styles.section}>
          <View style={styles.corporateHeader}>
            <Text style={styles.sectionTitle}>Corporate Booking</Text>
            <Switch
              value={useCorporateCode}
              onValueChange={(value) => {
                setUseCorporateCode(value);
                if (!value) {
                  setCorporateAccessCode('');
                  setCodeValidated(false);
                  setCorporateInfo(null);
                }
              }}
              trackColor={{ false: colors.bgSecondary, true: colors.accentPrimary }}
              thumbColor={useCorporateCode ? '#ffffff' : colors.textSecondary}
            />
          </View>

          {useCorporateCode && (
            <>
              <Text style={styles.corporateDescription}>
                Use your company's corporate access code for free booking
              </Text>

              <View style={styles.codeInputContainer}>
                <TextInput
                  style={styles.codeInput}
                  placeholder="Enter Access Code"
                  placeholderTextColor={colors.textSecondary}
                  value={corporateAccessCode}
                  onChangeText={(text) => {
                    setCorporateAccessCode(text.toUpperCase());
                    setCodeValidated(false);
                    setCorporateInfo(null);
                  }}
                  autoCapitalize="characters"
                  maxLength={12}
                  editable={!codeValidated}
                />
                <TouchableOpacity
                  style={[
                    styles.validateButton,
                    (validatingCode || codeValidated) && styles.validateButtonDisabled,
                  ]}
                  onPress={validateCorporateCode}
                  disabled={validatingCode || codeValidated}
                  activeOpacity={0.8}
                >
                  {validatingCode ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text style={styles.validateButtonText}>
                      {codeValidated ? '✓ Validated' : 'Validate'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>

              {codeValidated && corporateInfo && (
                <View style={styles.corporateInfoBox}>
                  <Text style={styles.corporateInfoTitle}>
                    {corporateInfo.corporateAccount.companyName}
                  </Text>
                  <Text style={styles.corporateInfoText}>
                    Employee: {corporateInfo.employee.employeeName}
                  </Text>
                  <Text style={styles.corporateInfoText}>
                    Remaining Sessions: {corporateInfo.corporateAccount.remainingSessions}
                  </Text>
                  <Text style={styles.corporateInfoSuccess}>
                    ✓ No payment required
                  </Text>
                </View>
              )}
            </>
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
            <Text style={styles.summaryLabel}>
              {useCorporateCode && codeValidated ? 'Corporate Price:' : 'Price:'}
            </Text>
            <Text style={[
              styles.summaryValuePrice,
              useCorporateCode && codeValidated && styles.corporatePriceStrike,
            ]}>
              {useCorporateCode && codeValidated ? '₹0 (Company Paid)' : `₹${selectedGym.basePrice}`}
            </Text>
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
          style={[styles.bookButton, (bookingLoading || processingPayment) && styles.bookButtonDisabled]}
          onPress={handleBooking}
          disabled={bookingLoading || processingPayment}
          activeOpacity={0.8}
        >
          {processingPayment ? (
            <>
              <ActivityIndicator color="#ffffff" />
              <Text style={[styles.bookButtonText, { marginLeft: 8 }]}>Processing Payment...</Text>
            </>
          ) : bookingLoading ? (
            <>
              <ActivityIndicator color="#ffffff" />
              <Text style={[styles.bookButtonText, { marginLeft: 8 }]}>Creating Booking...</Text>
            </>
          ) : (
            <Text style={styles.bookButtonText}>
              {useCorporateCode && codeValidated ? 'Confirm Corporate Booking' : 'Proceed to Payment'}
            </Text>
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
  capacityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  capacityLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginRight: 8,
  },
  capacityValue: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
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
  corporateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  corporateDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 18,
  },
  codeInputContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  codeInput: {
    flex: 1,
    backgroundColor: colors.bgSecondary,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: '600',
    letterSpacing: 1,
  },
  validateButton: {
    backgroundColor: colors.accentPrimary,
    paddingHorizontal: 20,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 100,
  },
  validateButtonDisabled: {
    opacity: 0.6,
  },
  validateButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  corporateInfoBox: {
    backgroundColor: '#e8f5e9',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4caf50',
  },
  corporateInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 8,
  },
  corporateInfoText: {
    fontSize: 14,
    color: '#388e3c',
    marginBottom: 4,
  },
  corporateInfoSuccess: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginTop: 8,
  },
  corporatePriceStrike: {
    color: '#4caf50',
    fontWeight: 'bold',
  },
});
