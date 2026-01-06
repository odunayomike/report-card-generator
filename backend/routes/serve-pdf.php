<?php
/**
 * Serve PDF files with proper headers
 * This ensures PDFs are served correctly without corruption
 */

// Start output buffering
ob_start();

// Suppress error display
ini_set('display_errors', '0');
error_reporting(E_ALL);

// Check if user is authenticated (school or teacher)
if (!isset($_SESSION['school_id']) && !isset($_SESSION['teacher_id'])) {
    ob_clean();
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

// Get filename from request
$filename = $_GET['file'] ?? '';

if (empty($filename)) {
    ob_clean();
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Filename is required']);
    exit;
}

// Sanitize filename to prevent directory traversal
$filename = basename($filename);

// Build file path
$filePath = __DIR__ . '/../temp/' . $filename;

// Check if file exists
if (!file_exists($filePath)) {
    ob_clean();
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'File not found']);
    exit;
}

// Verify it's a PDF file
if (pathinfo($filename, PATHINFO_EXTENSION) !== 'pdf') {
    ob_clean();
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid file type']);
    exit;
}

// Clean output buffer
ob_clean();

// Set headers for PDF download
header('Content-Type: application/pdf');
header('Content-Disposition: attachment; filename="' . $filename . '"');
header('Content-Length: ' . filesize($filePath));
header('Cache-Control: no-cache, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

// Output the PDF file
readfile($filePath);
exit;
