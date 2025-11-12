import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { getProfile } from '../store/authSlice';
import './ProfilePage.css';

export default function ProfilePage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, loading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getProfile());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="profile-container">
        <div className="profile-card">
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-container">
        <div className="profile-card">
          <p>No profile data available</p>
        </div>
      </div>
    );
  }

  const fitnessGoalLabels: Record<string, string> = {
    weight_loss: 'Weight Loss',
    muscle_gain: 'Muscle Gain',
    general_fitness: 'General Fitness',
    strength: 'Strength',
    endurance: 'Endurance',
    flexibility: 'Flexibility',
    sports_training: 'Sports Training',
  };

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            {user.profileImage ? (
              <img src={user.profileImage} alt={user.name} />
            ) : (
              <div className="avatar-placeholder">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <h1>{user.name}</h1>
          <p className="profile-contact">
            {user.phoneNumber || user.email}
          </p>
        </div>

        <div className="profile-section">
          <h2>Personal Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Age</span>
              <span className="info-value">{user.age || 'Not set'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Gender</span>
              <span className="info-value">
                {user.gender ? user.gender.replace('_', ' ') : 'Not set'}
              </span>
            </div>
          </div>
        </div>

        {user.location && (
          <div className="profile-section">
            <h2>Location</h2>
            <div className="location-info">
              <p>{user.location.city}, {user.location.state}</p>
              <p>{user.location.country} - {user.location.pincode}</p>
            </div>
          </div>
        )}

        {user.fitnessGoals && user.fitnessGoals.length > 0 && (
          <div className="profile-section">
            <h2>Fitness Goals</h2>
            <div className="goals-list">
              {user.fitnessGoals.map((goal) => (
                <span key={goal} className="goal-badge">
                  {fitnessGoalLabels[goal] || goal}
                </span>
              ))}
            </div>
          </div>
        )}

        <button
          className="edit-button"
          onClick={() => navigate('/edit-profile')}
        >
          Edit Profile
        </button>
      </div>
    </div>
  );
}
