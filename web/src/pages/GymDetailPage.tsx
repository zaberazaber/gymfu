import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { getGymById } from '../store/gymSlice';
import './GymDetailPage.css';

export default function GymDetailPage() {
  const { gymId } = useParams<{ gymId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { selectedGym, loading, error } = useAppSelector((state) => state.gym);

  useEffect(() => {
    if (gymId) {
      dispatch(getGymById(Number(gymId)));
    }
  }, [gymId, dispatch]);

  if (loading) {
    return (
      <div className="gym-detail-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading gym details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="gym-detail-container">
        <div className="error-container">
          <p className="error-text">{error}</p>
          <button
            className="retry-btn"
            onClick={() => gymId && dispatch(getGymById(Number(gymId)))}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!selectedGym) {
    return (
      <div className="gym-detail-container">
        <div className="error-container">
          <p className="error-text">Gym not found</p>
          <button className="back-btn" onClick={() => navigate('/gyms')}>
            Back to Gyms
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="gym-detail-container">
      {/* Header */}
      <div className="gym-detail-header">
        <button className="back-button" onClick={() => navigate('/gyms')}>
          ← Back to Gyms
        </button>
      </div>

      {/* Main Content */}
      <div className="gym-detail-content">
        {/* Hero Section */}
        <div className="gym-hero">
          <div className="gym-hero-content">
            <h1 className="gym-name">{selectedGym.name}</h1>
            <div className="gym-rating">
              <span className="rating-badge">⭐ {Number(selectedGym.rating).toFixed(1)}</span>
              {selectedGym.isVerified && (
                <span className="verified-badge">✓ Verified</span>
              )}
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="details-grid">
          {/* Location Section */}
          <div className="detail-card">
            <h2 className="card-title">📍 Location</h2>
            <p className="address">{selectedGym.address}</p>
            <p className="city">{selectedGym.city}, {selectedGym.pincode}</p>
            {selectedGym.distance && (
              <p className="distance">{selectedGym.distance.toFixed(1)} km away</p>
            )}
          </div>

          {/* Amenities Section */}
          <div className="detail-card">
            <h2 className="card-title">✨ Amenities</h2>
            <div className="amenities-grid">
              {selectedGym.amenities.map((amenity, index) => (
                <div key={index} className="amenity-tag">
                  {amenity}
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Section */}
          <div className="detail-card">
            <h2 className="card-title">💰 Pricing</h2>
            <div className="price-display">
              <span className="price-amount">₹{selectedGym.basePrice}</span>
              <span className="price-unit">per session</span>
            </div>
          </div>

          {/* Operating Hours Section */}
          {selectedGym.operatingHours && (
            <div className="detail-card">
              <h2 className="card-title">🕐 Operating Hours</h2>
              <div className="hours-list">
                {Object.entries(selectedGym.operatingHours).map(([day, hours]: [string, any]) => (
                  <div key={day} className="hours-row">
                    <span className="day-name">{day}</span>
                    <span className="hours-time">
                      {hours.open} - {hours.close}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Capacity Section */}
          <div className="detail-card">
            <h2 className="card-title">👥 Capacity</h2>
            <p className="capacity-text">{selectedGym.capacity} people</p>
          </div>

          {/* Additional Info */}
          <div className="detail-card">
            <h2 className="card-title">ℹ️ Additional Information</h2>
            <div className="info-list">
              <div className="info-item">
                <span className="info-label">Owner ID:</span>
                <span className="info-value">{selectedGym.ownerId}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Joined:</span>
                <span className="info-value">
                  {new Date(selectedGym.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Book Button */}
        <div className="booking-section">
          <button
            className="book-button"
            onClick={() => navigate(`/gyms/${selectedGym.id}/book`)}
          >
            Book Now - ₹{selectedGym.basePrice}
          </button>
        </div>
      </div>
    </div>
  );
}
