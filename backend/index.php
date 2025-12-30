<?php
/**
 * Main API Router
 * Single entry point for all API requests
 */

// Configure session cookie parameters before starting session
ini_set('session.cookie_httponly', 1);
ini_set('session.use_only_cookies', 1);
ini_set('session.cookie_lifetime', 0); // Session cookie (until browser closes)
ini_set('session.gc_maxlifetime', 86400); // 24 hours server-side
ini_set('session.cookie_path', '/');

// Set SameSite attribute for session cookie
session_set_cookie_params([
    'lifetime' => 0, // Session cookie
    'path' => '/',
    'domain' => '',
    'secure' => false,
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

        case '/auth/student-login':
            require __DIR__ . '/routes/auth/student-login.php';
            break;

        // Teacher Auth routes
        case '/auth/teacher-login':
            require __DIR__ . '/routes/auth/teacher-login.php';
            break;

        case '/auth/teacher-check-session':
            require __DIR__ . '/routes/auth/teacher-check-session.php';
            break;

        case '/auth/student-check-session':
            require __DIR__ . '/routes/auth/student-check-session.php';
            break;

        // Super Admin Auth routes
        case '/super-admin/login':
            require __DIR__ . '/routes/super-admin/login.php';
            break;

        case '/super-admin/logout':
            require __DIR__ . '/routes/super-admin/logout.php';
            break;

        case '/super-admin/check-session':
            require __DIR__ . '/routes/super-admin/check-session.php';
            break;

        // Super Admin Management routes
        case '/super-admin/get-analytics':
            require __DIR__ . '/routes/super-admin/get-analytics.php';
            break;

        case '/super-admin/get-all-schools':
            require __DIR__ . '/routes/super-admin/get-all-schools.php';
            break;

        case '/super-admin/get-school-details':
            require __DIR__ . '/routes/super-admin/get-school-details.php';
            break;

        case '/super-admin/toggle-school-status':
            require __DIR__ . '/routes/super-admin/toggle-school-status.php';
            break;

        case '/super-admin/update-school-subscription':
            require __DIR__ . '/routes/super-admin/update-school-subscription.php';
            break;

        case '/super-admin/get-all-students':
            require __DIR__ . '/routes/super-admin/get-all-students.php';
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

        case '/search-students':
            require __DIR__ . '/routes/search-students.php';
            break;

        case '/get-student-profile':
            require __DIR__ . '/routes/get-student-profile.php';
            break;

        case '/get-student-details':
            require __DIR__ . '/routes/get-student-details.php';
            break;

        case '/update-student':
            require __DIR__ . '/routes/update-student.php';
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

        case '/school/get-classes':
            require __DIR__ . '/routes/school/get-classes.php';
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

        // CBT routes
        case '/cbt/questions':
            require __DIR__ . '/routes/cbt/questions.php';
            break;

        case '/cbt/import-questions':
            require __DIR__ . '/routes/cbt/import-questions.php';
            break;

        case '/cbt/exams':
            require __DIR__ . '/routes/cbt/exams.php';
            break;

        case '/cbt/student-exams':
            require __DIR__ . '/routes/cbt/student-exams.php';
            break;

        case '/cbt/get-students':
            require __DIR__ . '/routes/cbt/get-students.php';
            break;

        case '/cbt/grading':
            require __DIR__ . '/routes/cbt/grading.php';
            break;

        case '/cbt/analytics':
            require __DIR__ . '/routes/cbt/analytics.php';
            break;

        case '/cbt/results':
            require __DIR__ . '/routes/cbt/results.php';
            break;

        // Get students with IDs (for parent management)
        case '/get-students-with-ids':
            require __DIR__ . '/routes/get-students-with-ids.php';
            break;

        // Parent routes
        case '/parent/login':
            require __DIR__ . '/routes/parent/login.php';
            break;

        case '/parent/logout':
            require __DIR__ . '/routes/parent/logout.php';
            break;

        case '/parent/check-session':
            require __DIR__ . '/routes/parent/check-session.php';
            break;

        case '/parent/get-children':
            require __DIR__ . '/routes/parent/get-children.php';
            break;

        case '/parent/get-child-analytics':
            require __DIR__ . '/routes/parent/get-child-analytics.php';
            break;

        case '/parent/get-child-history':
            require __DIR__ . '/routes/parent/get-child-history.php';
            break;

        case '/parent/add-parent-student':
            require __DIR__ . '/routes/parent/add-parent-student.php';
            break;

        case '/parent/get-all-parents':
            require __DIR__ . '/routes/parent/get-all-parents.php';
            break;

        case '/parent/get-student-parents':
            require __DIR__ . '/routes/parent/get-student-parents.php';
            break;

        case '/parent/remove-parent-student':
            require __DIR__ . '/routes/parent/remove-parent-student.php';
            break;

        // Parent Accounting/Payment routes
        case '/parent/get-fees':
            require __DIR__ . '/routes/accounting/parent/get-fees.php';
            break;

        case '/parent/get-bank-accounts':
            require __DIR__ . '/routes/accounting/parent/get-bank-accounts.php';
            break;

        case '/parent/submit-payment':
            require __DIR__ . '/routes/accounting/parent/submit-payment.php';
            break;

        case '/parent/get-payment-history':
            require __DIR__ . '/routes/accounting/parent/get-payment-history.php';
            break;

        case '/parent/initialize-paystack-payment':
            require __DIR__ . '/routes/accounting/parent/initialize-paystack-payment.php';
            break;

        case '/parent/verify-paystack-payment':
            require __DIR__ . '/routes/accounting/parent/verify-paystack-payment.php';
            break;

        // Accounting Fee Categories routes
        case '/accounting/fee-categories':
            require __DIR__ . '/routes/accounting/fee-categories/get-all.php';
            break;

        case '/accounting/fee-categories/create':
            require __DIR__ . '/routes/accounting/fee-categories/create.php';
            break;

        case '/accounting/admin/update-fee-category':
            require __DIR__ . '/routes/accounting/admin/update-fee-category.php';
            break;

        // Accounting Fee Structure routes
        case '/accounting/admin/get-fee-structure':
            require __DIR__ . '/routes/accounting/admin/get-fee-structure.php';
            break;

        case '/accounting/admin/create-fee-structure':
            require __DIR__ . '/routes/accounting/admin/create-fee-structure.php';
            break;

        case '/accounting/admin/update-fee-structure':
            require __DIR__ . '/routes/accounting/admin/update-fee-structure.php';
            break;

        case '/accounting/admin/delete-fee-structure':
            require __DIR__ . '/routes/accounting/admin/delete-fee-structure.php';
            break;

        case '/accounting/admin/archive-fee-structure':
            require __DIR__ . '/routes/accounting/admin/archive-fee-structure.php';
            break;

        case '/accounting/admin/assign-fees-to-students':
            require __DIR__ . '/routes/accounting/admin/assign-fees-to-students.php';
            break;

        // Accounting Admin routes (Payment Verification)
        case '/accounting/admin/get-pending-payments':
            require __DIR__ . '/routes/accounting/admin/get-pending-payments.php';
            break;

        case '/accounting/admin/verify-payment':
            require __DIR__ . '/routes/accounting/admin/verify-payment.php';
            break;

        case '/accounting/admin/reject-payment':
            require __DIR__ . '/routes/accounting/admin/reject-payment.php';
            break;

        // Accounting Admin routes (Bank Account Management)
        case '/accounting/admin/get-bank-accounts':
            require __DIR__ . '/routes/accounting/admin/get-bank-accounts.php';
            break;

        case '/accounting/admin/create-bank-account':
            require __DIR__ . '/routes/accounting/admin/create-bank-account.php';
            break;

        case '/accounting/admin/update-bank-account':
            require __DIR__ . '/routes/accounting/admin/update-bank-account.php';
            break;

        case '/accounting/admin/delete-bank-account':
            require __DIR__ . '/routes/accounting/admin/delete-bank-account.php';
            break;

        // Accounting Expense Tracking routes
        case '/accounting/admin/get-expenses':
            require __DIR__ . '/routes/accounting/admin/get-expenses.php';
            break;

        case '/accounting/admin/create-expense':
            require __DIR__ . '/routes/accounting/admin/create-expense.php';
            break;

        // Accounting Financial Reports routes
        case '/accounting/admin/get-financial-report':
            require __DIR__ . '/routes/accounting/admin/get-financial-report.php';
            break;

        // Accounting Settlement/Subaccount routes
        case '/accounting/admin/get-banks':
            require __DIR__ . '/routes/accounting/admin/get-banks.php';
            break;

        case '/accounting/admin/verify-bank-account':
            require __DIR__ . '/routes/accounting/admin/verify-bank-account.php';
            break;

        case '/accounting/admin/create-subaccount':
            require __DIR__ . '/routes/accounting/admin/create-subaccount.php';
            break;

        case '/accounting/admin/get-settlement-info':
            require __DIR__ . '/routes/accounting/admin/get-settlement-info.php';
            break;

        case '/accounting/admin/delete-subaccount':
            require __DIR__ . '/routes/accounting/admin/delete-subaccount.php';
            break;

        case '/accounting/admin/verify-subaccount':
            require __DIR__ . '/routes/accounting/admin/verify-subaccount.php';
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
