"use strict";
// Shared formatting utilities
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatPercentage = exports.capitalizeFirst = exports.truncateText = exports.formatDuration = exports.formatDistance = exports.formatTime = exports.formatDateTime = exports.formatDate = exports.formatCurrency = void 0;
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};
exports.formatCurrency = formatCurrency;
const formatDate = (date) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    }).format(d);
};
exports.formatDate = formatDate;
const formatDateTime = (date) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(d);
};
exports.formatDateTime = formatDateTime;
const formatTime = (date) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
    }).format(d);
};
exports.formatTime = formatTime;
const formatDistance = (meters) => {
    if (meters < 1000) {
        return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
};
exports.formatDistance = formatDistance;
const formatDuration = (minutes) => {
    if (minutes < 60) {
        return `${minutes}min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
};
exports.formatDuration = formatDuration;
const truncateText = (text, maxLength) => {
    if (text.length <= maxLength)
        return text;
    return text.slice(0, maxLength) + '...';
};
exports.truncateText = truncateText;
const capitalizeFirst = (text) => {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};
exports.capitalizeFirst = capitalizeFirst;
const formatPercentage = (value, decimals = 0) => {
    return `${value.toFixed(decimals)}%`;
};
exports.formatPercentage = formatPercentage;
