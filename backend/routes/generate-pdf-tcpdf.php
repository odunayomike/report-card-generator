<?php
/**
 * TCPDF-based PDF Generator (Fallback for servers with exec() disabled)
 * Pure PHP solution - works on all hosting environments
 */

require_once __DIR__ . '/../vendor/autoload.php';

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

// Get complete report data (same as generate-pdf.php)
$database = new Database();
$db = $database->getConnection();

$query = "SELECT s.*,
          sc.school_name, sc.address as school_address, sc.phone as school_phone,
          sc.email as school_email, sc.logo as school_logo, sc.grading_scale,
          sc.motto, sc.show_logo_on_report, sc.show_motto_on_report,
          sc.header_text, sc.footer_text
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
$attendance = $attendance_stmt->fetch(PDO::FETCH_ASSOC) ?: [];

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
$remarks = $remarks_stmt->fetch(PDO::FETCH_ASSOC) ?: [];

// Parse grading scale
$grading_scale = null;
if (isset($report['grading_scale']) && $report['grading_scale']) {
    $grading_scale = json_decode($report['grading_scale'], true);
}

// Default grading scale
$defaultGradingScale = [
    'A' => [75, 100],
    'B' => [65, 74],
    'C' => [55, 64],
    'D' => [45, 54],
    'F' => [0, 44]
];

$gradingScale = $grading_scale ?: $defaultGradingScale;

// Helper function to calculate grade and remark
function getGradeAndRemark($total, $gradingScale) {
    $score = floatval($total);

    if ($score >= $gradingScale['A'][0]) return ['grade' => 'A', 'remark' => 'EXCELLENT'];
    if ($score >= $gradingScale['B'][0]) return ['grade' => 'B', 'remark' => 'VERY GOOD'];
    if ($score >= $gradingScale['C'][0]) return ['grade' => 'C', 'remark' => 'GOOD'];
    if ($score >= $gradingScale['D'][0]) return ['grade' => 'D', 'remark' => 'FAIR'];
    return ['grade' => 'F', 'remark' => 'FAIL'];
}

// Calculate performance
$validSubjects = array_filter($subjects, function($s) { return isset($s['total']) && $s['total'] > 0; });
$performance = ['total' => 0, 'obtainable' => 0, 'average' => 0, 'grade' => 'N/A', 'remark' => 'N/A'];

if (count($validSubjects) > 0) {
    $totalObtained = array_sum(array_column($validSubjects, 'total'));
    $totalObtainable = count($validSubjects) * 100;
    $average = $totalObtained / count($validSubjects);
    $gradeInfo = getGradeAndRemark($average, $gradingScale);

    $performance = [
        'total' => round($totalObtained),
        'obtainable' => $totalObtainable,
        'average' => number_format($average, 2),
        'grade' => $gradeInfo['grade'],
        'remark' => $gradeInfo['remark']
    ];
}

// Calculate grade counts
$gradeCounts = ['A' => 0, 'B' => 0, 'C' => 0, 'D' => 0, 'E' => 0, 'F' => 0];
foreach ($validSubjects as $subject) {
    $gradeInfo = getGradeAndRemark($subject['total'], $gradingScale);
    $gradeCounts[$gradeInfo['grade']]++;
}

// Create PDF using TCPDF
$pdf = new TCPDF('P', 'mm', 'A4', true, 'UTF-8', false);

// Set document information
$pdf->SetCreator('SchoolHub');
$pdf->SetAuthor($report['school_name'] ?? 'School');
$pdf->SetTitle('Student Report Card');
$pdf->SetSubject('Report Card');

// Remove default header/footer
$pdf->setPrintHeader(false);
$pdf->setPrintFooter(false);

// Set margins
$pdf->SetMargins(10, 10, 10);
$pdf->SetAutoPageBreak(true, 10);

// Add a page
$pdf->AddPage();

// Set font
$pdf->SetFont('helvetica', '', 9);

// Build HTML content
$html = '<style>
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 0.5px solid #666; padding: 4px; text-align: center; }
    th { background-color: #e5e7eb; font-weight: bold; font-size: 8pt; }
    td { font-size: 7pt; }
    .text-left { text-align: left; }
    .font-bold { font-weight: bold; }
    .bg-gray { background-color: #f3f4f6; }
    h1 { font-size: 18pt; text-align: center; margin: 5px 0; }
    h2 { font-size: 11pt; text-align: center; margin: 3px 0; border-top: 2px solid black; border-bottom: 2px solid black; padding: 3px 0; }
    .school-info { text-align: center; font-size: 8pt; margin-bottom: 5px; }
    .info-row { font-size: 7pt; margin: 3px 0; }
</style>';

// Header
$html .= '<h1>' . strtoupper($report['school_name'] ?? 'SCHOOL NAME') . '</h1>';

if (!empty($report['show_motto_on_report']) && !empty($report['motto'])) {
    $html .= '<div class="school-info"><i>"' . htmlspecialchars($report['motto']) . '"</i></div>';
}

$html .= '<div class="school-info">' . ($report['school_address'] ?? '') . '</div>';
$html .= '<div class="school-info">TEL: ' . ($report['school_phone'] ?? 'N/A') . ', Email: ' . ($report['school_email'] ?? 'N/A') . '</div>';

// Report title
$html .= '<h2>' . strtoupper($report['term'] ?? 'FIRST TERM') . ' STUDENT\'S PERFORMANCE REPORT</h2>';

// Student info
$html .= '<div class="info-row">';
$html .= '<b>NAME:</b> ' . strtoupper($report['name'] ?? '') . ' | ';
$html .= '<b>CLASS:</b> ' . ($report['class'] ?? '') . ' | ';
$html .= '<b>GENDER:</b> ' . ($report['gender'] ?? '') . '<br>';
$html .= '<b>SESSION:</b> ' . ($report['session'] ?? '') . ' | ';
$html .= '<b>ADMISSION NO.:</b> ' . ($report['admission_no'] ?? '') . ' | ';
$html .= '<b>AGE:</b> ' . ($report['age'] ?? 'N/A');
$html .= '</div><br>';

// Subjects table
$html .= '<table cellpadding="3">';
$html .= '<thead><tr class="bg-gray">
    <th rowspan="2">COGNITIVE DOMAIN</th>
    <th colspan="3">SCORE</th>
    <th rowspan="2">GRADE</th>
    <th rowspan="2">REMARKS</th>
</tr>
<tr class="bg-gray">
    <th>CA<br/>40</th>
    <th>EXAM<br/>60</th>
    <th>TOTAL<br/>100</th>
</tr></thead><tbody>';

$html .= '<tr><td class="font-bold bg-gray text-left">SUBJECTS</td><td></td><td></td><td></td><td></td><td></td></tr>';

foreach ($validSubjects as $subject) {
    $gradeInfo = getGradeAndRemark($subject['total'], $gradingScale);
    $html .= '<tr>';
    $html .= '<td class="text-left">' . htmlspecialchars($subject['subject_name'] ?? $subject['name'] ?? '') . '</td>';
    $html .= '<td>' . ($subject['ca'] ?? 0) . '</td>';
    $html .= '<td>' . ($subject['exam'] ?? 0) . '</td>';
    $html .= '<td class="font-bold">' . ($subject['total'] ?? 0) . '</td>';
    $html .= '<td class="font-bold">' . $gradeInfo['grade'] . '</td>';
    $html .= '<td>' . $gradeInfo['remark'] . '</td>';
    $html .= '</tr>';
}

$html .= '</tbody></table><br>';

// Performance Summary
$html .= '<table cellpadding="3">';
$html .= '<thead><tr class="bg-gray"><th colspan="4">PERFORMANCE SUMMARY</th></tr></thead>';
$html .= '<tbody>';
$html .= '<tr><td class="font-bold text-left">Total Obtained:</td><td>' . $performance['total'] . '</td>';
$html .= '<td class="font-bold text-left">Total Obtainable:</td><td>' . $performance['obtainable'] . '</td></tr>';
$html .= '<tr><td colspan="2" class="font-bold text-left">PERCENTAGE:</td><td colspan="2" class="font-bold">' . $performance['average'] . '%</td></tr>';
$html .= '<tr><td colspan="2" class="font-bold text-left">GRADE:</td><td colspan="2" class="font-bold">' . $performance['grade'] . '</td></tr>';
$html .= '<tr><td colspan="2" class="font-bold text-left">REMARK:</td><td colspan="2" class="font-bold">' . $performance['remark'] . '</td></tr>';
$html .= '</tbody></table><br>';

// Attendance
$html .= '<table cellpadding="3"><tbody>';
$html .= '<tr><td class="text-left">No of Times School Opened</td><td>' . ($attendance['no_of_times_school_opened'] ?? 0) . '</td></tr>';
$html .= '<tr><td class="text-left">No of Times Present</td><td>' . ($attendance['no_of_times_present'] ?? 0) . '</td></tr>';
$html .= '<tr><td class="text-left">No of Times Absent</td><td>' . ($attendance['no_of_times_absent'] ?? 0) . '</td></tr>';
$html .= '</tbody></table><br>';

// Remarks
$html .= '<div style="border: 1px solid #666; padding: 5px; margin: 5px 0;">';
$html .= '<b>Teacher\'s Remark:</b> <i>' . htmlspecialchars($remarks['teacher_remark'] ?? '') . '</i><br>';
$html .= '<b>Teacher\'s Name:</b> ' . strtoupper($remarks['teacher_name'] ?? '') . '<br><br>';
$html .= '<b>Principal\'s Remark:</b> <i>' . htmlspecialchars($remarks['principal_remark'] ?? '') . '</i><br>';
$html .= '<b>Principal\'s Name:</b> ' . strtoupper($remarks['principal_name'] ?? '') . '<br><br>';
$html .= '<b>Next Term Begins:</b> ' . ($remarks['next_term_begins'] ?? '');
$html .= '</div>';

// Footer
$html .= '<div style="text-align: right; font-size: 7pt; margin-top: 10px;">';
$html .= strtoupper($report['school_name'] ?? 'SCHOOL NAME') . ' © ' . date('Y');
$html .= '</div>';

// Write HTML to PDF
$pdf->writeHTML($html, true, false, true, false, '');

// Generate filename
$safeName = preg_replace('/[^a-zA-Z0-9]/', '_', $report['name']);
$safeTerm = preg_replace('/[^a-zA-Z0-9]/', '_', $report['term']);
$safeSession = preg_replace('/[^a-zA-Z0-9]/', '_', $report['session']);
$filename = $safeName . '_' . $safeTerm . '_' . $safeSession . '_' . time() . '.pdf';

// Ensure temp directory exists
$tempDir = __DIR__ . '/../temp/';
if (!file_exists($tempDir)) {
    mkdir($tempDir, 0755, true);
}

$outputPath = $tempDir . $filename;

// Output PDF to file
$pdf->Output($outputPath, 'F');

// Return success with file URL
if (file_exists($outputPath)) {
    $fileUrl = BACKEND_URL . '/temp/' . $filename;
    echo json_encode([
        'success' => true,
        'url' => $fileUrl,
        'filename' => $filename,
        'method' => 'tcpdf'
    ]);

    // Clean up old PDFs (older than 1 hour)
    $files = glob($tempDir . '*.pdf');
    $now = time();
    foreach ($files as $file) {
        if ($now - filemtime($file) >= 3600) {
            unlink($file);
        }
    }
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to create PDF file']);
}
?>
