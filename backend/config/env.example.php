<?php
/**
 * Environment Configuration - EXAMPLE
 * Copy this file to env.php and update with your actual settings
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
    define('BACKEND_URL', 'https://your-domain.com');
    define('FRONTEND_URL', 'https://your-domain.com');
}

// API Base URL
define('API_URL', BACKEND_URL . '/api');
