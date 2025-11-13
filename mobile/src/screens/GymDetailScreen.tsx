import React, { useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { getGymById } from '../store/gymSlice';
import { colors, shadows } from '../styles/neumorphic';

export default function GymDetailScreen() {
    const route = useRoute();
    const navigation = useNavigation();
    const dispatch = useAppDispatch();
    const { selectedGym, loading, error } = useAppSelector((state) => state.gym);
    const { gymId } = route.params as { gymId: number };

    useEffect(() => {
        if (gymId) {
            dispatch(getGymById(gymId));
        }
    }, [gymId, dispatch]);

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={colors.accentPrimary} />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity
                    style={styles.retryButton}
                    onPress={() => dispatch(getGymById(gymId))}
                    activeOpacity={0.8}
                >
                    <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (!selectedGym) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>Gym not found</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.gymName}>{selectedGym.name}</Text>
                    <View style={styles.ratingBadge}>
                        <Text style={styles.ratingText}>⭐ {Number(selectedGym.rating).toFixed(1)}</Text>
                    </View>
                </View>

                {/* Location Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>📍 Location</Text>
                    <Text style={styles.address}>{selectedGym.address}</Text>
                    <Text style={styles.city}>
                        {selectedGym.city}, {selectedGym.pincode}
                    </Text>
                </View>

                {/* Amenities */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>✨ Amenities</Text>
                    <View style={styles.amenitiesContainer}>
                        {selectedGym.amenities.map((amenity, index) => (
                            <View key={index} style={styles.amenityTag}>
                                <Text style={styles.amenityText}>{amenity}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Pricing */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>💰 Pricing</Text>
                    <Text style={styles.priceText}>₹{selectedGym.basePrice} per session</Text>
                </View>

                {/* Operating Hours */}
                {selectedGym.operatingHours && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>🕐 Operating Hours</Text>
                        {Object.entries(selectedGym.operatingHours).map(([day, hours]: [string, any]) => (
                            <View key={day} style={styles.hoursRow}>
                                <Text style={styles.dayText}>{day}</Text>
                                <Text style={styles.hoursText}>
                                    {hours.open} - {hours.close}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Capacity */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>👥 Capacity</Text>
                    <Text style={styles.infoText}>{selectedGym.capacity} people</Text>
                </View>
            </ScrollView>

            {/* Book Button */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.bookButton}
                    onPress={() => {
                        // TODO: Navigate to booking screen
                        console.log('Book gym:', selectedGym.id);
                    }}
                    activeOpacity={0.8}
                >
                    <Text style={styles.bookButtonText}>Book Now - ₹{selectedGym.basePrice}</Text>
                </TouchableOpacity>
            </View>
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
        paddingBottom: 100,
    },
    header: {
        marginBottom: 24,
    },
    gymName: {
        fontSize: 32,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: 12,
    },
    ratingBadge: {
        backgroundColor: colors.accentSecondary,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
        alignSelf: 'flex-start',
    },
    ratingText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '600',
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
        marginBottom: 12,
    },
    address: {
        fontSize: 16,
        color: colors.textPrimary,
        marginBottom: 4,
    },
    city: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    amenitiesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    amenityTag: {
        backgroundColor: colors.bgSecondary,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 10,
    },
    amenityText: {
        color: colors.textPrimary,
        fontSize: 14,
        fontWeight: '500',
    },
    priceText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.accentPrimary,
    },
    hoursRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: colors.bgSecondary,
    },
    dayText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textPrimary,
        textTransform: 'capitalize',
    },
    hoursText: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    infoText: {
        fontSize: 16,
        color: colors.textPrimary,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.bgPrimary,
        padding: 20,
        ...shadows.large,
    },
    bookButton: {
        backgroundColor: colors.accentPrimary,
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        ...shadows.medium,
    },
    bookButtonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    errorText: {
        fontSize: 16,
        color: colors.error,
        textAlign: 'center',
        marginBottom: 16,
    },
    retryButton: {
        backgroundColor: colors.accentPrimary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    retryButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
});
