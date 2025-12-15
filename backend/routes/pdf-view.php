<?php
/**
 * PDF View Route - Renders report as HTML for Puppeteer
 * This endpoint serves a static HTML version of the report for PDF generation
 */

// Get report ID and session from query params
$reportId = isset($_GET['id']) ? intval($_GET['id']) : 0;
$sessionId = isset($_GET['session']) ? $_GET['session'] : '';

if (!$reportId || !$sessionId) {
    echo 'Invalid parameters';
    exit;
}

// Note: Session is already started by index.php, but we need to verify the session ID matches
if (session_id() !== $sessionId) {
    echo 'Session mismatch - session_id: ' . session_id() . ' vs provided: ' . $sessionId;
    exit;
}

// Check if user is authenticated
if (!isset($_SESSION['school_id'])) {
    echo 'Unauthorized - No school_id in session';
    exit;
}

// Get student data
$database = new Database();
$db = $database->getConnection();

$query = "SELECT s.*, sc.school_name, sc.logo, sc.address as school_address, sc.phone as school_phone, sc.email as school_email, sc.motto
          FROM students s
          LEFT JOIN schools sc ON s.school_id = sc.id
          WHERE s.id = ? AND s.school_id = ?";

$stmt = $db->prepare($query);
$stmt->execute([$reportId, $_SESSION['school_id']]);
$student = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$student) {
    http_response_code(404);
    echo 'Report not found';
    exit;
}

// Get additional data (attendance, scores, etc.)
$attendanceQuery = "SELECT * FROM attendance WHERE student_id = ?";
$attendanceStmt = $db->prepare($attendanceQuery);
$attendanceStmt->execute([$reportId]);
$attendance = $attendanceStmt->fetch(PDO::FETCH_ASSOC);

$scoresQuery = "SELECT * FROM cognitive_scores WHERE student_id = ?";
$scoresStmt = $db->prepare($scoresQuery);
$scoresStmt->execute([$reportId]);
$scores = $scoresStmt->fetchAll(PDO::FETCH_ASSOC);

$affectiveQuery = "SELECT * FROM affective_scores WHERE student_id = ?";
$affectiveStmt = $db->prepare($affectiveQuery);
$affectiveStmt->execute([$reportId]);
$affective = $affectiveStmt->fetchAll(PDO::FETCH_ASSOC);

$psychomotorQuery = "SELECT * FROM psychomotor_scores WHERE student_id = ?";
$psychomotorStmt = $db->prepare($psychomotorQuery);
$psychomotorStmt->execute([$reportId]);
$psychomotor = $psychomotorStmt->fetchAll(PDO::FETCH_ASSOC);

// Render HTML (simplified version of the React component)
?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Report Card - <?php echo htmlspecialchars($student['name']); ?></title>
    <!-- <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link href="http://localhost:5173/src/index.css" rel="stylesheet"> -->
</head>
<body>
    <div class="bg-white report-card-pdf" style="font-family: Arial, sans-serif; width: 210mm; min-height: 297mm; padding: 8mm; box-sizing: border-box;">
        <!-- Report card content will be rendered here -->
        <div class="text-center">
            <h1 class="text-2xl font-bold"><?php echo htmlspecialchars($student['school_name']); ?></h1>
            <p class="text-sm">Student: <?php echo htmlspecialchars($student['name']); ?></p>
            <p class="text-sm">Class: <?php echo htmlspecialchars($student['class']); ?></p>
            <p class="text-sm">Term: <?php echo htmlspecialchars($student['term']); ?> | Session: <?php echo htmlspecialchars($student['session']); ?></p>
        </div>
        <!-- Add more report content here -->
    </div>
</body>
</html>
