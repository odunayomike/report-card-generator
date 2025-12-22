<?php
/**
 * Get Child's Performance History Across Multiple Terms
 * Shows trends and progress over time
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../../config/database.php';

// Start session
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Check authentication
if (!isset($_SESSION['parent_id']) || $_SESSION['user_type'] !== 'parent') {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

// Get admission number from query parameter
$admissionNo = isset($_GET['admission_no']) ? trim($_GET['admission_no']) : '';

if (empty($admissionNo)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Admission number is required']);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();

    // Get all report cards for this student
    $query = "SELECT s.id, s.name, s.class, s.session, s.term, s.admission_no,
                     s.created_at, sc.school_name, sc.grading_scale
              FROM students s
              INNER JOIN schools sc ON s.school_id = sc.id
              INNER JOIN parent_students ps ON s.id = ps.student_id
              WHERE ps.parent_id = ? AND s.admission_no = ?
              ORDER BY s.session DESC,
                       FIELD(s.term, 'First Term', 'Second Term', 'Third Term') DESC";

    $stmt = $db->prepare($query);
    $stmt->execute([$_SESSION['parent_id'], $admissionNo]);
    $reportCards = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (empty($reportCards)) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'No records found']);
        exit;
    }

    // Parse grading scale
    $gradingScale = null;
    if (isset($reportCards[0]['grading_scale']) && $reportCards[0]['grading_scale']) {
        $gradingScale = json_decode($reportCards[0]['grading_scale'], true);
    }

    $defaultGradingScale = [
        'A' => [75, 100],
        'B' => [65, 74],
        'C' => [55, 64],
        'D' => [45, 54],
        'F' => [0, 44]
    ];

    $gradingScale = $gradingScale ?: $defaultGradingScale;

    function getGradeAndRemark($total, $gradingScale) {
        $score = floatval($total);
        if ($score >= $gradingScale['A'][0]) return ['grade' => 'A', 'remark' => 'EXCELLENT'];
        if ($score >= $gradingScale['B'][0]) return ['grade' => 'B', 'remark' => 'VERY GOOD'];
        if ($score >= $gradingScale['C'][0]) return ['grade' => 'C', 'remark' => 'GOOD'];
        if ($score >= $gradingScale['D'][0]) return ['grade' => 'D', 'remark' => 'FAIR'];
        return ['grade' => 'F', 'remark' => 'FAIL'];
    }

    // Build performance history
    $history = [];

    foreach ($reportCards as $card) {
        // Get subjects for this term
        $subjectsQuery = "SELECT subject_name, ca, exam, total
                          FROM subjects
                          WHERE student_id = ?";
        $subjectsStmt = $db->prepare($subjectsQuery);
        $subjectsStmt->execute([$card['id']]);
        $subjects = $subjectsStmt->fetchAll(PDO::FETCH_ASSOC);

        $validSubjects = array_filter($subjects, function($s) {
            return isset($s['total']) && $s['total'] > 0;
        });

        // Calculate performance
        $average = 0;
        $grade = 'N/A';
        $totalObtained = 0;

        if (count($validSubjects) > 0) {
            $totalObtained = array_sum(array_column($validSubjects, 'total'));
            $average = $totalObtained / count($validSubjects);
            $gradeInfo = getGradeAndRemark($average, $gradingScale);
            $grade = $gradeInfo['grade'];
        }

        // Get attendance for this term
        $attendanceQuery = "SELECT * FROM attendance WHERE student_id = ?";
        $attendanceStmt = $db->prepare($attendanceQuery);
        $attendanceStmt->execute([$card['id']]);
        $attendance = $attendanceStmt->fetch(PDO::FETCH_ASSOC);

        $attendanceRate = 0;
        if ($attendance && $attendance['no_of_times_school_opened'] > 0) {
            $attendanceRate = round(
                ($attendance['no_of_times_present'] / $attendance['no_of_times_school_opened']) * 100,
                2
            );
        }

        $history[] = [
            'report_id' => (int)$card['id'],
            'session' => $card['session'],
            'term' => $card['term'],
            'class' => $card['class'],
            'average_score' => round($average, 2),
            'grade' => $grade,
            'total_obtained' => round($totalObtained),
            'subjects_count' => count($validSubjects),
            'attendance_rate' => $attendanceRate,
            'date' => $card['created_at']
        ];
    }

    // Calculate trends
    $trends = [
        'improving' => false,
        'declining' => false,
        'stable' => false,
        'message' => ''
    ];

    if (count($history) >= 2) {
        $latest = $history[0]['average_score'];
        $previous = $history[1]['average_score'];
        $difference = $latest - $previous;

        if ($difference > 5) {
            $trends['improving'] = true;
            $trends['message'] = "Performance improved by " . round($difference, 1) . " points";
        } elseif ($difference < -5) {
            $trends['declining'] = true;
            $trends['message'] = "Performance declined by " . round(abs($difference), 1) . " points";
        } else {
            $trends['stable'] = true;
            $trends['message'] = "Performance is stable";
        }
    }

    // Student basic info
    $studentInfo = [
        'name' => $reportCards[0]['name'],
        'admission_no' => $reportCards[0]['admission_no'],
        'current_class' => $reportCards[0]['class'],
        'school_name' => $reportCards[0]['school_name']
    ];

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'data' => [
            'student' => $studentInfo,
            'history' => $history,
            'trends' => $trends,
            'total_reports' => count($history)
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error occurred',
        'error' => $e->getMessage()
    ]);
}
?>
