import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { getAllGyms } from '../store/gymSlice';
import './PartnerDashboardPage.css';

export default function PartnerDashboardPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { gyms, loading, error } = useAppSelector((state) => state.gym);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Check if user is a partner
    if (user && !user.isPartner) {
      alert('Access denied. Only gym partners can access this page.');
      navigate('/');
      return;
    }
    
    // Fetch all gyms (in a real app, this would filter by owner)
    dispatch(getAllGyms());
  }, [isAuthenticated, user, navigate, dispatch]);

  // Filter gyms owned by current user
  const myGyms = user ? gyms.filter(gym => gym.ownerId === user.id) : [];

  if (loading) {
    return (
      <div className="partner-dashboard">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading your gyms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="partner-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">🏋️ Partner Dashboard</h1>
          <p className="dashboard-subtitle">Manage your gym listings</p>
        </div>
        <button 
          className="add-gym-btn"
          onClick={() => navigate('/partner/gym/new')}
        >
          + Add New Gym
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🏢</div>
          <div className="stat-content">
            <h3 className="stat-value">{myGyms.length}</h3>
            <p className="stat-label">Total Gyms</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✓</div>
          <div className="stat-content">
            <h3 className="stat-value">
              {myGyms.filter(g => g.isVerified).length}
            </h3>
            <p className="stat-label">Verified</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <h3 className="stat-value">
              {myGyms.length > 0 
                ? (myGyms.reduce((sum, g) => sum + Number(g.rating), 0) / myGyms.length).toFixed(1)
                : '0.0'}
            </h3>
            <p className="stat-label">Avg Rating</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3 className="stat-value">
              ₹{myGyms.length > 0 
                ? Math.round(myGyms.reduce((sum, g) => sum + Number(g.basePrice), 0) / myGyms.length)
                : 0}
            </h3>
            <p className="stat-label">Avg Price</p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-banner">
          <p>❌ {error}</p>
        </div>
      )}

      {/* Gyms List */}
      <div className="gyms-section">
        <h2 className="section-title">Your Gyms</h2>
        
        {myGyms.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🏋️</div>
            <h3>No gyms yet</h3>
            <p>Start by adding your first gym to the platform</p>
            <button 
              className="add-first-gym-btn"
              onClick={() => navigate('/partner/gym/new')}
            >
              Add Your First Gym
            </button>
          </div>
        ) : (
          <div className="gyms-grid">
            {myGyms.map((gym) => (
              <div key={gym.id} className="gym-card">
                <div className="gym-card-header">
                  <h3 className="gym-card-title">{gym.name}</h3>
                  {gym.isVerified ? (
                    <span className="verified-badge">✓ Verified</span>
                  ) : (
                    <span className="pending-badge">⏳ Pending</span>
                  )}
                </div>

                <div className="gym-card-body">
                  <div className="gym-info-row">
                    <span className="info-label">📍 Location:</span>
                    <span className="info-value">{gym.city}</span>
                  </div>

                  <div className="gym-info-row">
                    <span className="info-label">💰 Price:</span>
                    <span className="info-value">₹{gym.basePrice}/session</span>
                  </div>

                  <div className="gym-info-row">
                    <span className="info-label">⭐ Rating:</span>
                    <span className="info-value">{Number(gym.rating).toFixed(1)}</span>
                  </div>

                  <div className="gym-info-row">
                    <span className="info-label">👥 Capacity:</span>
                    <span className="info-value">{gym.capacity} people</span>
                  </div>

                  <div className="amenities-preview">
                    {gym.amenities.slice(0, 3).map((amenity, idx) => (
                      <span key={idx} className="amenity-badge">{amenity}</span>
                    ))}
                    {gym.amenities.length > 3 && (
                      <span className="amenity-badge">+{gym.amenities.length - 3}</span>
                    )}
                  </div>
                </div>

                <div className="gym-card-footer">
                  <button 
                    className="view-btn"
                    onClick={() => navigate(`/gyms/${gym.id}`)}
                  >
                    View
                  </button>
                  <button 
                    className="edit-btn"
                    onClick={() => navigate(`/partner/gym/edit/${gym.id}`)}
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
