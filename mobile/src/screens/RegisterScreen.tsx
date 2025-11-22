import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { register, clearError } from '../store/authSlice';

export default function RegisterScreen() {
    const navigation = useNavigation();
    const dispatch = useAppDispatch();
    const { loading, error } = useAppSelector((state) => state.auth);

    const [usePhone, setUsePhone] = useState(true);
    const [name, setName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isPartner, setIsPartner] = useState(false);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    const validateForm = () => {
        const errors: Record<string, string> = {};

        // Name validation
        if (!name.trim()) {
            errors.name = 'Name is required';
        } else if (name.length < 2) {
            errors.name = 'Name must be at least 2 characters';
        }

        // Phone or Email validation
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
        }

        // Password validation
        if (!password) {
            errors.password = 'Password is required';
        } else if (password.length < 8) {
            errors.password = 'Password must be at least 8 characters';
        } else if (!/[A-Z]/.test(password)) {
            errors.password = 'Password must contain at least one uppercase letter';
        } else if (!/[a-z]/.test(password)) {
            errors.password = 'Password must contain at least one lowercase letter';
        } else if (!/[0-9]/.test(password)) {
            errors.password = 'Password must contain at least one number';
        }

        // Confirm password validation
        if (password !== confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleRegister = async () => {
        dispatch(clearError());

        if (!validateForm()) {
            return;
        }

        const data = {
            name,
            password,
            isPartner,
            ...(usePhone ? { phoneNumber } : { email }),
        };

        const result = await dispatch(register(data));

        if (register.fulfilled.match(result)) {
            navigation.navigate('OTPVerification' as never);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join GYMFU and start your fitness journey</Text>

            {error && <Text style={styles.error}>{error}</Text>}

            {/* Name Input */}
            <View style={styles.formGroup}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                    style={[styles.input, validationErrors.name && styles.inputError]}
                    placeholder="Enter your full name"
                    value={name}
                    onChangeText={(text) => {
                        setName(text);
                        if (validationErrors.name) {
                            setValidationErrors({ ...validationErrors, name: '' });
                        }
                    }}
                    editable={!loading}
                />
                {validationErrors.name && <Text style={styles.fieldError}>{validationErrors.name}</Text>}
            </View>

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
            )}

            {/* Password Input */}
            <View style={styles.formGroup}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                    style={[styles.input, validationErrors.password && styles.inputError]}
                    placeholder="Min 8 characters, 1 uppercase, 1 number"
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

            {/* Confirm Password Input */}
            <View style={styles.formGroup}>
                <Text style={styles.label}>Confirm Password</Text>
                <TextInput
                    style={[styles.input, validationErrors.confirmPassword && styles.inputError]}
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChangeText={(text) => {
                        setConfirmPassword(text);
                        if (validationErrors.confirmPassword) {
                            setValidationErrors({ ...validationErrors, confirmPassword: '' });
                        }
                    }}
                    secureTextEntry
                    editable={!loading}
                />
                {validationErrors.confirmPassword && <Text style={styles.fieldError}>{validationErrors.confirmPassword}</Text>}
            </View>

            {/* Partner Registration Checkbox */}
            <TouchableOpacity
                style={styles.partnerCheckboxContainer}
                onPress={() => setIsPartner(!isPartner)}
                disabled={loading}
                activeOpacity={0.7}
            >
                <View style={[styles.checkbox, isPartner && styles.checkboxChecked]}>
                    {isPartner && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <View style={styles.checkboxTextContainer}>
                    <Text style={styles.checkboxLabel}>Register as a Gym Partner</Text>
                    <Text style={styles.checkboxSubtext}>
                        (Check this if you want to list and manage gyms)
                    </Text>
                </View>
            </TouchableOpacity>

            {/* Submit Button */}
            <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleRegister}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>Create Account</Text>
                )}
            </TouchableOpacity>

            {/* Login Link */}
            <View style={styles.loginLink}>
                <Text style={styles.loginLinkText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login' as never)} disabled={loading}>
                    <Text style={styles.loginLinkButton}>Login</Text>
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
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1a202c',
        textAlign: 'center',
        marginTop: 20,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#718096',
        textAlign: 'center',
        marginBottom: 24,
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
        marginBottom: 16,
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
    loginLink: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
        marginBottom: 20,
    },
    loginLinkText: {
        color: '#718096',
        fontSize: 14,
    },
    loginLinkButton: {
        color: '#667eea',
        fontSize: 14,
        fontWeight: '600',
    },
    partnerCheckboxContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#f7fafc',
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
    },
    checkbox: {
        width: 22,
        height: 22,
        borderWidth: 2,
        borderColor: '#cbd5e0',
        borderRadius: 4,
        marginRight: 12,
        marginTop: 2,
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
    checkboxTextContainer: {
        flex: 1,
    },
    checkboxLabel: {
        fontSize: 15,
        color: '#2d3748',
        fontWeight: '500',
        marginBottom: 4,
    },
    checkboxSubtext: {
        fontSize: 13,
        color: '#718096',
    },
});
