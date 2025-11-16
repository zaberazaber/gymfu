import React, { useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { getAllGyms } from '../store/gymSlice';
import { colors, shadows } from '../styles/neumorphic';

export default function PartnerDashboardScreen() {
    const navigation = useNavigation();
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);
    const { gyms, loading, error } = useAppSelector((state) => state.gym);

    useEffect(() => {
        // Check if user is a partner
        if (user && !user.isPartner) {
            Alert.alert(
                'Access Denied',
                'Only gym partners can access this page.',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
            return;
        }

        // Fetch all gyms
        dispatch(getAllGyms());
    }, [user, dispatch, navigation]);

    // Filter gyms owned by current user
    const myGyms = user ? gyms.filter((gym) => gym.ownerId === user.id) : [];

    // Calculate stats
    const totalGyms = myGyms.length;
    const verifiedGyms = myGyms.filter((g) => g.isVerified).length;
    const avgRating =
        totalGyms > 0
            ? (myGyms.reduce((sum, g) => sum + Number(g.rating), 0) / totalGyms).toFixed(1)
            : '0.0';
    const avgPrice =
        totalGyms > 0
            ? Math.round(myGyms.reduce((sum, g) => sum + Number(g.basePrice), 0) / totalGyms)
            : 0;

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.accentPrimary} />
                <Text style={styles.loadingText}>Loading your gyms...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>🏋️ Partner Dashboard</Text>
                    <Text style={styles.subtitle}>Manage your gym listings</Text>
                </View>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => {
                        Alert.alert(
                            'Add Gym',
                            'Gym creation is available on the web version. Please visit the web app to add new gyms.',
                            [{ text: 'OK' }]
                        );
                    }}
                >
                    <Text style={styles.addButtonText}>+ Add Gym</Text>
                </TouchableOpacity>
            </View>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                    <Text style={styles.statIcon}>🏢</Text>
                    <Text style={styles.statValue}>{totalGyms}</Text>
                    <Text style={styles.statLabel}>Total Gyms</Text>
                </View>

                <View style={styles.statCard}>
                    <Text style={styles.statIcon}>✓</Text>
                    <Text style={styles.statValue}>{verifiedGyms}</Text>
                    <Text style={styles.statLabel}>Verified</Text>
                </View>

                <View style={styles.statCard}>
                    <Text style={styles.statIcon}>⭐</Text>
                    <Text style={styles.statValue}>{avgRating}</Text>
                    <Text style={styles.statLabel}>Avg Rating</Text>
                </View>

                <View style={styles.statCard}>
                    <Text style={styles.statIcon}>💰</Text>
                    <Text style={styles.statValue}>₹{avgPrice}</Text>
                    <Text style={styles.statLabel}>Avg Price</Text>
                </View>
            </View>

            {/* Error Message */}
            {error && (
                <View style={styles.errorBanner}>
                    <Text style={styles.errorText}>❌ {error}</Text>
                </View>
            )}

            {/* Gyms Section */}
            <View style={styles.gymsSection}>
                <Text style={styles.sectionTitle}>Your Gyms</Text>

                {myGyms.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyIcon}>🏋️</Text>
                        <Text style={styles.emptyTitle}>No gyms yet</Text>
                        <Text style={styles.emptyText}>
                            Start by adding your first gym to the platform
                        </Text>
                        <TouchableOpacity
                            style={styles.emptyButton}
                            onPress={() => {
                                Alert.alert(
                                    'Add Gym',
                                    'Gym creation is available on the web version. Please visit the web app to add new gyms.',
                                    [{ text: 'OK' }]
                                );
                            }}
                        >
                            <Text style={styles.emptyButtonText}>Add Your First Gym</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.gymsList}>
                        {myGyms.map((gym) => (
                            <View key={gym.id} style={styles.gymCard}>
                                {/* Card Header */}
                                <View style={styles.gymCardHeader}>
                                    <Text style={styles.gymCardTitle} numberOfLines={1}>
                                        {gym.name}
                                    </Text>
                                    {gym.isVerified ? (
                                        <View style={styles.verifiedBadge}>
                                            <Text style={styles.badgeText}>✓ Verified</Text>
                                        </View>
                                    ) : (
                                        <View style={styles.pendingBadge}>
                                            <Text style={styles.badgeText}>⏳ Pending</Text>
                                        </View>
                                    )}
                                </View>

                                {/* Card Body */}
                                <View style={styles.gymCardBody}>
                                    <View style={styles.infoRow}>
                                        <Text style={styles.infoLabel}>📍 Location:</Text>
                                        <Text style={styles.infoValue}>{gym.city}</Text>
                                    </View>

                                    <View style={styles.infoRow}>
                                        <Text style={styles.infoLabel}>💰 Price:</Text>
                                        <Text style={styles.infoValue}>₹{gym.basePrice}/session</Text>
                                    </View>

                                    <View style={styles.infoRow}>
                                        <Text style={styles.infoLabel}>⭐ Rating:</Text>
                                        <Text style={styles.infoValue}>{Number(gym.rating).toFixed(1)}</Text>
                                    </View>

                                    <View style={styles.infoRow}>
                                        <Text style={styles.infoLabel}>👥 Capacity:</Text>
                                        <Text style={styles.infoValue}>{gym.capacity} people</Text>
                                    </View>

                                    {/* Amenities */}
                                    <View style={styles.amenitiesPreview}>
                                        {gym.amenities.slice(0, 3).map((amenity, idx) => (
                                            <View key={idx} style={styles.amenityBadge}>
                                                <Text style={styles.amenityText}>{amenity}</Text>
                                            </View>
                                        ))}
                                        {gym.amenities.length > 3 && (
                                            <View style={styles.amenityBadge}>
                                                <Text style={styles.amenityText}>
                                                    +{gym.amenities.length - 3}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                </View>

                                {/* Card Footer */}
                                <View style={styles.gymCardFooter}>
                                    <TouchableOpacity
                                        style={styles.viewButton}
                                        onPress={() => {
                                            (navigation as any).navigate('GymDetail', { gymId: gym.id });
                                        }}
                                    >
                                        <Text style={styles.viewButtonText}>View</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.editButton}
                                        onPress={() => {
                                            Alert.alert(
                                                'Edit Gym',
                                                'Gym editing is available on the web version. Please visit the web app to edit gym details.',
                                                [{ text: 'OK' }]
                                            );
                                        }}
                                    >
                                        <Text style={styles.editButtonText}>Edit</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
                    </View>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bgPrimary,
    },
    contentContainer: {
        padding: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.bgPrimary,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: colors.textSecondary,
    },
    header: {
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
        color: colors.textSecondary,
    },
    addButton: {
        backgroundColor: colors.accentPrimary,
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 20,
        marginTop: 12,
        alignItems: 'center',
        ...shadows.medium,
    },
    addButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 24,
    },
    statCard: {
        backgroundColor: colors.bgPrimary,
        borderRadius: 16,
        padding: 16,
        width: '48%',
        alignItems: 'center',
        ...shadows.medium,
    },
    statIcon: {
        fontSize: 32,
        marginBottom: 8,
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    errorBanner: {
        backgroundColor: '#fee',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
    },
    errorText: {
        color: colors.error,
        fontSize: 14,
    },
    gymsSection: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: 16,
    },
    emptyState: {
        backgroundColor: colors.bgPrimary,
        borderRadius: 20,
        padding: 40,
        alignItems: 'center',
        ...shadows.large,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: 24,
    },
    emptyButton: {
        backgroundColor: colors.accentPrimary,
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 24,
        ...shadows.medium,
    },
    emptyButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    gymsList: {
        gap: 16,
    },
    gymCard: {
        backgroundColor: colors.bgPrimary,
        borderRadius: 20,
        padding: 16,
        ...shadows.large,
    },
    gymCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    gymCardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.textPrimary,
        flex: 1,
        marginRight: 8,
    },
    verifiedBadge: {
        backgroundColor: '#d4edda',
        borderRadius: 8,
        paddingVertical: 4,
        paddingHorizontal: 8,
    },
    pendingBadge: {
        backgroundColor: '#fff3cd',
        borderRadius: 8,
        paddingVertical: 4,
        paddingHorizontal: 8,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    gymCardBody: {
        marginBottom: 16,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    infoLabel: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    amenitiesPreview: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 8,
    },
    amenityBadge: {
        backgroundColor: colors.accentSecondary,
        borderRadius: 8,
        paddingVertical: 4,
        paddingHorizontal: 8,
    },
    amenityText: {
        fontSize: 12,
        color: '#ffffff',
        fontWeight: '500',
    },
    gymCardFooter: {
        flexDirection: 'row',
        gap: 12,
    },
    viewButton: {
        flex: 1,
        backgroundColor: colors.bgPrimary,
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: 'center',
        ...shadows.small,
    },
    viewButtonText: {
        color: colors.textPrimary,
        fontSize: 14,
        fontWeight: '600',
    },
    editButton: {
        flex: 1,
        backgroundColor: colors.accentPrimary,
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: 'center',
        ...shadows.small,
    },
    editButtonText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '600',
    },
});
