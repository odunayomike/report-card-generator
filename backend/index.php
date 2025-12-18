<?php
/**
 * Main API Router
 * Single entry point for all API requests
 */

// Configure session cookie parameters before starting session
ini_set('session.cookie_httponly', 1);
ini_set('session.use_only_cookies', 1);
ini_set('session.cookie_lifetime', 86400); // 24 hours
ini_set('session.gc_maxlifetime', 86400);

// Set SameSite attribute for session cookie
session_set_cookie_params([
    'lifetime' => 86400,
    'path' => '/',
    'domain' => '',
    'secure' => false, // Set to true if using HTTPS
    'httponly' => true,
    'samesite' => 'Lax'
]);

// Start session FIRST before any output
session_start();

// Load configurations
require_once __DIR__ . '/config/env.php';
require_once __DIR__ . '/config/cors.php';
require_once __DIR__ . '/config/database.php';

// Get the request URI and method
$request_uri = $_SERVER['REQUEST_URI'];
$request_method = $_SERVER['REQUEST_METHOD'];

// Remove query string and get the path
$path = parse_url($request_uri, PHP_URL_PATH);

// Remove /backend prefix if present (for production)
$path = preg_replace('#^/backend#i', '', $path);

// Remove /api prefix if present
$path = preg_replace('#^/api#i', '', $path);

// Ensure path starts with /
if (!empty($path) && $path[0] !== '/') {
    $path = '/' . $path;
}

// Remove trailing slash unless it's the root
if (strlen($path) > 1 && substr($path, -1) === '/') {
    $path = rtrim($path, '/');
}

// Route the request
try {
    switch ($path) {
        // Root/Home - API Documentation
        case '':
        case '/':
            require __DIR__ . '/routes/api-docs.php';
            break;

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
        case '/generate-admission-number':
            require __DIR__ . '/routes/generate-admission-number.php';
            break;

        case '/create-student':
            require __DIR__ . '/routes/create-student.php';
            break;

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

        // Contact form submission
        case '/contact':
            if ($request_method === 'POST') {
                require __DIR__ . '/routes/contact.php';
            } else {
                http_response_code(405);
                echo json_encode(['success' => false, 'message' => 'Method not allowed']);
            }
            break;

        // Subscription routes
        case '/subscription/get-plans':
            require __DIR__ . '/routes/subscription/get-plans.php';
            break;

        case '/subscription/initialize-payment':
            require __DIR__ . '/routes/subscription/initialize-payment.php';
            break;

        case '/subscription/verify-payment':
            require __DIR__ . '/routes/subscription/verify-payment.php';
            break;

        case '/subscription/get-status':
            require __DIR__ . '/routes/subscription/get-status.php';
            break;

        case '/subscription/change-plan':
            require __DIR__ . '/routes/subscription/change-plan.php';
            break;

        // Auto-debit routes
        case '/auto-debit/enable':
            require __DIR__ . '/routes/enable-auto-debit.php';
            break;

        case '/auto-debit/manage':
            require __DIR__ . '/routes/manage-auto-debit.php';
            break;

        case '/process-auto-debit':
            require __DIR__ . '/routes/process-auto-debit.php';
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
