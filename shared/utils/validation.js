"use strict";
// Shared validation utilities
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatPhoneNumber = exports.sanitizePhoneNumber = exports.validateOTP = exports.validatePassword = exports.validatePhoneNumber = exports.validateEmail = void 0;
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
exports.validateEmail = validateEmail;
const validatePhoneNumber = (phone) => {
    // Indian phone number validation (10 digits)
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone.replace(/\s+/g, ''));
};
exports.validatePhoneNumber = validatePhoneNumber;
const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number');
    }
    return {
        isValid: errors.length === 0,
        errors,
    };
};
exports.validatePassword = validatePassword;
const validateOTP = (otp) => {
    return /^\d{6}$/.test(otp);
};
exports.validateOTP = validateOTP;
const sanitizePhoneNumber = (phone) => {
    // Remove all non-digit characters
    return phone.replace(/\D/g, '');
};
exports.sanitizePhoneNumber = sanitizePhoneNumber;
const formatPhoneNumber = (phone) => {
    // Format as: +91 XXXXX XXXXX
    const cleaned = (0, exports.sanitizePhoneNumber)(phone);
    if (cleaned.length === 10) {
        return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
    }
    return phone;
};
exports.formatPhoneNumber = formatPhoneNumber;
