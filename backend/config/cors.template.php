<?php
/**
 * CORS Configuration
 */

// Allowed origins
$allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://schoolhub.tech',
    'http://schoolhub.tech',
    'https://www.schoolhub.tech',
    'http://www.schoolhub.tech',
    'http://uoocs48oss8ss0k0gw8wcsk8.159.195.43.234.sslip.io',
    'https://uoocs48oss8ss0k0gw8wcsk8.159.195.43.234.sslip.io'
];

// Get the origin from the request
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

// Always set CORS headers for allowed origins
if ($origin && in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
} else {
    // For debugging - allow localhost variations
    if ($origin && (strpos($origin, 'localhost') !== false || strpos($origin, '127.0.0.1') !== false)) {
        header("Access-Control-Allow-Origin: $origin");
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
    }
}

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
