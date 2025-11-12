import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { register, clearError } from '../store/authSlice';
import './RegisterPage.css';

export default function RegisterPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [usePhone, setUsePhone] = useState(true);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const errors: Record<string, string> = {};

    // Name validation
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    // Phone or Email validation
    if (usePhone) {
      if (!formData.phoneNumber) {
        errors.phoneNumber = 'Phone number is required';
      } else if (!/^[6-9]\d{9}$/.test(formData.phoneNumber)) {
        errors.phoneNumber = 'Invalid Indian phone number';
      }
    } else {
      if (!formData.email) {
        errors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.email = 'Invalid email address';
      }
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(formData.password)) {
      errors.password = 'Password must contain at least one uppercase letter';
    } else if (!/[a-z]/.test(formData.password)) {
      errors.password = 'Password must contain at least one lowercase letter';
    } else if (!/[0-9]/.test(formData.password)) {
      errors.password = 'Password must contain at least one number';
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    dispatch(clearError());

    if (!validateForm()) {
      return;
    }

    const data = {
      name: formData.name,
      password: formData.password,
      ...(usePhone ? { phoneNumber: formData.phoneNumber } : { email: formData.email }),
    };

    const result = await dispatch(register(data));

    if (register.fulfilled.match(result)) {
      // Navigate to OTP verification page
      navigate('/verify-otp');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors({ ...validationErrors, [field]: '' });
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h1>Create Account</h1>
        <p className="subtitle">Join GYMFU and start your fitness journey</p>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Name Input */}
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter your full name"
              disabled={loading}
            />
            {validationErrors.name && (
              <span className="field-error">{validationErrors.name}</span>
            )}
          </div>

          {/* Toggle between Phone and Email */}
          <div className="toggle-container">
            <button
              type="button"
              className={`toggle-btn ${usePhone ? 'active' : ''}`}
              onClick={() => setUsePhone(true)}
            >
              Phone Number
            </button>
            <button
              type="button"
              className={`toggle-btn ${!usePhone ? 'active' : ''}`}
              onClick={() => setUsePhone(false)}
            >
              Email
            </button>
          </div>

          {/* Phone or Email Input */}
          {usePhone ? (
            <div className="form-group">
              <label htmlFor="phoneNumber">Phone Number</label>
              <input
                type="tel"
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                placeholder="9876543210"
                disabled={loading}
              />
              {validationErrors.phoneNumber && (
                <span className="field-error">{validationErrors.phoneNumber}</span>
              )}
            </div>
          ) : (
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="you@example.com"
                disabled={loading}
              />
              {validationErrors.email && (
                <span className="field-error">{validationErrors.email}</span>
              )}
            </div>
          )}

          {/* Password Input */}
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              placeholder="Min 8 characters, 1 uppercase, 1 number"
              disabled={loading}
            />
            {validationErrors.password && (
              <span className="field-error">{validationErrors.password}</span>
            )}
          </div>

          {/* Confirm Password Input */}
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              placeholder="Re-enter your password"
              disabled={loading}
            />
            {validationErrors.confirmPassword && (
              <span className="field-error">{validationErrors.confirmPassword}</span>
            )}
          </div>

          {/* Submit Button */}
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="login-link">
          Already have an account?{' '}
          <a href="/login" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>
            Login
          </a>
        </div>
      </div>
    </div>
  );
}
