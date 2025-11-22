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
import { useNavigation } from '@react-navigation/native';
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
    const { gyms, loading, error, filters } = useAppSelector((state) => state.gym);

    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [tempAmenities, setTempAmenities] = useState<string[]>(filters.amenities);
    const [tempMinPrice, setTempMinPrice] = useState<string>(filters.minPrice?.toString() || '');
    const [tempMaxPrice, setTempMaxPrice] = useState<string>(filters.maxPrice?.toString() || '');
    const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);
    const [usingGPS, setUsingGPS] = useState(false);

    useEffect(() => {
        requestLocationPermission();
    }, []);

    useEffect(() => {
        if (locationPermissionGranted) {
            dispatch(searchNearbyGyms());
        }
    }, [locationPermissionGranted, dispatch]);

    const requestLocationPermission = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                setLocationPermissionGranted(true);
                // Get actual device GPS location
                try {
                    const location = await Location.getCurrentPositionAsync({});
                    dispatch(
                        setLocation({
                            latitude: location.coords.latitude,
                            longitude: location.coords.longitude,
                        })
                    );
                    setUsingGPS(true);
                    console.log('Using GPS location:', location.coords.latitude, location.coords.longitude);
                } catch (gpsError) {
                    console.log('GPS error, using default Mumbai location:', gpsError);
                    setUsingGPS(false);
                }
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

    const handleSearch = () => {
        dispatch(searchNearbyGyms());
    };

    const updateGPSLocation = async () => {
        try {
            const location = await Location.getCurrentPositionAsync({});
            dispatch(
                setLocation({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                })
            );
            setUsingGPS(true);
            console.log('GPS location updated:', location.coords.latitude, location.coords.longitude);
            dispatch(searchNearbyGyms());
        } catch (error) {
            Alert.alert('GPS Error', 'Could not get your current location. Using default location.');
            console.error('GPS update error:', error);
        }
    };

    const useDefaultLocation = () => {
        dispatch(
            setLocation({
                latitude: 19.076,
                longitude: 72.8777,
            })
        );
        setUsingGPS(false);
        console.log('Using default Mumbai location');
        dispatch(searchNearbyGyms());
    };

    const toggleAmenity = (amenity: string) => {
        if (tempAmenities.includes(amenity)) {
            setTempAmenities(tempAmenities.filter((a) => a !== amenity));
        } else {
            setTempAmenities([...tempAmenities, amenity]);
        }
    };

    const applyAdvancedFilters = () => {
        dispatch(setAmenities(tempAmenities));
        dispatch(
            setPriceRange({
                min: tempMinPrice ? parseFloat(tempMinPrice) : null,
                max: tempMaxPrice ? parseFloat(tempMaxPrice) : null,
            })
        );
        setShowAdvancedFilters(false);
        dispatch(searchNearbyGyms());
    };

    const handleClearFilters = () => {
        setTempAmenities([]);
        setTempMinPrice('');
        setTempMaxPrice('');
        dispatch(clearFilters());
        setShowAdvancedFilters(false);
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
            {/* Header with Search Controls */}
            <View style={styles.header}>
                <View style={styles.titleRow}>
                    <Text style={styles.title}>Discover Gyms</Text>
                    <TouchableOpacity
                        style={styles.locationButton}
                        onPress={usingGPS ? useDefaultLocation : updateGPSLocation}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.locationButtonText}>
                            {usingGPS ? '📍 GPS' : '🗺️ Default'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Location Info */}
                <Text style={styles.locationInfo}>
                    {usingGPS
                        ? `Using your location (${filters.latitude.toFixed(4)}, ${filters.longitude.toFixed(4)})`
                        : 'Using Mumbai, India (Test Location)'}
                </Text>

                {/* Radius Control - Always Visible */}
                <View style={styles.radiusControl}>
                    <Text style={styles.radiusLabel}>Search Radius: {filters.radius} km</Text>
                    <View style={styles.radiusSliderContainer}>
                        <Text style={styles.radiusValue}>1km</Text>
                        <View style={styles.sliderTrack}>
                            <View style={[styles.sliderFill, { width: `${(filters.radius / 50) * 100}%` }]} />
                            <TouchableOpacity
                                style={[styles.sliderThumb, { left: `${(filters.radius / 50) * 100}%` }]}
                                onPressIn={() => { }}
                            />
                        </View>
                        <Text style={styles.radiusValue}>50km</Text>
                    </View>
                    {/* Radius Quick Select Buttons */}
                    <View style={styles.radiusButtons}>
                        {[5, 10, 20, 50].map((radius) => (
                            <TouchableOpacity
                                key={radius}
                                style={[
                                    styles.radiusQuickButton,
                                    filters.radius === radius && styles.radiusQuickButtonActive,
                                ]}
                                onPress={() => dispatch(setRadius(radius))}
                                activeOpacity={0.8}
                            >
                                <Text
                                    style={[
                                        styles.radiusQuickButtonText,
                                        filters.radius === radius && styles.radiusQuickButtonTextActive,
                                    ]}
                                >
                                    {radius}km
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={styles.searchButton}
                        onPress={handleSearch}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.searchButtonText}>🔍 Search Gyms</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.filterButton}
                        onPress={() => setShowAdvancedFilters(true)}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.filterButtonText}>
                            ⚙️ Filters {filters.amenities.length > 0 && `(${filters.amenities.length})`}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Active Filters Display */}
            {(filters.amenities.length > 0 || filters.minPrice || filters.maxPrice) && (
                <View style={styles.activeFilters}>
                    <Text style={styles.activeFiltersText}>
                        Active: {filters.amenities.join(', ')}
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
                        refreshing={loading}
                        onRefresh={handleRefresh}
                        colors={[colors.accentPrimary]}
                        tintColor={colors.accentPrimary}
                    />
                }
                ListEmptyComponent={
                    !loading ? (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No gyms found nearby</Text>
                            <Text style={styles.emptySubtext}>Try adjusting your radius or filters</Text>
                        </View>
                    ) : null
                }
            />

            {/* Advanced Filters Modal */}
            <Modal
                visible={showAdvancedFilters}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowAdvancedFilters(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Text style={styles.modalTitle}>Advanced Filters</Text>

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
                                    onPress={handleClearFilters}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.resetButtonText}>Clear All</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.applyButton}
                                    onPress={applyAdvancedFilters}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.applyButtonText}>Apply</Text>
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={() => setShowAdvancedFilters(false)}
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
        padding: 20,
        paddingTop: 60,
        backgroundColor: colors.bgPrimary,
        ...shadows.medium,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    locationButton: {
        backgroundColor: colors.accentPrimary,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        ...shadows.small,
    },
    locationButtonText: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: '600',
    },
    locationInfo: {
        fontSize: 12,
        color: colors.textSecondary,
        marginBottom: 16,
    },
    radiusControl: {
        marginBottom: 16,
    },
    radiusLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: 12,
    },
    radiusSliderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    radiusValue: {
        fontSize: 12,
        color: colors.textSecondary,
        width: 40,
    },
    sliderTrack: {
        flex: 1,
        height: 4,
        backgroundColor: colors.bgSecondary,
        borderRadius: 2,
        marginHorizontal: 8,
        position: 'relative',
    },
    sliderFill: {
        height: '100%',
        backgroundColor: colors.accentPrimary,
        borderRadius: 2,
    },
    sliderThumb: {
        position: 'absolute',
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: colors.accentPrimary,
        top: -8,
        marginLeft: -10,
        ...shadows.small,
    },
    radiusButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    radiusQuickButton: {
        flex: 1,
        backgroundColor: colors.bgSecondary,
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: 'center',
    },
    radiusQuickButtonActive: {
        backgroundColor: colors.accentPrimary,
    },
    radiusQuickButtonText: {
        color: colors.textPrimary,
        fontSize: 13,
        fontWeight: '600',
    },
    radiusQuickButtonTextActive: {
        color: '#ffffff',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    searchButton: {
        flex: 2,
        backgroundColor: colors.accentPrimary,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        ...shadows.medium,
    },
    searchButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    filterButton: {
        flex: 1,
        backgroundColor: colors.bgSecondary,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    filterButtonText: {
        color: colors.textPrimary,
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
        maxHeight: '70%',
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
