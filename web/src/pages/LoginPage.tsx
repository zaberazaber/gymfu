import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { login, loginWithPassword, clearError } from '../store/authSlice';
import './LoginPage.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);

  const [usePhone, setUsePhone] = useState(true);
  const [usePassword, setUsePassword] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // Check if email contains @varzio for admin mode
  const isAdminMode = email.includes('@varzio');

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (usePhone) {
      if (!phoneNumber) {
        errors.phoneNumber = 'Phone number is required';
      } else if (!/^[6-9]\d{9}$/.test(phoneNumber)) {
        errors.phoneNumber = 'Invalid Indian phone number';
      }
    } else {
      if (!email) {
        errors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.email = 'Invalid email address';
      }
      
      if (usePassword && !password) {
        errors.password = 'Password is required';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());

    if (!validateForm()) {
      return;
    }

    // Admin mode: always use password login
    if (isAdminMode) {
      const result = await dispatch(loginWithPassword({ email, password: password || 'admin123' }));
      if (loginWithPassword.fulfilled.match(result)) {
        navigate('/');
      }
      return;
    }

    if (!usePhone && usePassword) {
      // Login with password
      const result = await dispatch(loginWithPassword({ email, password }));
      if (loginWithPassword.fulfilled.match(result)) {
        navigate('/');
      }
    } else {
      // Login with OTP
      const data = usePhone ? { phoneNumber } : { email };
      const result = await dispatch(login(data));
      
      if (login.fulfilled.match(result)) {
        navigate('/verify-otp');
      }
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <h1 className="login-title">Welcome Back</h1>
          <p className="login-subtitle">Login to your GYMFU account</p>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleLogin}>
            {/* Toggle between Phone and Email */}
            <div className="toggle-container">
              <button
                type="button"
                className={`toggle-button ${usePhone ? 'active' : ''}`}
                onClick={() => setUsePhone(true)}
                disabled={loading}
              >
                Phone Number
              </button>
              <button
                type="button"
                className={`toggle-button ${!usePhone ? 'active' : ''}`}
                onClick={() => setUsePhone(false)}
                disabled={loading}
              >
                Email
              </button>
            </div>

            {/* Phone or Email Input */}
            {usePhone ? (
              <div className="form-group">
                <label htmlFor="phoneNumber" className="form-label">
                  Phone Number
                </label>
                <input
                  id="phoneNumber"
                  type="tel"
                  className={`form-input ${validationErrors.phoneNumber ? 'error' : ''}`}
                  placeholder="9876543210"
                  value={phoneNumber}
                  onChange={(e) => {
                    setPhoneNumber(e.target.value);
                    if (validationErrors.phoneNumber) {
                      setValidationErrors({ ...validationErrors, phoneNumber: '' });
                    }
                  }}
                  maxLength={10}
                  disabled={loading}
                />
                {validationErrors.phoneNumber && (
                  <span className="field-error">{validationErrors.phoneNumber}</span>
                )}
              </div>
            ) : (
              <>
                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    className={`form-input ${validationErrors.email ? 'error' : ''}`}
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (validationErrors.email) {
                        setValidationErrors({ ...validationErrors, email: '' });
                      }
                    }}
                    disabled={loading}
                  />
                  {validationErrors.email && (
                    <span className="field-error">{validationErrors.email}</span>
                  )}
                </div>

                {/* Admin Mode Indicator */}
                {isAdminMode && (
                  <div className="admin-mode-badge">
                    🔐 Admin Mode - Quick Login Enabled
                  </div>
                )}

                {/* Login Method Toggle for Email (hidden in admin mode) */}
                {!isAdminMode && (
                  <div className="login-method-toggle">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={usePassword}
                        onChange={(e) => setUsePassword(e.target.checked)}
                        disabled={loading}
                      />
                      <span>Login with password instead of OTP</span>
                    </label>
                  </div>
                )}

                {/* Password Input (only if usePassword is true or admin mode) */}
                {(usePassword || isAdminMode) && (
                  <div className="form-group">
                    <label htmlFor="password" className="form-label">
                      Password {isAdminMode && <span className="optional-text">(optional)</span>}
                    </label>
                    <input
                      id="password"
                      type="password"
                      className={`form-input ${validationErrors.password ? 'error' : ''}`}
                      placeholder={isAdminMode ? "Any password or leave empty" : "Enter your password"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (validationErrors.password) {
                          setValidationErrors({ ...validationErrors, password: '' });
                        }
                      }}
                      disabled={loading}
                    />
                    {validationErrors.password && (
                      <span className="field-error">{validationErrors.password}</span>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className={`submit-button ${isAdminMode ? 'admin-button' : ''}`}
              disabled={loading}
            >
              {loading 
                ? (isAdminMode ? 'Logging in...' : usePassword ? 'Logging in...' : 'Sending OTP...') 
                : (isAdminMode ? '🚀 Admin Login' : usePassword ? 'Login' : 'Send OTP')}
            </button>
          </form>

          {/* Register Link */}
          <div className="register-link">
            <span>Don't have an account? </span>
            <button
              type="button"
              className="link-button"
              onClick={() => navigate('/register')}
              disabled={loading}
            >
              Register
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
