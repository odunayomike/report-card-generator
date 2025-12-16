<?php
/**
 * Environment Configuration
 * Contains all environment-specific settings
 */

// Detect if we're running locally or in production
$isLocalhost = in_array($_SERVER['HTTP_HOST'], ['localhost', '127.0.0.1', 'localhost:8000']);

// Base URLs
if ($isLocalhost) {
    // Local development
    define('BACKEND_URL', 'http://localhost:8000');
    define('FRONTEND_URL', 'http://localhost:5173');
} else {
    // Production - set your production URLs here
    define('BACKEND_URL', 'https://' . $_SERVER['HTTP_HOST']);
    define('FRONTEND_URL', 'https://' . $_SERVER['HTTP_HOST']);
}

// API Base URL
define('API_URL', BACKEND_URL . '/api');
