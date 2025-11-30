import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../utils/api';

interface DashboardStats {
  totalUsers: number;
  totalGyms: number;
  totalBookings: number;
  totalRevenue: number;
  pendingGyms: number;
  activeUsers: number;
  todayBookings: number;
  todayRevenue: number;
}

interface RecentActivity {
  type: string;
  title: string;
  createdAt: string;
}

export default function AdminDashboardScreen() {
  const navigation = useNavigation<any>();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        navigation.navigate('Login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/admin/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (data.success) {
        setStats(data.data.stats);
        setRecentActivity(data.data.recentActivity);
      } else {
        Alert.alert('Error', data.error || 'Failed to fetch dashboard');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to connect to server');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboard();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'new_user': return '👤';
      case 'new_booking': return '📅';
      case 'new_gym': return '🏋️';
      default: return '📱';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>🛡️ Admin Dashboard</Text>
        <Text style={styles.subtitle}>Platform Overview</Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={[styles.statCard, styles.primaryCard]}>
          <Text style={styles.statIcon}>👥</Text>
          <Text style={styles.statValue}>{stats?.totalUsers || 0}</Text>
          <Text style={styles.statLabel}>Total Users</Text>
          <Text style={styles.statSub}>{stats?.activeUsers || 0} active</Text>
        </View>

        <View style={[styles.statCard, styles.successCard]}>
          <Text style={styles.statIcon}>🏋️</Text>
          <Text style={styles.statValue}>{stats?.totalGyms || 0}</Text>
          <Text style={styles.statLabel}>Total Gyms</Text>
          <Text style={styles.statSub}>{stats?.pendingGyms || 0} pending</Text>
        </View>

        <View style={[styles.statCard, styles.infoCard]}>
          <Text style={styles.statIcon}>📅</Text>
          <Text style={styles.statValue}>{stats?.totalBookings || 0}</Text>
          <Text style={styles.statLabel}>Bookings</Text>
          <Text style={styles.statSub}>{stats?.todayBookings || 0} today</Text>
        </View>

        <View style={[styles.statCard, styles.warningCard]}>
          <Text style={styles.statIcon}>💰</Text>
          <Text style={styles.statValue}>{formatCurrency(stats?.totalRevenue || 0)}</Text>
          <Text style={styles.statLabel}>Revenue</Text>
          <Text style={styles.statSub}>{formatCurrency(stats?.todayRevenue || 0)} today</Text>
        </View>
      </View>

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate('AdminApprovals')}
          >
            <Text style={styles.actionIcon}>✅</Text>
            <Text style={styles.actionText}>Approvals</Text>
            {(stats?.pendingGyms || 0) > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{stats?.pendingGyms}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate('AdminUsers')}
          >
            <Text style={styles.actionIcon}>👤</Text>
            <Text style={styles.actionText}>Users</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate('AdminGyms')}
          >
            <Text style={styles.actionIcon}>🏢</Text>
            <Text style={styles.actionText}>Gyms</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.actionIcon}>🏠</Text>
            <Text style={styles.actionText}>Home</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.activitySection}>
        <Text style={styles.sectionTitle}>📊 Recent Activity</Text>
        {recentActivity.length === 0 ? (
          <Text style={styles.noActivity}>No recent activity</Text>
        ) : (
          recentActivity.map((activity, index) => (
            <View key={index} style={styles.activityItem}>
              <Text style={styles.activityIcon}>{getActivityIcon(activity.type)}</Text>
              <View style={styles.activityDetails}>
                <Text style={styles.activityTitle}>{activity.title}</Text>
                <Text style={styles.activityTime}>{formatTimeAgo(activity.createdAt)}</Text>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
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
    paddingTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    gap: 10,
  },
  statCard: {
    width: '47%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
  },
  primaryCard: {
    borderLeftColor: '#667eea',
  },
  successCard: {
    borderLeftColor: '#4ade80',
  },
  infoCard: {
    borderLeftColor: '#38bdf8',
  },
  warningCard: {
    borderLeftColor: '#fbbf24',
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 4,
  },
  statSub: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.4)',
    marginTop: 2,
  },
  quickActions: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionBtn: {
    width: '47%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    position: 'relative',
  },
  actionIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  actionText: {
    color: '#fff',
    fontSize: 14,
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#f5576c',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  activitySection: {
    padding: 20,
    paddingTop: 0,
  },
  noActivity: {
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    padding: 20,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  activityIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  activityDetails: {
    flex: 1,
  },
  activityTitle: {
    color: '#fff',
    fontSize: 14,
  },
  activityTime: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
    marginTop: 2,
  },
});
