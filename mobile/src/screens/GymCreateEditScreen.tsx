import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { getGymById, createGym, updateGym } from '../store/gymSlice';
import { colors, shadows } from '../styles/neumorphic';

const AMENITIES_OPTIONS = [
  'cardio',
  'weights',
  'shower',
  'parking',
  'locker',
  'ac',
  'yoga',
  'zumba',
  'crossfit',
  'pool',
  'sauna',
];

export default function GymCreateEditScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { selectedGym, loading } = useAppSelector((state) => state.gym);
  const { user } = useAppSelector((state) => state.auth);

  const gymId = (route.params as any)?.gymId;
  const isEditMode = !!gymId;

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    pincode: '',
    latitude: '',
    longitude: '',
    basePrice: '',
    capacity: '',
    amenities: [] as string[],
  });

  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEditMode && gymId) {
      dispatch(getGymById(Number(gymId)));
    }
  }, [gymId, isEditMode, dispatch]);

  useEffect(() => {
    if (selectedGym && isEditMode) {
      // Check ownership
      if (user && selectedGym.ownerId !== user.id) {
        Alert.alert('Access Denied', 'You do not have permission to edit this gym');
        navigation.goBack();
        return;
      }

      setFormData({
        name: selectedGym.name,
        address: selectedGym.address,
        city: selectedGym.city,
        pincode: selectedGym.pincode,
        latitude: selectedGym.latitude.toString(),
        longitude: selectedGym.longitude.toString(),
        basePrice: selectedGym.basePrice.toString(),
        capacity: selectedGym.capacity.toString(),
        amenities: selectedGym.amenities,
      });
      setImageUrls((selectedGym as any).images || []);
    }
  }, [selectedGym, isEditMode, user, navigation]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const toggleAmenity = (amenity: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      setImageUrls((prev) => [...prev, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Gym name is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = 'Pincode must be 6 digits';
    }

    if (!formData.latitude) {
      newErrors.latitude = 'Latitude is required';
    } else if (
      isNaN(Number(formData.latitude)) ||
      Number(formData.latitude) < -90 ||
      Number(formData.latitude) > 90
    ) {
      newErrors.latitude = 'Latitude must be between -90 and 90';
    }

    if (!formData.longitude) {
      newErrors.longitude = 'Longitude is required';
    } else if (
      isNaN(Number(formData.longitude)) ||
      Number(formData.longitude) < -180 ||
      Number(formData.longitude) > 180
    ) {
      newErrors.longitude = 'Longitude must be between -180 and 180';
    }

    if (!formData.basePrice) {
      newErrors.basePrice = 'Base price is required';
    } else if (Number(formData.basePrice) <= 0) {
      newErrors.basePrice = 'Price must be greater than 0';
    }

    if (!formData.capacity) {
      newErrors.capacity = 'Capacity is required';
    } else if (Number(formData.capacity) <= 0) {
      newErrors.capacity = 'Capacity must be greater than 0';
    }

    if (formData.amenities.length === 0) {
      newErrors.amenities = 'Select at least one amenity';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    setSaving(true);

    try {
      const gymData = {
        name: formData.name,
        address: formData.address,
        city: formData.city,
        pincode: formData.pincode,
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
        basePrice: Number(formData.basePrice),
        capacity: Number(formData.capacity),
        amenities: formData.amenities,
      };

      if (isEditMode) {
        const result = await dispatch(
          updateGym({
            gymId: Number(gymId),
            gymData,
          })
        );
        if (updateGym.fulfilled.match(result)) {
          Alert.alert('Success', 'Gym updated successfully!');
          navigation.goBack();
        } else {
          throw new Error(result.payload as string);
        }
      } else {
        const result = await dispatch(createGym(gymData));
        if (createGym.fulfilled.match(result)) {
          Alert.alert('Success', 'Gym created successfully! Pending verification.');
          navigation.goBack();
        } else {
          throw new Error(result.payload as string);
        }
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save gym. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading && isEditMode) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accentPrimary} />
        <Text style={styles.loadingText}>Loading gym details...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View>
          {/* Header */}
          <View style={styles.header}>
        <Text style={styles.title}>
          {isEditMode ? '✏️ Edit Gym' : '🏋️ Add New Gym'}
        </Text>
        <Text style={styles.subtitle}>
          {isEditMode ? 'Update your gym information' : 'Fill in the details to list your gym'}
        </Text>
      </View>

      {/* Basic Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Basic Information</Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Gym Name *</Text>
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            placeholder="Enter gym name"
            value={formData.name}
            onChangeText={(text) => handleChange('name', text)}
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Address *</Text>
          <TextInput
            style={[styles.textarea, errors.address && styles.inputError]}
            placeholder="Enter full address"
            value={formData.address}
            onChangeText={(text) => handleChange('address', text)}
            multiline
            numberOfLines={3}
          />
          {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
        </View>

        <View style={styles.row}>
          <View style={[styles.formGroup, styles.halfWidth]}>
            <Text style={styles.label}>City *</Text>
            <TextInput
              style={[styles.input, errors.city && styles.inputError]}
              placeholder="City"
              value={formData.city}
              onChangeText={(text) => handleChange('city', text)}
            />
            {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}
          </View>

          <View style={[styles.formGroup, styles.halfWidth]}>
            <Text style={styles.label}>Pincode *</Text>
            <TextInput
              style={[styles.input, errors.pincode && styles.inputError]}
              placeholder="6-digit"
              value={formData.pincode}
              onChangeText={(text) => handleChange('pincode', text)}
              keyboardType="numeric"
              maxLength={6}
            />
            {errors.pincode && <Text style={styles.errorText}>{errors.pincode}</Text>}
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.formGroup, styles.halfWidth]}>
            <Text style={styles.label}>Latitude *</Text>
            <TextInput
              style={[styles.input, errors.latitude && styles.inputError]}
              placeholder="19.0760"
              value={formData.latitude}
              onChangeText={(text) => handleChange('latitude', text)}
              keyboardType="decimal-pad"
            />
            {errors.latitude && <Text style={styles.errorText}>{errors.latitude}</Text>}
          </View>

          <View style={[styles.formGroup, styles.halfWidth]}>
            <Text style={styles.label}>Longitude *</Text>
            <TextInput
              style={[styles.input, errors.longitude && styles.inputError]}
              placeholder="72.8777"
              value={formData.longitude}
              onChangeText={(text) => handleChange('longitude', text)}
              keyboardType="decimal-pad"
            />
            {errors.longitude && <Text style={styles.errorText}>{errors.longitude}</Text>}
          </View>
        </View>
      </View>

      {/* Pricing & Capacity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pricing & Capacity</Text>

        <View style={styles.row}>
          <View style={[styles.formGroup, styles.halfWidth]}>
            <Text style={styles.label}>Base Price (₹) *</Text>
            <TextInput
              style={[styles.input, errors.basePrice && styles.inputError]}
              placeholder="Price per session"
              value={formData.basePrice}
              onChangeText={(text) => handleChange('basePrice', text)}
              keyboardType="numeric"
            />
            {errors.basePrice && <Text style={styles.errorText}>{errors.basePrice}</Text>}
          </View>

          <View style={[styles.formGroup, styles.halfWidth]}>
            <Text style={styles.label}>Capacity *</Text>
            <TextInput
              style={[styles.input, errors.capacity && styles.inputError]}
              placeholder="Max people"
              value={formData.capacity}
              onChangeText={(text) => handleChange('capacity', text)}
              keyboardType="numeric"
            />
            {errors.capacity && <Text style={styles.errorText}>{errors.capacity}</Text>}
          </View>
        </View>
      </View>

      {/* Amenities */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Amenities *</Text>
        <Text style={styles.sectionDescription}>Select all amenities available</Text>

        <View style={styles.amenitiesGrid}>
          {AMENITIES_OPTIONS.map((amenity) => (
            <TouchableOpacity
              key={amenity}
              style={[
                styles.amenityBtn,
                formData.amenities.includes(amenity) && styles.amenityBtnSelected,
              ]}
              onPress={() => toggleAmenity(amenity)}
            >
              <Text
                style={[
                  styles.amenityText,
                  formData.amenities.includes(amenity) && styles.amenityTextSelected,
                ]}
              >
                {formData.amenities.includes(amenity) && '✓ '}
                {amenity.charAt(0).toUpperCase() + amenity.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {errors.amenities && <Text style={styles.errorText}>{errors.amenities}</Text>}
      </View>

      {/* Images */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Gym Images (Optional)</Text>
        <Text style={styles.sectionDescription}>Add image URLs for your gym</Text>

        {imageUrls.length > 0 && (
          <View style={styles.imagesList}>
            {imageUrls.map((url, index) => (
              <View key={index} style={styles.imageItem}>
                <Text style={styles.imageUrl} numberOfLines={1}>
                  {url}
                </Text>
                <TouchableOpacity
                  style={styles.removeImageBtn}
                  onPress={() => handleRemoveImage(index)}
                >
                  <Text style={styles.removeImageText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <View style={styles.addImageRow}>
          <TextInput
            style={[styles.input, styles.imageInput]}
            placeholder="Enter image URL"
            value={newImageUrl}
            onChangeText={setNewImageUrl}
          />
          <TouchableOpacity
            style={[styles.addImageBtn, !newImageUrl.trim() && styles.addImageBtnDisabled]}
            onPress={handleAddImage}
            disabled={!newImageUrl.trim()}
          >
            <Text style={styles.addImageText}>Add</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Submit Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => navigation.goBack()}
          disabled={saving}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.submitBtn, saving && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.submitText}>
              {isEditMode ? 'Save Changes' : 'Create Gym'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
        </View>
      </TouchableWithoutFeedback>
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
    fontSize: 14,
    color: colors.textSecondary,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.bgPrimary,
    borderWidth: 2,
    borderColor: colors.bgSecondary,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: colors.textPrimary,
  },
  textarea: {
    backgroundColor: colors.bgPrimary,
    borderWidth: 2,
    borderColor: colors.bgSecondary,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: colors.textPrimary,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  amenityBtn: {
    backgroundColor: colors.bgSecondary,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  amenityBtnSelected: {
    backgroundColor: colors.accentPrimary,
    borderColor: colors.accentPrimary,
  },
  amenityText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  amenityTextSelected: {
    color: '#ffffff',
  },
  imagesList: {
    marginBottom: 12,
  },
  imageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgSecondary,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  imageUrl: {
    flex: 1,
    fontSize: 13,
    color: colors.textPrimary,
  },
  removeImageBtn: {
    backgroundColor: colors.error,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  removeImageText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  addImageRow: {
    flexDirection: 'row',
    gap: 10,
  },
  imageInput: {
    flex: 1,
  },
  addImageBtn: {
    backgroundColor: colors.accentPrimary,
    borderRadius: 12,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageBtnDisabled: {
    opacity: 0.5,
  },
  addImageText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    marginBottom: 40,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: colors.bgSecondary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    ...shadows.medium,
  },
  cancelText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  submitBtn: {
    flex: 1,
    backgroundColor: colors.accentPrimary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    ...shadows.medium,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
