import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, shadows } from '../styles/neumorphic';

export default function QRCodeScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { booking } = route.params as { booking: any };

  useEffect(() => {
    // Store QR code locally for offline access
    if (booking && booking.qrCodeImage) {
      storeQRCodeLocally();
    }
  }, [booking]);

  const storeQRCodeLocally = async () => {
    try {
      const qrData = {
        bookingId: booking.id,
        qrCodeImage: booking.qrCodeImage,
        qrCode: booking.qrCode,
        qrCodeExpiry: booking.qrCodeExpiry,
        gymName: booking.gym?.name || 'Unknown Gym',
        sessionDate: booking.sessionDate,
      };
      await AsyncStorage.setItem(`qr_${booking.id}`, JSON.stringify(qrData));
    } catch (error) {
      console.error('Failed to store QR code locally:', error);
    }
  };

  const isQRCodeExpired = () => {
    if (!booking.qrCodeExpiry) return false;
    return new Date(booking.qrCodeExpiry) < new Date();
  };

  if (!booking) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Booking not found</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Success Message */}
        <View style={styles.successContainer}>
          <Text style={styles.successIcon}>✅</Text>
          <Text style={styles.successTitle}>Booking Confirmed!</Text>
        </View>

        {/* Booking Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Booking Details</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Gym:</Text>
            <Text style={styles.detailValue}>{booking.gym?.name || 'Unknown Gym'}</Text>
          </View>

          {booking.gym?.address && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Address:</Text>
              <Text style={styles.detailValue}>{booking.gym.address}</Text>
            </View>
          )}

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Session:</Text>
            <Text style={styles.detailValue}>
              {new Date(booking.sessionDate).toLocaleString()}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Price:</Text>
            <Text style={styles.detailValuePrice}>₹{booking.price}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status:</Text>
            <Text style={[styles.detailValue, styles.statusConfirmed]}>
              {booking.status.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* QR Code */}
        {booking.qrCodeImage && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your QR Code</Text>
            <Text style={styles.qrInstructions}>
              Show this QR code at the gym to check in
            </Text>
            
            <View style={styles.qrCodeContainer}>
              <Image
                source={{ uri: booking.qrCodeImage }}
                style={styles.qrCodeImage}
                resizeMode="contain"
              />
            </View>

            {booking.qrCode && (
              <Text style={styles.qrCodeText}>{booking.qrCode}</Text>
            )}

            {booking.qrCodeExpiry && (
              <View style={[
                styles.expiryContainer,
                isQRCodeExpired() && styles.expiryContainerExpired
              ]}>
                <Text style={[
                  styles.expiryText,
                  isQRCodeExpired() && styles.expiryTextExpired
                ]}>
                  {isQRCodeExpired() ? '⚠️ Expired: ' : 'Valid until: '}
                  {new Date(booking.qrCodeExpiry).toLocaleString()}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('BookingHistory' as never)}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>View My Bookings</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('Gyms' as never)}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>Book Another Gym</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  },
  successContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  successIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.accentPrimary,
    textAlign: 'center',
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
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.bgSecondary,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  detailValuePrice: {
    fontSize: 18,
    color: colors.accentPrimary,
    fontWeight: 'bold',
  },
  statusConfirmed: {
    color: '#4caf50',
  },
  qrInstructions: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  qrCodeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  qrCodeImage: {
    width: 250,
    height: 250,
  },
  qrCodeText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    backgroundColor: colors.bgSecondary,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  expiryContainer: {
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 8,
  },
  expiryContainerExpired: {
    backgroundColor: '#ffebee',
  },
  expiryText: {
    fontSize: 12,
    color: '#1976d2',
    textAlign: 'center',
    fontWeight: '500',
  },
  expiryTextExpired: {
    color: '#c62828',
  },
  actionsContainer: {
    marginTop: 8,
  },
  primaryButton: {
    backgroundColor: colors.accentPrimary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 12,
    ...shadows.medium,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: colors.bgSecondary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  button: {
    backgroundColor: colors.accentPrimary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    ...shadows.medium,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    textAlign: 'center',
    marginBottom: 20,
  },
});
