import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { login, loginWithPassword, clearError } from '../store/authSlice';

export default function LoginScreen() {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);

  const [usePhone, setUsePhone] = useState(true);
  const [usePassword, setUsePassword] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

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

  const handleLogin = async () => {
    dispatch(clearError());

    if (!validateForm()) {
      return;
    }

    if (!usePhone && usePassword) {
      // Login with password
      const result = await dispatch(loginWithPassword({ email, password }));
      if (loginWithPassword.fulfilled.match(result)) {
        navigation.navigate('Home' as never);
      }
    } else {
      // Login with OTP
      const data = usePhone ? { phoneNumber } : { email };
      const result = await dispatch(login(data));

      if (login.fulfilled.match(result)) {
        navigation.navigate('OTPVerification' as never);
      }
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Welcome Back</Text>
      <Text style={styles.subtitle}>Login to your GYMFU account</Text>

      {error && <Text style={styles.error}>{error}</Text>}

      {/* Toggle between Phone and Email */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, usePhone && styles.toggleButtonActive]}
          onPress={() => setUsePhone(true)}
          disabled={loading}
        >
          <Text style={[styles.toggleText, usePhone && styles.toggleTextActive]}>Phone Number</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, !usePhone && styles.toggleButtonActive]}
          onPress={() => setUsePhone(false)}
          disabled={loading}
        >
          <Text style={[styles.toggleText, !usePhone && styles.toggleTextActive]}>Email</Text>
        </TouchableOpacity>
      </View>

      {/* Phone or Email Input */}
      {usePhone ? (
        <View style={styles.formGroup}>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={[styles.input, validationErrors.phoneNumber && styles.inputError]}
            placeholder="9876543210"
            value={phoneNumber}
            onChangeText={(text) => {
              setPhoneNumber(text);
              if (validationErrors.phoneNumber) {
                setValidationErrors({ ...validationErrors, phoneNumber: '' });
              }
            }}
            keyboardType="phone-pad"
            maxLength={10}
            editable={!loading}
          />
          {validationErrors.phoneNumber && <Text style={styles.fieldError}>{validationErrors.phoneNumber}</Text>}
        </View>
      ) : (
        <>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={[styles.input, validationErrors.email && styles.inputError]}
              placeholder="you@example.com"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (validationErrors.email) {
                  setValidationErrors({ ...validationErrors, email: '' });
                }
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
            {validationErrors.email && <Text style={styles.fieldError}>{validationErrors.email}</Text>}
          </View>

          {/* Login Method Toggle */}
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setUsePassword(!usePassword)}
            disabled={loading}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, usePassword && styles.checkboxChecked]}>
              {usePassword && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>Login with password instead of OTP</Text>
          </TouchableOpacity>

          {/* Password Input */}
          {usePassword && (
            <View style={styles.formGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={[styles.input, validationErrors.password && styles.inputError]}
                placeholder="Enter your password"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (validationErrors.password) {
                    setValidationErrors({ ...validationErrors, password: '' });
                  }
                }}
                secureTextEntry
                editable={!loading}
              />
              {validationErrors.password && <Text style={styles.fieldError}>{validationErrors.password}</Text>}
            </View>
          )}
        </>
      )}

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>{usePassword ? 'Login' : 'Send OTP'}</Text>
        )}
      </TouchableOpacity>

      {/* Register Link */}
      <View style={styles.registerLink}>
        <Text style={styles.registerLinkText}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Register' as never)} disabled={loading}>
          <Text style={styles.registerLinkButton}>Register</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    padding: 20,
    justifyContent: 'center',
    minHeight: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a202c',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    marginBottom: 32,
  },
  error: {
    backgroundColor: '#fed7d7',
    color: '#c53030',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#c53030',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2d3748',
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: '#e53e3e',
  },
  fieldError: {
    color: '#e53e3e',
    fontSize: 13,
    marginTop: 6,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#f7fafc',
    borderRadius: 8,
    padding: 4,
    marginBottom: 24,
  },
  toggleButton: {
    flex: 1,
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4a5568',
  },
  toggleTextActive: {
    color: '#667eea',
  },
  button: {
    backgroundColor: '#667eea',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  registerLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  registerLinkText: {
    color: '#718096',
    fontSize: 14,
  },
  registerLinkButton: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '600',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 8,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: '#cbd5e0',
    borderRadius: 4,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 14,
    color: '#4a5568',
  },
});
