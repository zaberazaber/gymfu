import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Modal,
  Image,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  getUserBookings,
  checkInBooking,
  cancelBooking,
  getBookingQRCode,
  clearError,
} from '../store/bookingSlice';
import { colors, shadows } from '../styles/neumorphic';

export default function BookingHistoryScreen() {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  
  const { bookings, qrCodeData, loading, error } = useAppSelector(state => state.booking);
  const { user } = useAppSelector(state => state.auth);
  
  const [refreshing, setRefreshing] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);

  useEffect(() => {
    if (user) {
      dispatch(getUserBookings());
    }
  }, [user, dispatch]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(getUserBookings());
    setRefreshing(false);
  };

  const handleCheckIn = async (bookingId: number) => {
    Alert.alert(
      'Check In',
      'Are you sure you want to check in to this booking?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Check In',
          onPress: async () => {
            try {
              await dispatch(checkInBooking(bookingId)).unwrap();
              dispatch(getUserBookings());
              Alert.alert('Success', 'Checked in successfully!');
            } catch (error) {
              Alert.alert('Error', error as string || 'Failed to check in');
            }
          },
        },
      ]
    );
  };

  const handleCancel = async (bookingId: number) => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(cancelBooking(bookingId)).unwrap();
              dispatch(getUserBookings());
              Alert.alert('Success', 'Booking cancelled successfully');
            } catch (error) {
              Alert.alert('Error', error as string || 'Failed to cancel booking');
            }
          },
        },
      ]
    );
  };

  const handleShowQRCode = async (bookingId: number) => {
    try {
      await dispatch(getBookingQRCode(bookingId)).unwrap();
      setSelectedBookingId(bookingId);
      setShowQRModal(true);
    } catch (error) {
      Alert.alert('Error', error as string || 'Failed to get QR code');
    }
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'confirmed':
        return styles.statusConfirmed;
      case 'checked_in':
        return styles.statusCheckedIn;
      case 'completed':
        return styles.statusCompleted;
      case 'cancelled':
        return styles.statusCancelled;
      case 'pending':
        return styles.statusPending;
      default:
        return styles.statusDefault;
    }
  };

  const isQRCodeExpired = (expiry: string | null) => {
    if (!expiry) return false;
    return new Date(expiry) < new Date();
  };

  const canCheckIn = (booking: any) => {
    return booking.status === 'confirmed' && 
           booking.qrCode && 
           !isQRCodeExpired(booking.qrCodeExpiry);
  };

  const canCancel = (booking: any) => {
    return booking.status === 'confirmed' || booking.status === 'pending';
  };

  if (!user) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.messageText}>Please log in to view your bookings</Text>
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

  if (loading && bookings.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.accentPrimary} />
        <Text style={styles.loadingText}>Loading your bookings...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Bookings</Text>
        <TouchableOpacity
          style={styles.newBookingButton}
          onPress={() => navigation.navigate('Gyms' as never)}
          activeOpacity={0.8}
        >
          <Text style={styles.newBookingButtonText}>+ New</Text>
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {bookings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📅</Text>
          <Text style={styles.emptyTitle}>No bookings yet</Text>
          <Text style={styles.emptyText}>
            You haven't made any gym bookings yet. Start by exploring gyms near you!
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('Gyms' as never)}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Find Gyms</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.accentPrimary}
            />
          }
        >
          {bookings.map((booking) => (
            <View key={booking.id} style={styles.bookingCard}>
              {/* Booking Header */}
              <View style={styles.bookingHeader}>
                <View style={styles.gymInfo}>
                  <Text style={styles.gymName}>{booking.gym?.name || 'Unknown Gym'}</Text>
                  <Text style={styles.gymAddress}>{booking.gym?.address}</Text>
                  <Text style={styles.gymCity}>
                    {booking.gym?.city}, {booking.gym?.pincode}
                  </Text>
                </View>
                <View style={[styles.statusBadge, getStatusBadgeStyle(booking.status)]}>
                  <Text style={styles.statusText}>
                    {booking.status.replace('_', ' ').toUpperCase()}
                  </Text>
                </View>
              </View>

              {/* Booking Details */}
              <View style={styles.bookingDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Session Date:</Text>
                  <Text style={styles.detailValue}>
                    {new Date(booking.sessionDate).toLocaleString()}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Price:</Text>
                  <Text style={styles.detailValuePrice}>₹{booking.price}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Booked on:</Text>
                  <Text style={styles.detailValue}>
                    {new Date(booking.createdAt).toLocaleDateString()}
                  </Text>
                </View>

                {booking.checkInTime && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Checked in:</Text>
                    <Text style={styles.detailValue}>
                      {new Date(booking.checkInTime).toLocaleString()}
                    </Text>
                  </View>
                )}

                {booking.gym?.amenities && booking.gym.amenities.length > 0 && (
                  <View style={styles.amenitiesContainer}>
                    {booking.gym.amenities.map((amenity, index) => (
                      <View key={index} style={styles.amenityTag}>
                        <Text style={styles.amenityText}>{amenity}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>

              {/* Actions */}
              <View style={styles.actionsContainer}>
                {canCheckIn(booking) && (
                  <TouchableOpacity
                    style={styles.actionButtonSuccess}
                    onPress={() => handleCheckIn(booking.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.actionButtonText}>Check In</Text>
                  </TouchableOpacity>
                )}

                {booking.qrCode && (
                  <TouchableOpacity
                    style={styles.actionButtonInfo}
                    onPress={() => handleShowQRCode(booking.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.actionButtonText}>Show QR</Text>
                  </TouchableOpacity>
                )}

                {canCancel(booking) && (
                  <TouchableOpacity
                    style={styles.actionButtonDanger}
                    onPress={() => handleCancel(booking.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.actionButtonText}>Cancel</Text>
                  </TouchableOpacity>
                )}
              </View>

              {booking.qrCodeExpiry && isQRCodeExpired(booking.qrCodeExpiry) && (
                <View style={styles.expiredNotice}>
                  <Text style={styles.expiredNoticeText}>⚠️ QR Code has expired</Text>
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      )}

      {/* QR Code Modal */}
      <Modal
        visible={showQRModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowQRModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Booking QR Code</Text>
              <TouchableOpacity
                onPress={() => setShowQRModal(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {qrCodeData && (
              <View style={styles.modalBody}>
                <Image
                  source={{ uri: qrCodeData.qrCodeImage }}
                  style={styles.qrCodeImage}
                  resizeMode="contain"
                />
                <Text style={styles.qrCodeText}>{qrCodeData.qrCodeString}</Text>
                <Text style={styles.qrInstructions}>
                  Show this QR code at the gym to check in
                </Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.bgPrimary,
    ...shadows.medium,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  newBookingButton: {
    backgroundColor: colors.accentPrimary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  newBookingButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorContainer: {
    backgroundColor: '#fee',
    padding: 16,
    margin: 20,
    borderRadius: 12,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  content: {
    padding: 20,
  },
  bookingCard: {
    backgroundColor: colors.bgPrimary,
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    ...shadows.large,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.bgSecondary,
  },
  gymInfo: {
    flex: 1,
  },
  gymName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  gymAddress: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  gymCity: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  statusConfirmed: {
    backgroundColor: '#4caf50',
  },
  statusCheckedIn: {
    backgroundColor: '#2196f3',
  },
  statusCompleted: {
    backgroundColor: '#9e9e9e',
  },
  statusCancelled: {
    backgroundColor: '#f44336',
  },
  statusPending: {
    backgroundColor: '#ff9800',
  },
  statusDefault: {
    backgroundColor: '#757575',
  },
  bookingDetails: {
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  detailValuePrice: {
    fontSize: 16,
    color: colors.accentPrimary,
    fontWeight: 'bold',
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  amenityTag: {
    backgroundColor: colors.bgSecondary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  amenityText: {
    fontSize: 12,
    color: colors.textPrimary,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 8,
    padding: 16,
    backgroundColor: colors.bgSecondary,
  },
  actionButtonSuccess: {
    flex: 1,
    backgroundColor: '#4caf50',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionButtonInfo: {
    flex: 1,
    backgroundColor: '#2196f3',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionButtonDanger: {
    flex: 1,
    backgroundColor: '#f44336',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  expiredNotice: {
    backgroundColor: '#fff3cd',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#ffeaa7',
  },
  expiredNoticeText: {
    color: '#856404',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.bgPrimary,
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    ...shadows.large,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.bgSecondary,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.bgSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: colors.textSecondary,
  },
  modalBody: {
    padding: 20,
    alignItems: 'center',
  },
  qrCodeImage: {
    width: 250,
    height: 250,
    marginBottom: 16,
  },
  qrCodeText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 12,
    color: colors.textSecondary,
    backgroundColor: colors.bgSecondary,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  qrInstructions: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
