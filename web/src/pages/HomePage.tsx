import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { getCurrentUser, logout } from '../store/authSlice';
import Logo from '../components/Logo';
import './HomePage.css';

function HomePage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, token } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Get current user if token exists but user data is not loaded
    if (token && !user) {
      dispatch(getCurrentUser());
    }
  }, [token, user, dispatch]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="home-container">
      <div className="home-header">
        <Logo size="large" />
        <p className="home-subtitle">Your Ultimate Fitness Companion</p>
      </div>

      {isAuthenticated && user ? (
        <div className="home-card">
          <div className="welcome-section">
            <div className="welcome-avatar">
              {getInitials(user.name)}
            </div>
            <h2 className="welcome-title">Welcome, {user.name}! 👋</h2>
            <p className="welcome-info">
              {user.phoneNumber || user.email}
            </p>
            <div className="button-group">
              <button
                onClick={() => navigate('/gyms')}
                className="neu-btn neu-btn-primary"
              >
                Find Gyms
              </button>
              <button
                onClick={() => navigate('/classes')}
                className="neu-btn neu-btn-primary"
              >
                🧘 Fitness Classes
              </button>
              <button
                onClick={() => navigate('/marketplace')}
                className="neu-btn neu-btn-primary"
              >
                🛒 Marketplace
              </button>
              <button
                onClick={() => navigate('/ai-chat')}
                className="neu-btn neu-btn-primary"
              >
                🤖 AI Fitness Coach
              </button>
              <button
                onClick={() => navigate('/bookings')}
                className="neu-btn neu-btn-primary"
              >
                My Bookings
              </button>
              <button
                onClick={() => navigate('/profile')}
                className="neu-btn neu-btn-secondary"
              >
                View Profile
              </button>
              {user.isPartner && (
                <button
                  onClick={() => navigate('/partner/dashboard')}
                  className="neu-btn neu-btn-accent"
                >
                  Partner Dashboard
                </button>
              )}
              <button
                onClick={() => dispatch(logout())}
                className="neu-btn neu-btn-danger"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="home-card">
            <div className="get-started-section">
              <h2 className="section-title">Get Started</h2>
              <p className="section-text">
                Create an account to start booking gym sessions and unlock your fitness potential
              </p>
              <div className="button-group">
                <button
                  onClick={() => navigate('/register')}
                  className="neu-btn neu-btn-primary"
                >
                  Register
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="neu-btn neu-btn-secondary"
                >
                  Login
                </button>
              </div>
            </div>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <span className="feature-icon">🏋️</span>
              <h3 className="feature-title">Find Gyms</h3>
              <p className="feature-description">
                Discover gyms near you with advanced filters
              </p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">📅</span>
              <h3 className="feature-title">Book Sessions</h3>
              <p className="feature-description">
                Easy booking with instant confirmation
              </p>
            </div>
            <div className="feature-card" onClick={() => navigate('/classes')} style={{ cursor: 'pointer' }}>
              <span className="feature-icon">🧘</span>
              <h3 className="feature-title">Fitness Classes</h3>
              <p className="feature-description">
                Join yoga, zumba, and other group classes
              </p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">💪</span>
              <h3 className="feature-title">AI Coach</h3>
              <p className="feature-description">
                Personalized workout and nutrition plans
              </p>
            </div>
            <div className="feature-card" onClick={() => navigate('/marketplace')} style={{ cursor: 'pointer' }}>
              <span className="feature-icon">🛒</span>
              <h3 className="feature-title">Marketplace</h3>
              <p className="feature-description">
                Shop fitness gear and supplements
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default HomePage;
