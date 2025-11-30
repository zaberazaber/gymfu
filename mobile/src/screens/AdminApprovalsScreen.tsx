import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../utils/api';

interface PendingGym {
  id: number;
  name: string;
  ownerName: string;
  ownerEmail: string;
  address: string;
  city: string;
  basePrice: number;
  createdAt: string;
}

export default function AdminApprovalsScreen() {
  const navigation = useNavigation<any>();
  const [pendingGyms, setPendingGyms] = useState<PendingGym[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [rejectModal, setRejectModal] = useState<PendingGym | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    fetchPendingGyms();
  }, []);

  const fetchPendingGyms = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        navigation.navigate('Login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/admin/gyms/pending`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (data.success) {
        setPendingGyms(data.data);
      } else {
        Alert.alert('Error', data.error || 'Failed to fetch pending gyms');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to connect to server');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleApprove = async (gymId: number) => {
    setActionLoading(gymId);
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/gyms/${gymId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (data.success) {
        setPendingGyms(prev => prev.filter(gym => gym.id !== gymId));
        Alert.alert('Success', 'Gym approved successfully');
      } else {
        Alert.alert('Error', data.error || 'Failed to approve gym');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to approve gym');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    
    setActionLoading(rejectModal.id);
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/gyms/${rejectModal.id}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: rejectReason }),
      });

      const data = await response.json();
      
      if (data.success) {
        setPendingGyms(prev => prev.filter(gym => gym.id !== rejectModal.id));
        setRejectModal(null);
        setRejectReason('');
        Alert.alert('Success', 'Gym rejected');
      } else {
        Alert.alert('Error', data.error || 'Failed to reject gym');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to reject gym');
    } finally {
      setActionLoading(null);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchPendingGyms();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading pending gyms...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>⏳ Pending Approvals</Text>
          <Text style={styles.subtitle}>{pendingGyms.length} gym(s) awaiting approval</Text>
        </View>

        {pendingGyms.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>✅</Text>
            <Text style={styles.emptyTitle}>All caught up!</Text>
            <Text style={styles.emptyText}>No gyms pending approval</Text>
          </View>
        ) : (
          pendingGyms.map(gym => (
            <View key={gym.id} style={styles.gymCard}>
              <View style={styles.gymHeader}>
                <Text style={styles.gymName}>{gym.name}</Text>
                <View style={styles.pendingBadge}>
                  <Text style={styles.pendingText}>Pending</Text>
                </View>
              </View>

              <View style={styles.gymDetails}>
                <Text style={styles.detailRow}>📍 {gym.address}, {gym.city}</Text>
                <Text style={styles.detailRow}>👤 {gym.ownerName || 'N/A'}</Text>
                <Text style={styles.detailRow}>📧 {gym.ownerEmail || 'N/A'}</Text>
                <Text style={styles.detailRow}>💰 {formatCurrency(gym.basePrice)}/session</Text>
                <Text style={styles.detailRow}>📅 Submitted: {formatDate(gym.createdAt)}</Text>
              </View>

              <View style={styles.gymActions}>
                <TouchableOpacity
                  style={[styles.approveBtn, actionLoading === gym.id && styles.disabledBtn]}
                  onPress={() => handleApprove(gym.id)}
                  disabled={actionLoading === gym.id}
                >
                  <Text style={styles.approveBtnText}>
                    {actionLoading === gym.id ? 'Processing...' : '✅ Approve'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.rejectBtn, actionLoading === gym.id && styles.disabledBtn]}
                  onPress={() => setRejectModal(gym)}
                  disabled={actionLoading === gym.id}
                >
                  <Text style={styles.rejectBtnText}>❌ Reject</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <Modal
        visible={rejectModal !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setRejectModal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Reject Gym</Text>
            <Text style={styles.modalText}>
              Are you sure you want to reject "{rejectModal?.name}"?
            </Text>
            <TextInput
              style={styles.reasonInput}
              placeholder="Reason for rejection (optional)"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              value={rejectReason}
              onChangeText={setRejectReason}
              multiline
              numberOfLines={3}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => {
                  setRejectModal(null);
                  setRejectReason('');
                }}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmRejectBtn}
                onPress={handleReject}
              >
                <Text style={styles.confirmRejectText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
  },
  header: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    margin: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4ade80',
    marginBottom: 8,
  },
  emptyText: {
    color: 'rgba(255, 255, 255, 0.6)',
  },
  gymCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    margin: 10,
    marginHorizontal: 20,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#fbbf24',
  },
  gymHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  gymName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  pendingBadge: {
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pendingText: {
    color: '#fbbf24',
    fontSize: 12,
    fontWeight: '600',
  },
  gymDetails: {
    marginBottom: 16,
  },
  detailRow: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginBottom: 6,
  },
  gymActions: {
    flexDirection: 'row',
    gap: 12,
  },
  approveBtn: {
    flex: 1,
    backgroundColor: '#4ade80',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  approveBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  rejectBtn: {
    flex: 1,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  rejectBtnText: {
    color: '#f87171',
    fontWeight: '600',
    fontSize: 15,
  },
  disabledBtn: {
    opacity: 0.6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f87171',
    marginBottom: 8,
  },
  modalText: {
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 16,
  },
  reasonInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 16,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
  confirmRejectBtn: {
    flex: 1,
    backgroundColor: '#ef4444',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmRejectText: {
    color: '#fff',
    fontWeight: '600',
  },
});
