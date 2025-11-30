import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../utils/api';

interface Gym {
  id: number;
  name: string;
  ownerName: string;
  address: string;
  city: string;
  isVerified: boolean;
  basePrice: number;
  rating: number;
  totalBookings: number;
  createdAt: string;
}

export default function AdminGymsScreen() {
  const navigation = useNavigation<any>();
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'verified' | 'pending'>('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchGyms(1);
  }, [filter]);

  const fetchGyms = async (pageNum = 1) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        navigation.navigate('Login');
        return;
      }

      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '20',
      });
      if (filter !== 'all') {
        params.append('verified', filter === 'verified' ? 'true' : 'false');
      }

      const response = await fetch(`${API_BASE_URL}/admin/gyms?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (data.success) {
        if (pageNum === 1) {
          setGyms(data.data);
        } else {
          setGyms(prev => [...prev, ...data.data]);
        }
        setHasMore(data.pagination.page < data.pagination.totalPages);
        setPage(pageNum);
      } else {
        Alert.alert('Error', data.error || 'Failed to fetch gyms');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (gymId: number) => {
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
        setGyms(prev => prev.map(g => 
          g.id === gymId ? { ...g, isVerified: true } : g
        ));
        Alert.alert('Success', 'Gym approved');
      } else {
        Alert.alert('Error', data.error || 'Failed to approve gym');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to approve gym');
    }
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      fetchGyms(page + 1);
    }
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

  const renderGym = ({ item }: { item: Gym }) => (
    <View style={[styles.gymCard, item.isVerified ? styles.verifiedCard : styles.pendingCard]}>
      <View style={styles.gymHeader}>
        <Text style={styles.gymName}>{item.name}</Text>
        <View style={item.isVerified ? styles.verifiedBadge : styles.pendingBadge}>
          <Text style={styles.badgeText}>
            {item.isVerified ? '✅ Verified' : '⏳ Pending'}
          </Text>
        </View>
      </View>

      <View style={styles.gymInfo}>
        <Text style={styles.infoText}>📍 {item.address}, {item.city}</Text>
        <Text style={styles.infoText}>👤 {item.ownerName || 'N/A'}</Text>
        <Text style={styles.infoText}>💰 {formatCurrency(item.basePrice)}/session</Text>
        <Text style={styles.infoText}>⭐ {item.rating?.toFixed(1) || 'N/A'}</Text>
        <Text style={styles.infoText}>📅 {item.totalBookings} bookings</Text>
        <Text style={styles.infoText}>🗓️ Added {formatDate(item.createdAt)}</Text>
      </View>

      <View style={styles.gymActions}>
        <TouchableOpacity
          style={styles.viewBtn}
          onPress={() => navigation.navigate('GymDetail', { gymId: item.id })}
        >
          <Text style={styles.viewBtnText}>👁️ View</Text>
        </TouchableOpacity>
        {!item.isVerified && (
          <TouchableOpacity
            style={styles.approveBtn}
            onPress={() => handleApprove(item.id)}
          >
            <Text style={styles.approveBtnText}>✅ Approve</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.filterBar}>
        {(['all', 'verified', 'pending'] as const).map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
            onPress={() => {
              setFilter(f);
              setLoading(true);
            }}
          >
            <Text style={[styles.filterBtnText, filter === f && styles.filterBtnTextActive]}>
              {f === 'all' ? 'All' : f === 'verified' ? '✅ Verified' : '⏳ Pending'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={gyms}
        renderItem={renderGym}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No gyms found</Text>
          </View>
        }
        ListFooterComponent={
          loading ? (
            <View style={styles.loadingFooter}>
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  filterBar: {
    flexDirection: 'row',
    padding: 16,
    gap: 10,
  },
  filterBtn: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  filterBtnActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  filterBtnText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 13,
  },
  filterBtnTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  gymCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  verifiedCard: {
    borderLeftColor: '#4ade80',
  },
  pendingCard: {
    borderLeftColor: '#fbbf24',
  },
  gymHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  gymName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  verifiedBadge: {
    backgroundColor: 'rgba(74, 222, 128, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pendingBadge: {
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  gymInfo: {
    marginBottom: 12,
  },
  infoText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 13,
    marginBottom: 4,
  },
  gymActions: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  viewBtn: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
  approveBtn: {
    flex: 1,
    backgroundColor: '#4ade80',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  approveBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
  loadingFooter: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
});
