import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Share,
  Clipboard,
} from 'react-native';
import { useAppSelector } from '../store/hooks';
import { API_BASE_URL } from '../utils/api';

interface ReferralStats {
  referralCode: string;
  totalReferrals: number;
  rewardPoints: number;
  pointsValue: number;
  referredUsers: Array<{
    name: string;
    email: string;
    joinedAt: string;
    pointsEarned: number;
  }>;
  bonusRates: {
    referralBonus: number;
    signupBonus: number;
    bookingBonus: number;
  };
}

interface LeaderboardEntry {
  name: string;
  totalReferrals: number;
  rewardPoints: number;
}

const ReferralScreen: React.FC = () => {
  const { user, token } = useAppSelector((state) => state.auth);
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchReferralStats();
      fetchLeaderboard();
    }
  }, [token]);

  const fetchReferralStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/referrals/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching referral stats:', error);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/referrals/leaderboard?limit=10`);
      const data = await response.json();
      if (data.success) {
        setLeaderboard(data.data);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyReferralCode = async () => {
    if (!stats?.referralCode) return;
    try {
      Clipboard.setString(stats.referralCode);
      Alert.alert('Copied!', 'Referral code copied to clipboard');
    } catch (error) {
      console.error('Failed to copy referral code:', error);
    }
  };

  const shareReferral = async () => {
    if (!stats?.referralCode) return;
    const shareText = `Join GymFu with my referral code ${stats.referralCode} and get ${stats.bonusRates.signupBonus} bonus points! 💪`;
    try {
      await Share.share({
        message: shareText,
        title: 'Join GymFu',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🎁 Refer & Earn</Text>
        <Text style={styles.subtitle}>Invite friends and earn reward points together!</Text>
      </View>

      {/* Referral Code Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Your Referral Code</Text>
        <View style={styles.codeContainer}>
          <Text style={styles.referralCode}>{stats?.referralCode || 'Loading...'}</Text>
        </View>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.copyButton} onPress={copyReferralCode}>
            <Text style={styles.buttonText}>📋 Copy</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareButton} onPress={shareReferral}>
            <Text style={styles.buttonText}>📤 Share</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>👥</Text>
          <Text style={styles.statValue}>{stats?.totalReferrals || 0}</Text>
          <Text style={styles.statLabel}>Friends Referred</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>🎯</Text>
          <Text style={styles.statValue}>{stats?.rewardPoints || 0}</Text>
          <Text style={styles.statLabel}>Reward Points</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>💰</Text>
          <Text style={styles.statValue}>₹{stats?.pointsValue || 0}</Text>
          <Text style={styles.statLabel}>Cash Value</Text>
        </View>
      </View>

      {/* How it Works */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>How Referrals Work</Text>
        
        <View style={styles.step}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>1</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Share Your Code</Text>
            <Text style={styles.stepDescription}>Send your referral code to friends</Text>
          </View>
        </View>
        
        <View style={styles.step}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>2</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Friend Signs Up</Text>
            <Text style={styles.stepDescription}>
              They get {stats?.bonusRates.signupBonus} points, you get {stats?.bonusRates.referralBonus} points
            </Text>
          </View>
        </View>
        
        <View style={styles.step}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>3</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>First Booking Bonus</Text>
            <Text style={styles.stepDescription}>
              Get {stats?.bonusRates.bookingBonus} extra points when they book
            </Text>
          </View>
        </View>
      </View>

      {/* Referred Users */}
      {stats?.referredUsers && stats.referredUsers.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your Referrals</Text>
          {stats.referredUsers.map((user, index) => (
            <View key={index} style={styles.userItem}>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.userDate}>
                  Joined {new Date(user.joinedAt).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.pointsBadge}>
                <Text style={styles.pointsText}>+{user.pointsEarned} pts</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Leaderboard */}
      {leaderboard.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🏆 Top Referrers</Text>
          {leaderboard.map((entry, index) => (
            <View key={index} style={styles.leaderboardItem}>
              <View style={styles.rank}>
                <Text style={styles.rankText}>{index + 1}</Text>
              </View>
              <View style={styles.leaderInfo}>
                <Text style={styles.leaderName}>{entry.name}</Text>
                <Text style={styles.leaderStats}>
                  {entry.totalReferrals} referrals • {entry.rewardPoints} points
                </Text>
              </View>
              {index < 3 && (
                <Text style={styles.medal}>{['🥇', '🥈', '🥉'][index]}</Text>
              )}
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  codeContainer: {
    backgroundColor: '#f0f8ff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#667eea',
    borderStyle: 'dashed',
    padding: 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  referralCode: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#667eea',
    letterSpacing: 2,
    fontFamily: 'monospace',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  copyButton: {
    flex: 1,
    backgroundColor: '#667eea',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  shareButton: {
    flex: 1,
    backgroundColor: '#764ba2',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    marginBottom: 15,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  step: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  userItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  userDate: {
    fontSize: 13,
    color: '#666',
  },
  pointsBadge: {
    backgroundColor: '#e8f5e8',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pointsText: {
    color: '#2d5a2d',
    fontSize: 13,
    fontWeight: '600',
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  rank: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  leaderInfo: {
    flex: 1,
  },
  leaderName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  leaderStats: {
    fontSize: 13,
    color: '#666',
  },
  medal: {
    fontSize: 24,
    marginLeft: 8,
  },
});

export default ReferralScreen;
