<?php
/**
 * Main API Router
 * Single entry point for all API requests
 */

// Start session FIRST before any output
session_start();

// Load configurations
require_once __DIR__ . '/config/cors.php';
require_once __DIR__ . '/config/database.php';

// Get the request URI and method
$request_uri = $_SERVER['REQUEST_URI'];
$request_method = $_SERVER['REQUEST_METHOD'];

// Remove query string and get the path
$path = parse_url($request_uri, PHP_URL_PATH);

// Remove /api prefix if present
$path = preg_replace('#^/api#', '', $path);

// Route the request
try {
    switch ($path) {
        // Auth routes
        case '/auth/login':
            require __DIR__ . '/routes/auth/login.php';
            break;

        case '/auth/logout':
            require __DIR__ . '/routes/auth/logout.php';
            break;

        case '/auth/check-session':
            require __DIR__ . '/routes/auth/check-session.php';
            break;

        case '/auth/register':
            require __DIR__ . '/routes/auth/register.php';
            break;

        // Student/Report routes
        case '/save-report':
            require __DIR__ . '/routes/save-report.php';
            break;

        case '/get-report':
            require __DIR__ . '/routes/get-report.php';
            break;

        case '/get-all-students':
            require __DIR__ . '/routes/get-all-students.php';
            break;

        case '/delete-report':
            require __DIR__ . '/routes/delete-report.php';
            break;

        // Default - 404
        default:
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'message' => 'Route not found',
                'path' => $path
            ]);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage()
    ]);
}
