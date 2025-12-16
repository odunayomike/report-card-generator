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

        // Teacher Auth routes
        case '/auth/teacher-login':
            require __DIR__ . '/routes/auth/teacher-login.php';
            break;

        case '/auth/teacher-check-session':
            require __DIR__ . '/routes/auth/teacher-check-session.php';
            break;

        // Teacher Management routes (for schools)
        case '/teachers/create':
            require __DIR__ . '/routes/teachers/create.php';
            break;

        case '/teachers/get-all':
            require __DIR__ . '/routes/teachers/get-all.php';
            break;

        case '/teachers/assign-class':
            require __DIR__ . '/routes/teachers/assign-class.php';
            break;

        case '/teachers/get-my-classes':
            require __DIR__ . '/routes/teachers/get-my-classes.php';
            break;

        // Attendance routes (for teachers)
        case '/attendance/get-students':
            require __DIR__ . '/routes/attendance/get-students.php';
            break;

        case '/attendance/mark-daily':
            require __DIR__ . '/routes/attendance/mark-daily.php';
            break;

        case '/attendance/get-daily':
            require __DIR__ . '/routes/attendance/get-daily.php';
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

        case '/check-student':
            require __DIR__ . '/routes/check-student.php';
            break;

        case '/get-student-profile':
            require __DIR__ . '/routes/get-student-profile.php';
            break;

        case '/get-analytics':
            require __DIR__ . '/routes/get-analytics.php';
            break;

        // School profile routes
        case '/school/get-profile':
            require __DIR__ . '/routes/school/get-profile.php';
            break;

        case '/school/update-profile':
            require __DIR__ . '/routes/school/update-profile.php';
            break;

        case '/school/update-logo':
            require __DIR__ . '/routes/school/update-logo.php';
            break;

        case '/school/update-settings':
            require __DIR__ . '/routes/school/update-settings.php';
            break;

        case '/school/change-password':
            require __DIR__ . '/routes/school/change-password.php';
            break;

        // PDF generation route
        case '/generate-pdf':
            require __DIR__ . '/routes/generate-pdf.php';
            break;

        // PDF view route (for Puppeteer)
        case '/pdf-view':
            require __DIR__ . '/routes/pdf-view.php';
            break;

        // Default - 404
        default:
            // Check if it's a request for a temp PDF file
            if (preg_match('#^/temp/(.+\.pdf)$#', $path, $matches)) {
                $pdfFile = __DIR__ . '/temp/' . $matches[1];
                if (file_exists($pdfFile)) {
                    header('Content-Type: application/pdf');
                    header('Content-Disposition: attachment; filename="' . basename($pdfFile) . '"');
                    header('Content-Length: ' . filesize($pdfFile));
                    readfile($pdfFile);
                    exit;
                }
            }

            // Regular 404
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
