/**
 * Environment Configuration
 * Contains all environment-specific settings for the frontend
 */

// Detect environment
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// Base URLs
export const BACKEND_URL = isLocalhost
    ? 'http://localhost:8000'
    : `${window.location.protocol}//${window.location.host}`;

export const FRONTEND_URL = isLocalhost
    ? 'http://localhost:5173'
    : `${window.location.protocol}//${window.location.host}`;

export const API_BASE_URL = `${BACKEND_URL}/backend/api`;
