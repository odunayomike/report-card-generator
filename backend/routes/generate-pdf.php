<?php
/**
 * Generate PDF Route Handler
 */

// Check if user is authenticated
if (!isset($_SESSION['school_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

// Get report ID from request
$reportId = isset($_GET['id']) ? intval($_GET['id']) : 0;

if (!$reportId) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Report ID is required']);
    exit;
}

// Get complete report data
$database = new Database();
$db = $database->getConnection();

// Use the same query as get-report.php to get all data
$query = "SELECT s.*, sc.school_name, sc.address as school_address, sc.phone as school_phone, sc.email as school_email, sc.logo as school_logo
          FROM students s
          LEFT JOIN schools sc ON s.school_id = sc.id
          WHERE s.id = ? AND s.school_id = ?";
$stmt = $db->prepare($query);
$stmt->execute([$reportId, $_SESSION['school_id']]);
$report = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$report) {
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'Report not found']);
    exit;
}

// Get all related data
$attendance_query = "SELECT * FROM attendance WHERE student_id = ?";
$attendance_stmt = $db->prepare($attendance_query);
$attendance_stmt->execute([$reportId]);
$attendance = $attendance_stmt->fetch(PDO::FETCH_ASSOC);

$subjects_query = "SELECT * FROM subjects WHERE student_id = ?";
$subjects_stmt = $db->prepare($subjects_query);
$subjects_stmt->execute([$reportId]);
$subjects = $subjects_stmt->fetchAll(PDO::FETCH_ASSOC);

$affective_query = "SELECT * FROM affective_domain WHERE student_id = ?";
$affective_stmt = $db->prepare($affective_query);
$affective_stmt->execute([$reportId]);
$affective = $affective_stmt->fetchAll(PDO::FETCH_ASSOC);

$psychomotor_query = "SELECT * FROM psychomotor_domain WHERE student_id = ?";
$psychomotor_stmt = $db->prepare($psychomotor_query);
$psychomotor_stmt->execute([$reportId]);
$psychomotor = $psychomotor_stmt->fetchAll(PDO::FETCH_ASSOC);

$remarks_query = "SELECT * FROM remarks WHERE student_id = ?";
$remarks_stmt = $db->prepare($remarks_query);
$remarks_stmt->execute([$reportId]);
$remarks = $remarks_stmt->fetch(PDO::FETCH_ASSOC);

// Compile all data into one object
$fullReportData = [
    'student' => $report,
    'attendance' => $attendance,
    'subjects' => $subjects,
    'affective' => $affective,
    'psychomotor' => $psychomotor,
    'remarks' => $remarks
];

// Get session cookie
$sessionCookie = session_id();

// Generate unique filename
$timestamp = time();
$safeName = preg_replace('/[^a-zA-Z0-9]/', '_', $report['name']);
$safeTerm = preg_replace('/[^a-zA-Z0-9]/', '_', $report['term']);
$safeSession = preg_replace('/[^a-zA-Z0-9]/', '_', $report['session']);
$filename = $safeName . '_' . $safeTerm . '_' . $safeSession . '_' . $timestamp . '.pdf';
$outputPath = __DIR__ . '/../temp/' . $filename;

// Ensure temp directory exists
if (!file_exists(__DIR__ . '/../temp/')) {
    mkdir(__DIR__ . '/../temp/', 0755, true);
}

// Save data to temporary JSON file for Node.js to read
$dataFile = __DIR__ . '/../temp/report_data_' . $timestamp . '.json';
file_put_contents($dataFile, json_encode($fullReportData));

// Call Node.js script to generate PDF with data file path
$nodePath = 'node';
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

exec($command, $output, $returnCode);

// Parse output
$result = @json_decode(implode("\n", $output), true);

if ($returnCode === 0 && $result && $result['success']) {
    // PDF generated successfully
    if (file_exists($outputPath)) {
        // Return the PDF file URL for download
        $fileUrl = 'http://localhost:8000/temp/' . $filename;
        echo json_encode([
            'success' => true,
            'url' => $fileUrl,
            'filename' => $filename
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
