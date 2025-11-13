import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  searchNearbyGyms,
  setLocation,
  setRadius,
  setAmenities,
  setPriceRange,
  clearFilters,
} from '../store/gymSlice';
import './GymsPage.css';

const AMENITIES = [
  'cardio',
  'weights',
  'shower',
  'parking',
  'locker',
  'trainer',
  'pool',
  'sauna',
  'yoga',
  'crossfit',
];

export default function GymsPage() {
  const dispatch = useAppDispatch();
  const { gyms, loading, error, filters, pagination } = useAppSelector((state) => state.gym);

  const [locationInput, setLocationInput] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    dispatch(searchNearbyGyms());
  }, [dispatch]);

  const handleSearch = () => {
    dispatch(searchNearbyGyms());
  };

  const handleLocationSearch = () => {
    // In a real app, you'd use a geocoding API here
    // For now, we'll use some preset locations
    const locations: Record<string, { lat: number; lng: number }> = {
      mumbai: { lat: 19.076, lng: 72.8777 },
      delhi: { lat: 28.6139, lng: 77.209 },
      bangalore: { lat: 12.9716, lng: 77.5946 },
      pune: { lat: 18.5204, lng: 73.8567 },
    };

    const location = locations[locationInput.toLowerCase()];
    if (location) {
      dispatch(setLocation({ latitude: location.lat, longitude: location.lng }));
      dispatch(searchNearbyGyms());
    }
  };

  const handleAmenityToggle = (amenity: string) => {
    const newAmenities = filters.amenities.includes(amenity)
      ? filters.amenities.filter((a) => a !== amenity)
      : [...filters.amenities, amenity];
    dispatch(setAmenities(newAmenities));
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
    dispatch(searchNearbyGyms());
  };

  const handleApplyFilters = () => {
    dispatch(searchNearbyGyms());
    setShowFilters(false);
  };

  return (
    <div className="gyms-container">
      {/* Header */}
      <div className="gyms-header">
        <h1 className="gyms-title">🏋️ Discover Gyms</h1>
        <p className="gyms-subtitle">Find the perfect gym near you</p>
      </div>

      {/* Search Bar */}
      <div className="search-section">
        <div className="search-card">
          <div className="search-row">
            <input
              type="text"
              className="search-input"
              placeholder="Enter city (Mumbai, Delhi, Bangalore, Pune)"
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLocationSearch()}
            />
            <button className="search-btn" onClick={handleLocationSearch}>
              📍 Search Location
            </button>
          </div>

          <div className="search-row">
            <div className="radius-control">
              <label>Radius: {filters.radius}km</label>
              <input
                type="range"
                min="1"
                max="50"
                value={filters.radius}
                onChange={(e) => dispatch(setRadius(Number(e.target.value)))}
                className="radius-slider"
              />
            </div>
            <button className="filter-btn" onClick={() => setShowFilters(!showFilters)}>
              🔍 Filters {filters.amenities.length > 0 && `(${filters.amenities.length})`}
            </button>
            <button className="search-btn-primary" onClick={handleSearch}>
              Search Gyms
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="filters-card">
            <h3>Filters</h3>

            {/* Amenities */}
            <div className="filter-section">
              <label className="filter-label">Amenities</label>
              <div className="amenities-grid">
                {AMENITIES.map((amenity) => (
                  <button
                    key={amenity}
                    className={`amenity-btn ${
                      filters.amenities.includes(amenity) ? 'active' : ''
                    }`}
                    onClick={() => handleAmenityToggle(amenity)}
                  >
                    {amenity}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="filter-section">
              <label className="filter-label">Price Range (₹)</label>
              <div className="price-inputs">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice || ''}
                  onChange={(e) =>
                    dispatch(
                      setPriceRange({
                        min: e.target.value ? Number(e.target.value) : null,
                        max: filters.maxPrice,
                      })
                    )
                  }
                  className="price-input"
                />
                <span>to</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice || ''}
                  onChange={(e) =>
                    dispatch(
                      setPriceRange({
                        min: filters.minPrice,
                        max: e.target.value ? Number(e.target.value) : null,
                      })
                    )
                  }
                  className="price-input"
                />
              </div>
            </div>

            {/* Filter Actions */}
            <div className="filter-actions">
              <button className="clear-btn" onClick={handleClearFilters}>
                Clear All
              </button>
              <button className="apply-btn" onClick={handleApplyFilters}>
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <p>❌ {error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Searching for gyms...</p>
        </div>
      )}

      {/* Gyms Grid */}
      {!loading && gyms.length > 0 && (
        <>
          <div className="results-header">
            <p>
              Found {pagination.total} gyms within {filters.radius}km
            </p>
          </div>

          <div className="gyms-grid">
            {gyms.map((gym) => (
              <div key={gym.id} className="gym-card">
                <div className="gym-header">
                  <h3 className="gym-name">{gym.name}</h3>
                  <div className="gym-rating">⭐ {gym.rating.toFixed(1)}</div>
                </div>

                <div className="gym-details">
                  <p className="gym-address">📍 {gym.address}</p>
                  <p className="gym-city">
                    {gym.city}, {gym.pincode}
                  </p>
                  {gym.distance && (
                    <p className="gym-distance">🚶 {gym.distance.toFixed(1)}km away</p>
                  )}
                </div>

                <div className="gym-amenities">
                  {gym.amenities.slice(0, 4).map((amenity) => (
                    <span key={amenity} className="amenity-tag">
                      {amenity}
                    </span>
                  ))}
                  {gym.amenities.length > 4 && (
                    <span className="amenity-tag">+{gym.amenities.length - 4}</span>
                  )}
                </div>

                <div className="gym-footer">
                  <div className="gym-price">
                    <span className="price-label">From</span>
                    <span className="price-value">₹{gym.basePrice}</span>
                    <span className="price-period">/session</span>
                  </div>
                  <button className="book-btn">Book Now</button>
                </div>

                {!gym.isVerified && (
                  <div className="unverified-badge">Pending Verification</div>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.hasMore && (
            <div className="pagination">
              <button className="load-more-btn" onClick={handleSearch}>
                Load More
              </button>
            </div>
          )}
        </>
      )}

      {/* No Results */}
      {!loading && gyms.length === 0 && (
        <div className="no-results">
          <p className="no-results-icon">🏋️</p>
          <h3>No gyms found</h3>
          <p>Try adjusting your search radius or filters</p>
        </div>
      )}
    </div>
  );
}
