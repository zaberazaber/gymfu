import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    StyleSheet,
    Modal,
    ScrollView,
    TextInput,
    Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import * as Location from 'expo-location';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
    searchNearbyGyms,
    setLocation,
    setRadius,
    setAmenities,
    setPriceRange,
    clearFilters,
} from '../store/gymSlice';
import { colors, shadows } from '../styles/neumorphic';

const AMENITIES = ['Cardio', 'Weights', 'Shower', 'Parking', 'Locker', 'AC'];

export default function GymListScreen() {
    const navigation = useNavigation();
    const dispatch = useAppDispatch();
    const { gyms, loading, error, filters, refreshing } = useAppSelector((state) => state.gym);

    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [tempAmenities, setTempAmenities] = useState<string[]>([]);
    const [tempRadius, setTempRadius] = useState(20);
    const [tempMinPrice, setTempMinPrice] = useState<string>('');
    const [tempMaxPrice, setTempMaxPrice] = useState<string>('');
    const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);

    useEffect(() => {
        requestLocationPermission();
    }, []);

    useEffect(() => {
        if (locationPermissionGranted) {
            dispatch(searchNearbyGyms());
        }
    }, [locationPermissionGranted, dispatch]);

    // Reload gyms when screen comes into focus
    useFocusEffect(
        React.useCallback(() => {
            if (locationPermissionGranted && gyms.length === 0) {
                console.log('Fetching gyms on focus, current count:', gyms.length);
                dispatch(searchNearbyGyms());
            }
        }, [locationPermissionGranted, gyms.length, dispatch])
    );

    const requestLocationPermission = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                setLocationPermissionGranted(true);
                // For testing: Use Mumbai location where gyms are seeded
                // Uncomment below to use actual device location
                // const location = await Location.getCurrentPositionAsync({});
                // dispatch(
                //     setLocation({
                //         latitude: location.coords.latitude,
                //         longitude: location.coords.longitude,
                //     })
                // );
                console.log('Using default Mumbai location for testing');
            } else {
                Alert.alert(
                    'Location Permission',
                    'Location permission is required to find nearby gyms. Using default location (Mumbai).',
                    [{ text: 'OK' }]
                );
                setLocationPermissionGranted(true);
            }
        } catch (error) {
            console.error('Error requesting location permission:', error);
            setLocationPermissionGranted(true);
        }
    };

    const handleRefresh = () => {
        dispatch(searchNearbyGyms());
    };

    const openFilterModal = () => {
        // Sync temp states with current filters when opening modal
        setTempAmenities(filters.amenities);
        setTempRadius(filters.radius);
        setTempMinPrice(filters.minPrice?.toString() || '');
        setTempMaxPrice(filters.maxPrice?.toString() || '');
        setFilterModalVisible(true);
    };

    const toggleAmenity = (amenity: string) => {
        if (tempAmenities.includes(amenity)) {
            setTempAmenities(tempAmenities.filter((a) => a !== amenity));
        } else {
            setTempAmenities([...tempAmenities, amenity]);
        }
    };

    const applyFilters = () => {
        console.log('Applying filters:', {
            amenities: tempAmenities,
            radius: tempRadius,
            minPrice: tempMinPrice,
            maxPrice: tempMaxPrice,
        });
        dispatch(setAmenities(tempAmenities));
        dispatch(setRadius(tempRadius));
        dispatch(
            setPriceRange({
                min: tempMinPrice ? parseFloat(tempMinPrice) : null,
                max: tempMaxPrice ? parseFloat(tempMaxPrice) : null,
            })
        );
        setFilterModalVisible(false);
        dispatch(searchNearbyGyms());
    };

    const resetFilters = () => {
        setTempAmenities([]);
        setTempRadius(20);
        setTempMinPrice('');
        setTempMaxPrice('');
        dispatch(clearFilters());
        setFilterModalVisible(false);
        dispatch(searchNearbyGyms());
    };

    const renderGymCard = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.gymCard}
            onPress={() => (navigation as any).navigate('GymDetail', { gymId: item.id })}
            activeOpacity={0.8}
        >
            <View style={styles.gymHeader}>
                <Text style={styles.gymName}>{item.name}</Text>
                <View style={styles.ratingBadge}>
                    <Text style={styles.ratingText}>⭐ {Number(item.rating).toFixed(1)}</Text>
                </View>
            </View>

            <Text style={styles.gymAddress}>{item.address}</Text>
            <Text style={styles.gymCity}>
                {item.city} • {item.distance ? `${item.distance.toFixed(1)} km` : 'N/A'}
            </Text>

            <View style={styles.amenitiesContainer}>
                {item.amenities.slice(0, 3).map((amenity: string, index: number) => (
                    <View key={index} style={styles.amenityTag}>
                        <Text style={styles.amenityText}>{amenity}</Text>
                    </View>
                ))}
                {item.amenities.length > 3 && (
                    <Text style={styles.moreAmenities}>+{item.amenities.length - 3} more</Text>
                )}
            </View>

            <View style={styles.gymFooter}>
                <Text style={styles.priceText}>₹{item.basePrice}/session</Text>
                <TouchableOpacity style={styles.bookButton} activeOpacity={0.8}>
                    <Text style={styles.bookButtonText}>Book Now</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Discover Gyms</Text>
                <TouchableOpacity
                    style={styles.filterButton}
                    onPress={openFilterModal}
                    activeOpacity={0.8}
                >
                    <Text style={styles.filterButtonText}>🔍 Filters</Text>
                </TouchableOpacity>
            </View>

            {/* Active Filters Display */}
            {(filters.amenities.length > 0 || filters.minPrice || filters.maxPrice) && (
                <View style={styles.activeFilters}>
                    <Text style={styles.activeFiltersText}>
                        Active Filters: {filters.amenities.join(', ')}
                        {filters.minPrice && ` • Min: ₹${filters.minPrice}`}
                        {filters.maxPrice && ` • Max: ₹${filters.maxPrice}`}
                    </Text>
                </View>
            )}

            {/* Error Message */}
            {error && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            )}

            {/* Gym List */}
            <FlatList
                data={gyms}
                renderItem={renderGymCard}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing || loading}
                        onRefresh={handleRefresh}
                        colors={[colors.accentPrimary]}
                        tintColor={colors.accentPrimary}
                    />
                }
                ListEmptyComponent={
                    !loading ? (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No gyms found nearby</Text>
                            <Text style={styles.emptySubtext}>Try adjusting your filters or location</Text>
                        </View>
                    ) : null
                }
            />

            {/* Filter Modal */}
            <Modal
                visible={filterModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setFilterModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Text style={styles.modalTitle}>Filter Gyms</Text>

                            {/* Radius Slider */}
                            <View style={styles.filterSection}>
                                <Text style={styles.filterLabel}>Search Radius: {tempRadius} km</Text>
                                <View style={styles.radiusButtons}>
                                    {[5, 10, 20, 30].map((radius) => (
                                        <TouchableOpacity
                                            key={radius}
                                            style={[
                                                styles.radiusButton,
                                                tempRadius === radius && styles.radiusButtonActive,
                                            ]}
                                            onPress={() => setTempRadius(radius)}
                                            activeOpacity={0.8}
                                        >
                                            <Text
                                                style={[
                                                    styles.radiusButtonText,
                                                    tempRadius === radius && styles.radiusButtonTextActive,
                                                ]}
                                            >
                                                {radius}km
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            {/* Amenities */}
                            <View style={styles.filterSection}>
                                <Text style={styles.filterLabel}>Amenities</Text>
                                <View style={styles.amenitiesGrid}>
                                    {AMENITIES.map((amenity) => (
                                        <TouchableOpacity
                                            key={amenity}
                                            style={[
                                                styles.amenityButton,
                                                tempAmenities.includes(amenity) && styles.amenityButtonActive,
                                            ]}
                                            onPress={() => toggleAmenity(amenity)}
                                            activeOpacity={0.8}
                                        >
                                            <Text
                                                style={[
                                                    styles.amenityButtonText,
                                                    tempAmenities.includes(amenity) && styles.amenityButtonTextActive,
                                                ]}
                                            >
                                                {amenity}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            {/* Price Range */}
                            <View style={styles.filterSection}>
                                <Text style={styles.filterLabel}>Price Range (₹)</Text>
                                <View style={styles.priceInputs}>
                                    <TextInput
                                        style={styles.priceInput}
                                        placeholder="Min"
                                        placeholderTextColor={colors.textSecondary}
                                        keyboardType="numeric"
                                        value={tempMinPrice}
                                        onChangeText={setTempMinPrice}
                                    />
                                    <Text style={styles.priceSeparator}>-</Text>
                                    <TextInput
                                        style={styles.priceInput}
                                        placeholder="Max"
                                        placeholderTextColor={colors.textSecondary}
                                        keyboardType="numeric"
                                        value={tempMaxPrice}
                                        onChangeText={setTempMaxPrice}
                                    />
                                </View>
                            </View>

                            {/* Action Buttons */}
                            <View style={styles.modalActions}>
                                <TouchableOpacity
                                    style={styles.resetButton}
                                    onPress={resetFilters}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.resetButtonText}>Reset</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.applyButton}
                                    onPress={applyFilters}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.applyButtonText}>Apply Filters</Text>
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={() => setFilterModalVisible(false)}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.closeButtonText}>Close</Text>
                            </TouchableOpacity>
                        </ScrollView>
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        paddingTop: 60,
        backgroundColor: colors.bgPrimary,
        ...shadows.medium,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    filterButton: {
        backgroundColor: colors.accentPrimary,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        ...shadows.small,
    },
    filterButtonText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '600',
    },
    activeFilters: {
        backgroundColor: colors.bgSecondary,
        padding: 12,
        marginHorizontal: 20,
        marginTop: 10,
        borderRadius: 12,
    },
    activeFiltersText: {
        color: colors.textSecondary,
        fontSize: 12,
    },
    errorContainer: {
        backgroundColor: colors.error,
        padding: 12,
        marginHorizontal: 20,
        marginTop: 10,
        borderRadius: 12,
    },
    errorText: {
        color: '#ffffff',
        fontSize: 14,
        textAlign: 'center',
    },
    listContent: {
        padding: 20,
    },
    gymCard: {
        backgroundColor: colors.bgPrimary,
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        ...shadows.large,
    },
    gymHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    gymName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.textPrimary,
        flex: 1,
        marginRight: 8,
    },
    ratingBadge: {
        backgroundColor: colors.accentSecondary,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    ratingText: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: '600',
    },
    gymAddress: {
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: 4,
    },
    gymCity: {
        fontSize: 12,
        color: colors.textSecondary,
        marginBottom: 12,
    },
    amenitiesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 12,
        gap: 8,
    },
    amenityTag: {
        backgroundColor: colors.bgSecondary,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    amenityText: {
        color: colors.textPrimary,
        fontSize: 11,
    },
    moreAmenities: {
        color: colors.textSecondary,
        fontSize: 11,
        alignSelf: 'center',
    },
    gymFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    priceText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.accentPrimary,
    },
    bookButton: {
        backgroundColor: colors.accentPrimary,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 12,
        ...shadows.small,
    },
    bookButtonText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '600',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: colors.bgPrimary,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 24,
        maxHeight: '80%',
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: 24,
        textAlign: 'center',
    },
    filterSection: {
        marginBottom: 24,
    },
    filterLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: 12,
    },
    radiusButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    radiusButton: {
        flex: 1,
        backgroundColor: colors.bgSecondary,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    radiusButtonActive: {
        backgroundColor: colors.accentPrimary,
    },
    radiusButtonText: {
        color: colors.textPrimary,
        fontSize: 14,
        fontWeight: '600',
    },
    radiusButtonTextActive: {
        color: '#ffffff',
    },
    amenitiesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    amenityButton: {
        backgroundColor: colors.bgSecondary,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
    },
    amenityButtonActive: {
        backgroundColor: colors.accentPrimary,
    },
    amenityButtonText: {
        color: colors.textPrimary,
        fontSize: 14,
        fontWeight: '500',
    },
    amenityButtonTextActive: {
        color: '#ffffff',
    },
    priceInputs: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    priceInput: {
        flex: 1,
        backgroundColor: colors.bgSecondary,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: colors.textPrimary,
    },
    priceSeparator: {
        color: colors.textSecondary,
        fontSize: 18,
        fontWeight: 'bold',
    },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    resetButton: {
        flex: 1,
        backgroundColor: colors.bgSecondary,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    resetButtonText: {
        color: colors.textPrimary,
        fontSize: 16,
        fontWeight: '600',
    },
    applyButton: {
        flex: 1,
        backgroundColor: colors.accentPrimary,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        ...shadows.medium,
    },
    applyButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    closeButton: {
        backgroundColor: colors.bgSecondary,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    closeButtonText: {
        color: colors.textPrimary,
        fontSize: 16,
        fontWeight: '600',
    },
});
