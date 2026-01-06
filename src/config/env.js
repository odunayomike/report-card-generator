/**
 * Environment Configuration
 * Contains all environment-specific settings for the frontend
 */

// Get backend URL from environment variable, with fallback to auto-detection
const getBackendUrl = () => {
    // First priority: environment variable
    if (import.meta.env.VITE_BACKEND_URL) {
        return import.meta.env.VITE_BACKEND_URL;
    }

    // Fallback: auto-detect based on hostname
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    return isLocalhost
        ? 'http://localhost:8000'
        : `${window.location.protocol}//${window.location.host}/backend`;
};

const getFrontendUrl = () => {
    // First priority: environment variable
    if (import.meta.env.VITE_FRONTEND_URL) {
        return import.meta.env.VITE_FRONTEND_URL;
    }

    // Fallback: auto-detect based on hostname
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    return isLocalhost
        ? 'http://localhost:5173'
        : `${window.location.protocol}//${window.location.host}`;
};

// Base URLs
export const BACKEND_URL = getBackendUrl();
export const FRONTEND_URL = getFrontendUrl();
export const API_BASE_URL = `${BACKEND_URL}/api`;
