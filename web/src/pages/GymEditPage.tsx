import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { getGymById } from '../store/gymSlice';
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
  const { gymId } = useParams<{ gymId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { selectedGym, loading } = useAppSelector((state) => state.gym);
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    pincode: '',
    basePrice: '',
    capacity: '',
    amenities: [] as string[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

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
        basePrice: selectedGym.basePrice.toString(),
        capacity: selectedGym.capacity.toString(),
        amenities: selectedGym.amenities,
      });
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
      // TODO: Implement actual API call to update gym
      console.log('Saving gym:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      alert(gymId === 'new' ? 'Gym created successfully!' : 'Gym updated successfully!');
      navigate('/partner/dashboard');
    } catch (error) {
      console.error('Error saving gym:', error);
      alert('Failed to save gym. Please try again.');
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
