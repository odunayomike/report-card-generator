<?php
/**
 * CORS Configuration
 */

// Get frontend URL from environment
$frontendUrl = getenv('FRONTEND_URL') ?: 'http://localhost:5173';

// Set CORS headers
header("Access-Control-Allow-Origin: $frontendUrl");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
