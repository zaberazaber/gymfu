import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../utils/api';

interface User {
  id: number;
  name: string;
  email?: string;
  phoneNumber?: string;
  isAdmin: boolean;
  role: string;
  isPartner: boolean;
  createdAt: string;
  totalBookings: number;
}

export default function AdminUsersScreen() {
  const navigation = useNavigation<any>();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [editModal, setEditModal] = useState<User | null>(null);
  const [editRole, setEditRole] = useState('');
  const [editIsAdmin, setEditIsAdmin] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async (pageNum = 1, searchQuery = '') => {
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
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`${API_BASE_URL}/admin/users?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (data.success) {
        if (pageNum === 1) {
          setUsers(data.data);
        } else {
          setUsers(prev => [...prev, ...data.data]);
        }
        setHasMore(data.pagination.page < data.pagination.totalPages);
        setPage(pageNum);
      } else {
        Alert.alert('Error', data.error || 'Failed to fetch users');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setLoading(true);
    fetchUsers(1, search);
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      fetchUsers(page + 1, search);
    }
  };

  const openEditModal = (user: User) => {
    setEditModal(user);
    setEditRole(user.role);
    setEditIsAdmin(user.isAdmin);
  };

  const handleUpdateRole = async () => {
    if (!editModal) return;

    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/users/${editModal.id}/role`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: editRole, isAdmin: editIsAdmin }),
      });

      const data = await response.json();
      
      if (data.success) {
        setUsers(prev => prev.map(u => 
          u.id === editModal.id 
            ? { ...u, role: editRole, isAdmin: editIsAdmin }
            : u
        ));
        setEditModal(null);
        Alert.alert('Success', 'User role updated');
      } else {
        Alert.alert('Error', data.error || 'Failed to update user role');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update user role');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getRoleBadge = (user: User) => {
    if (user.isAdmin) return { text: '🛡️ Admin', style: styles.adminBadge };
    if (user.isPartner) return { text: '🏋️ Partner', style: styles.partnerBadge };
    return { text: '👤 User', style: styles.userBadge };
  };

  const renderUser = ({ item }: { item: User }) => {
    const badge = getRoleBadge(item);
    return (
      <TouchableOpacity style={styles.userCard} onPress={() => openEditModal(item)}>
        <View style={styles.userHeader}>
          <Text style={styles.userName}>{item.name}</Text>
          <View style={badge.style}>
            <Text style={styles.badgeText}>{badge.text}</Text>
          </View>
        </View>
        <View style={styles.userDetails}>
          {item.email && <Text style={styles.detailText}>📧 {item.email}</Text>}
          {item.phoneNumber && <Text style={styles.detailText}>📱 {item.phoneNumber}</Text>}
          <Text style={styles.detailText}>📅 {item.totalBookings} bookings</Text>
          <Text style={styles.detailText}>🗓️ Joined {formatDate(item.createdAt)}</Text>
        </View>
        <TouchableOpacity style={styles.editBtn} onPress={() => openEditModal(item)}>
          <Text style={styles.editBtnText}>✏️ Edit Role</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, email, or phone..."
          placeholderTextColor="rgba(255, 255, 255, 0.5)"
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
          <Text style={styles.searchBtnText}>🔍</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={users}
        renderItem={renderUser}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No users found</Text>
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

      <Modal
        visible={editModal !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setEditModal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Edit User Role</Text>
            <Text style={styles.modalSubtitle}>{editModal?.name}</Text>

            <Text style={styles.label}>Role</Text>
            <View style={styles.roleOptions}>
              {['user', 'partner', 'admin'].map(role => (
                <TouchableOpacity
                  key={role}
                  style={[styles.roleOption, editRole === role && styles.roleOptionActive]}
                  onPress={() => setEditRole(role)}
                >
                  <Text style={[styles.roleOptionText, editRole === role && styles.roleOptionTextActive]}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.adminToggle}
              onPress={() => setEditIsAdmin(!editIsAdmin)}
            >
              <View style={[styles.checkbox, editIsAdmin && styles.checkboxActive]}>
                {editIsAdmin && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.adminToggleText}>Grant Admin Access</Text>
            </TouchableOpacity>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setEditModal(null)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleUpdateRole}
              >
                <Text style={styles.saveBtnText}>Save</Text>
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
  searchBar: {
    flexDirection: 'row',
    padding: 16,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  searchBtn: {
    backgroundColor: '#667eea',
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  searchBtnText: {
    fontSize: 18,
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  userCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  adminBadge: {
    backgroundColor: 'rgba(240, 147, 251, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  partnerBadge: {
    backgroundColor: 'rgba(102, 126, 234, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  userBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  userDetails: {
    marginBottom: 12,
  },
  detailText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 13,
    marginBottom: 4,
  },
  editBtn: {
    backgroundColor: 'rgba(102, 126, 234, 0.2)',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  editBtnText: {
    color: '#667eea',
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
    color: '#fff',
    marginBottom: 4,
  },
  modalSubtitle: {
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 20,
  },
  label: {
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  roleOptions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  roleOption: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  roleOptionActive: {
    backgroundColor: 'rgba(102, 126, 234, 0.2)',
    borderColor: '#667eea',
  },
  roleOptionText: {
    color: 'rgba(255, 255, 255, 0.6)',
  },
  roleOptionTextActive: {
    color: '#667eea',
    fontWeight: '600',
  },
  adminToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  checkmark: {
    color: '#fff',
    fontWeight: 'bold',
  },
  adminToggleText: {
    color: 'rgba(255, 255, 255, 0.8)',
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
  saveBtn: {
    flex: 1,
    backgroundColor: '#667eea',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
});
