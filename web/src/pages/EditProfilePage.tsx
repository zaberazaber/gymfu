import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { getProfile, updateProfile, clearError } from '../store/authSlice';
import './EditProfilePage.css';

const FITNESS_GOALS = [
  { value: 'weight_loss', label: 'Weight Loss' },
  { value: 'muscle_gain', label: 'Muscle Gain' },
  { value: 'general_fitness', label: 'General Fitness' },
  { value: 'strength', label: 'Strength' },
  { value: 'endurance', label: 'Endurance' },
  { value: 'flexibility', label: 'Flexibility' },
  { value: 'sports_training', label: 'Sports Training' },
];

const GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

export default function EditProfilePage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, loading, error } = useAppSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    city: '',
    state: '',
    country: '',
    pincode: '',
    fitnessGoals: [] as string[],
  });

  useEffect(() => {
    if (!user) {
      dispatch(getProfile());
    } else {
      setFormData({
        name: user.name || '',
        age: user.age?.toString() || '',
        gender: user.gender || '',
        city: user.location?.city || '',
        state: user.location?.state || '',
        country: user.location?.country || '',
        pincode: user.location?.pincode || '',
        fitnessGoals: user.fitnessGoals || [],
      });
    }
  }, [user, dispatch]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    dispatch(clearError());

    const profileData = {
      name: formData.name,
      age: formData.age ? parseInt(formData.age) : undefined,
      gender: formData.gender || undefined,
      location: {
        city: formData.city || undefined,
        state: formData.state || undefined,
        country: formData.country || undefined,
        pincode: formData.pincode || undefined,
      },
      fitnessGoals: formData.fitnessGoals.length > 0 ? formData.fitnessGoals : undefined,
    };

    const result = await dispatch(updateProfile(profileData));
    
    if (updateProfile.fulfilled.match(result)) {
      navigate('/profile');
    }
  };

  const toggleGoal = (goal: string) => {
    setFormData({
      ...formData,
      fitnessGoals: formData.fitnessGoals.includes(goal)
        ? formData.fitnessGoals.filter((g) => g !== goal)
        : [...formData.fitnessGoals, goal],
    });
  };

  return (
    <div className="edit-profile-container">
      <div className="edit-profile-card">
        <h1>Edit Profile</h1>
        <p className="subtitle">Update your personal information</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              disabled={loading}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="age">Age</label>
              <input
                type="number"
                id="age"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                min="13"
                max="120"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="gender">Gender</label>
              <select
                id="gender"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                disabled={loading}
              >
                <option value="">Select gender</option>
                {GENDERS.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="section-title">Location</div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="city">City</label>
              <input
                type="text"
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="state">State</label>
              <input
                type="text"
                id="state"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="country">Country</label>
              <input
                type="text"
                id="country"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="pincode">Pincode</label>
              <input
                type="text"
                id="pincode"
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                maxLength={6}
                disabled={loading}
              />
            </div>
          </div>

          <div className="section-title">Fitness Goals</div>
          <div className="goals-grid">
            {FITNESS_GOALS.map((goal) => (
              <label key={goal.value} className="goal-checkbox">
                <input
                  type="checkbox"
                  checked={formData.fitnessGoals.includes(goal.value)}
                  onChange={() => toggleGoal(goal.value)}
                  disabled={loading}
                />
                <span>{goal.label}</span>
              </label>
            ))}
          </div>

          <div className="button-group">
            <button
              type="button"
              className="cancel-button"
              onClick={() => navigate('/profile')}
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" className="save-button" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
