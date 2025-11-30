import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { API_BASE_URL } from '../utils/api';

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

const ClassesScreen: React.FC = () => {
  const navigation = useNavigation();
  const [classes, setClasses] = useState<Class[]>([]);
  const [filteredClasses, setFilteredClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>('all');

  const classTypes = [
    { value: 'all', label: 'All', icon: '🏃' },
    { value: 'yoga', label: 'Yoga', icon: '🧘' },
    { value: 'zumba', label: 'Zumba', icon: '💃' },
    { value: 'dance', label: 'Dance', icon: '🕺' },
    { value: 'pilates', label: 'Pilates', icon: '🤸' },
    { value: 'spinning', label: 'Spin', icon: '🚴' },
    { value: 'crossfit', label: 'CrossFit', icon: '🏋️' },
    { value: 'boxing', label: 'Boxing', icon: '🥊' },
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedType === 'all') {
      setFilteredClasses(classes);
    } else {
      setFilteredClasses(classes.filter(cls => cls.type === selectedType));
    }
  }, [classes, selectedType]);

  const fetchClasses = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/classes`);
      const data = await response.json();
      if (data.success) {
        setClasses(data.data);
      } else {
        setError(data.message || 'Failed to fetch classes');
      }
    } catch (err: any) {
      setError('Failed to fetch classes');
      console.error('Error fetching classes:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatSchedule = (schedule: Class['schedule']) => {
    return schedule
      .map(s => `${dayNames[s.dayOfWeek]} ${s.startTime}-${s.endTime}`)
      .join(', ');
  };

  const getTypeIcon = (type: string) => {
    const typeData = classTypes.find(t => t.value === type);
    return typeData?.icon || '🏃';
  };

  const renderClassCard = ({ item }: { item: Class }) => (
    <TouchableOpacity
      style={styles.classCard}
      onPress={() => (navigation as any).navigate('ClassDetail', { classId: item.id })}
    >
      <View style={styles.classHeader}>
        <View style={styles.typeBadge}>
          <Text style={styles.typeIcon}>{getTypeIcon(item.type)}</Text>
          <Text style={styles.typeName}>{item.type}</Text>
        </View>
        <Text style={styles.price}>₹{typeof item.price === 'string' ? parseFloat(item.price) : item.price}</Text>
      </View>

      <Text style={styles.className}>{item.name}</Text>
      <Text style={styles.gymName}>📍 {item.gymName}</Text>

      <View style={styles.instructorInfo}>
        <Text style={styles.instructorName}>👨‍🏫 {item.instructorName}</Text>
        <Text style={styles.rating}>⭐ {typeof item.instructorRating === 'string' ? parseFloat(item.instructorRating).toFixed(1) : item.instructorRating.toFixed(1)}</Text>
      </View>

      <View style={styles.scheduleContainer}>
        <Text style={styles.scheduleLabel}>Schedule:</Text>
        <Text style={styles.scheduleText}>{formatSchedule(item.schedule)}</Text>
      </View>

      <Text style={styles.capacity}>👥 Capacity: {item.capacity} people</Text>

      <TouchableOpacity style={styles.bookButton}>
        <Text style={styles.bookButtonText}>Book Class</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderFilterButton = (type: { value: string; label: string; icon: string }) => (
    <TouchableOpacity
      key={type.value}
      style={[
        styles.filterButton,
        selectedType === type.value && styles.filterButtonActive,
      ]}
      onPress={() => setSelectedType(type.value)}
    >
      <Text style={styles.filterIcon}>{type.icon}</Text>
      <Text
        style={[
          styles.filterLabel,
          selectedType === type.value && styles.filterLabelActive,
        ]}
      >
        {type.label}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Loading classes...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorTitle}>Error</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchClasses}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🧘 Fitness Classes</Text>
        <Text style={styles.subtitle}>Discover and book fitness classes</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        {classTypes.map(renderFilterButton)}
      </ScrollView>

      {filteredClasses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No classes found</Text>
          <Text style={styles.emptyText}>
            {selectedType === 'all'
              ? 'No classes are currently available.'
              : `No ${selectedType} classes are currently available.`}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredClasses}
          renderItem={renderClassCard}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
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
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  filtersContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  filtersContent: {
    padding: 15,
    gap: 10,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginRight: 10,
  },
  filterButtonActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  filterIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  filterLabelActive: {
    color: '#fff',
  },
  listContent: {
    padding: 15,
  },
  classCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  classHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  typeIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  typeName: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
    color: '#333',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#667eea',
  },
  className: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  gymName: {
    fontSize: 13,
    color: '#666',
    marginBottom: 10,
  },
  instructorInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
    marginBottom: 10,
  },
  instructorName: {
    fontSize: 13,
    color: '#555',
  },
  rating: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ff9500',
  },
  scheduleContainer: {
    marginBottom: 10,
  },
  scheduleLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  scheduleText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
  capacity: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
  bookButton: {
    backgroundColor: '#667eea',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
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
  retryButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ClassesScreen;
