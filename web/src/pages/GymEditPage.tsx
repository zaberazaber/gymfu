import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { getGymById, createGym, updateGym } from '../store/gymSlice';
import './GymEditPage.css';

const AMENITIES_OPTIONS = [
  'Cardio',
  'Weights',
  'Shower',
  'Parking',
  'Locker',
  'AC',
  'Yoga',
  'Zumba',
  'CrossFit',
  'Swimming Pool',
  'Sauna',
  'Steam Room',
];

export default function GymEditPage() {
  const params = useParams<{ gymId?: string }>();
  const gymId = params.gymId || 'new'; // Default to 'new' if no gymId in params
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { selectedGym, loading } = useAppSelector((state) => state.gym);
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

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
  const [uploadingImages, setUploadingImages] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (gymId && gymId !== 'new') {
      dispatch(getGymById(Number(gymId)));
    }
  }, [gymId, isAuthenticated, navigate, dispatch]);

  useEffect(() => {
    if (selectedGym && gymId !== 'new') {
      // Check if user owns this gym
      if (user && selectedGym.ownerId !== user.id) {
        alert('You do not have permission to edit this gym');
        navigate('/partner/dashboard');
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
  }, [selectedGym, gymId, user, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAmenityToggle = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      setImageUrls(prev => [...prev, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleUploadImages = async () => {
    if (gymId === 'new' || imageUrls.length === 0) {
      return;
    }

    setUploadingImages(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/v1/gyms/${gymId}/images`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ images: imageUrls }),
      });

      if (!response.ok) {
        throw new Error('Failed to upload images');
      }

      alert('Images uploaded successfully!');
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Failed to upload images. Please try again.');
    } finally {
      setUploadingImages(false);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Gym name is required';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = 'Pincode must be 6 digits';
    }

    if (!formData.latitude) {
      newErrors.latitude = 'Latitude is required';
    } else if (isNaN(Number(formData.latitude)) || Number(formData.latitude) < -90 || Number(formData.latitude) > 90) {
      newErrors.latitude = 'Latitude must be between -90 and 90';
    }

    if (!formData.longitude) {
      newErrors.longitude = 'Longitude is required';
    } else if (isNaN(Number(formData.longitude)) || Number(formData.longitude) < -180 || Number(formData.longitude) > 180) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
        amenities: formData.amenities.map(a => a.toLowerCase()),
      };

      console.log('gymId:', gymId, 'type:', typeof gymId);
      console.log('Is new?', gymId === 'new');
      console.log('gymData:', gymData);

      if (gymId === 'new') {
        // Create new gym
        console.log('Creating new gym...');
        const result = await dispatch(createGym(gymData));
        if (createGym.fulfilled.match(result)) {
          alert('Gym created successfully! Pending verification.');
          navigate('/partner/dashboard');
        } else {
          throw new Error(result.payload as string);
        }
      } else {
        // Update existing gym
        console.log('Updating gym:', gymId);
        const result = await dispatch(updateGym({
          gymId: Number(gymId),
          gymData,
        }));
        if (updateGym.fulfilled.match(result)) {
          alert('Gym updated successfully!');
          navigate('/partner/dashboard');
        } else {
          throw new Error(result.payload as string);
        }
      }
    } catch (error: any) {
      console.error('Error saving gym:', error);
      alert(error.message || 'Failed to save gym. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading && gymId !== 'new') {
    return (
      <div className="gym-edit-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading gym details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="gym-edit-page">
      <div className="edit-container">
        {/* Header */}
        <div className="edit-header">
          <button className="back-btn" onClick={() => navigate('/partner/dashboard')}>
            ← Back to Dashboard
          </button>
          <h1 className="edit-title">
            {gymId === 'new' ? '🏋️ Add New Gym' : '✏️ Edit Gym'}
          </h1>
          <p className="edit-subtitle">
            {gymId === 'new'
              ? 'Fill in the details to list your gym on GYMFU'
              : 'Update your gym information'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="edit-form">
          {/* Basic Information */}
          <div className="form-section">
            <h2 className="section-title">Basic Information</h2>

            <div className="form-group">
              <label className="form-label">Gym Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`form-input ${errors.name ? 'error' : ''}`}
                placeholder="Enter gym name"
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Address *</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                className={`form-textarea ${errors.address ? 'error' : ''}`}
                placeholder="Enter full address"
                rows={3}
              />
              {errors.address && <span className="error-text">{errors.address}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">City *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className={`form-input ${errors.city ? 'error' : ''}`}
                  placeholder="Enter city"
                />
                {errors.city && <span className="error-text">{errors.city}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Pincode *</label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  className={`form-input ${errors.pincode ? 'error' : ''}`}
                  placeholder="6-digit pincode"
                  maxLength={6}
                />
                {errors.pincode && <span className="error-text">{errors.pincode}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Latitude *</label>
                <input
                  type="number"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  className={`form-input ${errors.latitude ? 'error' : ''}`}
                  placeholder="e.g., 19.0760"
                  step="0.000001"
                />
                {errors.latitude && <span className="error-text">{errors.latitude}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Longitude *</label>
                <input
                  type="number"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  className={`form-input ${errors.longitude ? 'error' : ''}`}
                  placeholder="e.g., 72.8777"
                  step="0.000001"
                />
                {errors.longitude && <span className="error-text">{errors.longitude}</span>}
              </div>
            </div>
          </div>

          {/* Pricing & Capacity */}
          <div className="form-section">
            <h2 className="section-title">Pricing & Capacity</h2>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Base Price (₹) *</label>
                <input
                  type="number"
                  name="basePrice"
                  value={formData.basePrice}
                  onChange={handleChange}
                  className={`form-input ${errors.basePrice ? 'error' : ''}`}
                  placeholder="Price per session"
                  min="0"
                />
                {errors.basePrice && <span className="error-text">{errors.basePrice}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Capacity *</label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  className={`form-input ${errors.capacity ? 'error' : ''}`}
                  placeholder="Maximum people"
                  min="0"
                />
                {errors.capacity && <span className="error-text">{errors.capacity}</span>}
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className="form-section">
            <h2 className="section-title">Amenities *</h2>
            <p className="section-description">Select all amenities available at your gym</p>

            <div className="amenities-grid">
              {AMENITIES_OPTIONS.map((amenity) => (
                <button
                  key={amenity}
                  type="button"
                  className={`amenity-btn ${formData.amenities.includes(amenity) ? 'selected' : ''}`}
                  onClick={() => handleAmenityToggle(amenity)}
                >
                  {formData.amenities.includes(amenity) && '✓ '}
                  {amenity}
                </button>
              ))}
            </div>
            {errors.amenities && <span className="error-text">{errors.amenities}</span>}
          </div>

          {/* Gym Images */}
          <div className="form-section">
            <h2 className="section-title">Gym Images</h2>
            <p className="section-description">Add image URLs for your gym (optional)</p>

            <div className="images-container">
              {imageUrls.map((url, index) => (
                <div key={index} className="image-item">
                  <img src={url} alt={`Gym ${index + 1}`} className="image-preview" />
                  <button
                    type="button"
                    className="remove-image-btn"
                    onClick={() => handleRemoveImage(index)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <div className="add-image-row">
              <input
                type="text"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                className="form-input"
                placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
              />
              <button
                type="button"
                className="add-image-btn"
                onClick={handleAddImage}
                disabled={!newImageUrl.trim()}
              >
                Add Image
              </button>
            </div>

            {gymId !== 'new' && imageUrls.length > 0 && (
              <button
                type="button"
                className="upload-images-btn"
                onClick={handleUploadImages}
                disabled={uploadingImages}
              >
                {uploadingImages ? 'Uploading...' : 'Upload Images to Server'}
              </button>
            )}

            <p className="help-text">
              💡 Tip: You can use image hosting services like Imgur or upload to your own server
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="form-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={() => navigate('/partner/dashboard')}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-btn"
              disabled={saving}
            >
              {saving ? 'Saving...' : gymId === 'new' ? 'Create Gym' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
