<?php
/**
 * Generate PDF Route Handler
 */

// Start output buffering to catch any errors
ob_start();

// Suppress error display in favor of clean JSON responses
ini_set('display_errors', '0');
error_reporting(E_ALL);

// Check if exec() is disabled - if so, use TCPDF fallback
$disabled_functions = ini_get('disable_functions');
if (strpos($disabled_functions, 'exec') !== false || !function_exists('exec')) {
    // exec() is disabled, use TCPDF fallback
    require_once __DIR__ . '/generate-pdf-tcpdf.php';
    exit;
}

// Check if user is authenticated (school or teacher)
if (!isset($_SESSION['school_id']) && !isset($_SESSION['teacher_id'])) {
    ob_clean();
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

// Get report ID from request
$reportId = isset($_GET['id']) ? intval($_GET['id']) : 0;

if (!$reportId) {
    ob_clean();
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Report ID is required']);
    exit;
}

// Get complete report data
$database = new Database();
$db = $database->getConnection();

// Get the school_id (from session or teacher's school)
$schoolId = $_SESSION['school_id'] ?? null;
if (!$schoolId && isset($_SESSION['teacher_id'])) {
    // Get school_id from teacher record
    $teacherQuery = "SELECT school_id FROM teachers WHERE id = ?";
    $teacherStmt = $db->prepare($teacherQuery);
    $teacherStmt->execute([$_SESSION['teacher_id']]);
    $teacher = $teacherStmt->fetch(PDO::FETCH_ASSOC);
    $schoolId = $teacher['school_id'] ?? null;
}

// Get report card data from the new structure
$query = "SELECT rc.*,
          sc.school_name, sc.address as school_address, sc.phone as school_phone,
          sc.email as school_email, sc.logo as school_logo, sc.grading_scale,
          sc.motto, sc.show_logo_on_report, sc.show_motto_on_report,
          sc.header_text, sc.footer_text
          FROM report_cards rc
          LEFT JOIN schools sc ON rc.school_id = sc.id
          WHERE rc.id = ? AND rc.school_id = ?";
$stmt = $db->prepare($query);
$stmt->execute([$reportId, $schoolId]);
$report = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$report) {
    ob_clean();
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'Report not found']);
    exit;
}

// Get all related data using report_card_id
$attendance_query = "SELECT * FROM attendance WHERE report_card_id = ?";
$attendance_stmt = $db->prepare($attendance_query);
$attendance_stmt->execute([$reportId]);
$attendance = $attendance_stmt->fetch(PDO::FETCH_ASSOC);

$subjects_query = "SELECT * FROM subjects WHERE report_card_id = ?";
$subjects_stmt = $db->prepare($subjects_query);
$subjects_stmt->execute([$reportId]);
$subjects = $subjects_stmt->fetchAll(PDO::FETCH_ASSOC);

// Get student_id from admission number for affective/psychomotor domains
$student_query = "SELECT id FROM students WHERE admission_no = ? AND school_id = ? LIMIT 1";
$student_stmt = $db->prepare($student_query);
$student_stmt->execute([$report['student_admission_no'], $schoolId]);
$student_record = $student_stmt->fetch(PDO::FETCH_ASSOC);
$studentId = $student_record ? $student_record['id'] : null;

// Affective and psychomotor domains use student_id, not report_card_id
$affective = [];
$psychomotor = [];
if ($studentId) {
    $affective_query = "SELECT * FROM affective_domain WHERE student_id = ?";
    $affective_stmt = $db->prepare($affective_query);
    $affective_stmt->execute([$studentId]);
    $affective = $affective_stmt->fetchAll(PDO::FETCH_ASSOC);

    $psychomotor_query = "SELECT * FROM psychomotor_domain WHERE student_id = ?";
    $psychomotor_stmt = $db->prepare($psychomotor_query);
    $psychomotor_stmt->execute([$studentId]);
    $psychomotor = $psychomotor_stmt->fetchAll(PDO::FETCH_ASSOC);
}

$remarks_query = "SELECT * FROM remarks WHERE report_card_id = ?";
$remarks_stmt = $db->prepare($remarks_query);
$remarks_stmt->execute([$reportId]);
$remarks = $remarks_stmt->fetch(PDO::FETCH_ASSOC);

// Parse grading scale JSON if it exists
$grading_scale = null;
if (isset($report['grading_scale']) && $report['grading_scale']) {
    $grading_scale = json_decode($report['grading_scale'], true);
}

// Compile all data into one object
$fullReportData = [
    'student' => $report,
    'attendance' => $attendance,
    'subjects' => $subjects,
    'affective' => $affective,
    'psychomotor' => $psychomotor,
    'remarks' => $remarks,
    'school' => [
        'grading_scale' => $grading_scale,
        'motto' => $report['motto'] ?? null,
        'show_logo_on_report' => isset($report['show_logo_on_report']) ? (bool)$report['show_logo_on_report'] : true,
        'show_motto_on_report' => isset($report['show_motto_on_report']) ? (bool)$report['show_motto_on_report'] : true,
        'header_text' => $report['header_text'] ?? null,
        'footer_text' => $report['footer_text'] ?? null
    ]
];

// Get session cookie
$sessionCookie = session_id();

// Generate unique filename with student name, term, and session
$timestamp = time();
$studentName = $report['student_name'] ?? $report['name'] ?? 'Student';
$term = $report['term'] ?? 'Term';
$session = $report['session'] ?? 'Session';

$safeName = preg_replace('/[^a-zA-Z0-9]/', '_', $studentName);
$safeTerm = preg_replace('/[^a-zA-Z0-9]/', '_', $term);
$safeSession = preg_replace('/[^a-zA-Z0-9]/', '_', $session);
$filename = $safeName . '_' . $safeTerm . '_' . $safeSession . '.pdf';
$outputPath = __DIR__ . '/../temp/' . $filename;

// Ensure temp directory exists
if (!file_exists(__DIR__ . '/../temp/')) {
    mkdir(__DIR__ . '/../temp/', 0755, true);
}

// Save data to temporary JSON file for Node.js to read
$dataFile = __DIR__ . '/../temp/report_data_' . $timestamp . '.json';
file_put_contents($dataFile, json_encode($fullReportData));

// Call Node.js script to generate PDF with data file path
// Try multiple node paths for production compatibility
$possibleNodePaths = [
    '/usr/bin/node',
    '/usr/local/bin/node',
    'node',
    '/opt/node/bin/node',
    '/home/*/nvm/versions/node/*/bin/node'
];

$nodePath = 'node'; // default
foreach ($possibleNodePaths as $path) {
    if (file_exists($path) || $path === 'node') {
        $nodePath = $path;
        if ($path !== 'node' && file_exists($path)) {
            break; // Use first found absolute path
        }
    }
}

$scriptPath = __DIR__ . '/../pdf-service.js';
$command = escapeshellcmd($nodePath) . ' ' . escapeshellarg($scriptPath) . ' ' .
           escapeshellarg($reportId) . ' ' .
           escapeshellarg($dataFile) . ' ' .
           escapeshellarg($outputPath) . ' 2>&1';

// Clean up data file after command
register_shutdown_function(function() use ($dataFile) {
    if (file_exists($dataFile)) {
        unlink($dataFile);
    }
});

// Log the command for debugging (only in development)
if (defined('ENVIRONMENT') && ENVIRONMENT === 'development') {
    error_log('PDF Generation Command: ' . $command);
}

exec($command, $output, $returnCode);

// Log output for debugging
error_log('PDF Generation Output: ' . implode("\n", $output));
error_log('PDF Generation Return Code: ' . $returnCode);

// Parse output
$result = @json_decode(implode("\n", $output), true);

// Clean output buffer before sending JSON
ob_clean();

if ($returnCode === 0 && $result && $result['success']) {
    // PDF generated successfully
    if (file_exists($outputPath)) {
        // Return the PDF file URL for download via serve-pdf endpoint
        $fileUrl = BACKEND_URL . '/api/serve-pdf?file=' . urlencode($filename);
        echo json_encode([
            'success' => true,
            'url' => $fileUrl,
            'filename' => $filename,
            'method' => 'puppeteer'
        ]);

        // Clean up old PDFs (older than 1 hour)
        $tempDir = __DIR__ . '/../temp/';
        $files = glob($tempDir . '*.pdf');
        $now = time();
        foreach ($files as $file) {
            if ($now - filemtime($file) >= 3600) { // 1 hour
                unlink($file);
            }
        }
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'PDF file not created']);
    }
} else {
    // Error generating PDF
    http_response_code(500);
    $errorMessage = $result['error'] ?? 'Unknown error';
    error_log('PDF Generation Error: ' . $errorMessage);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to generate PDF',
        'error' => $errorMessage,
        'output' => $output
    ]);
}
?>
