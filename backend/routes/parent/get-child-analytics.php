<?php
/**
 * Get Comprehensive Analytics for a Specific Child
 * Returns academic performance, attendance, behavior, and trends
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

// Get student ID from query parameter
$studentId = isset($_GET['student_id']) ? intval($_GET['student_id']) : 0;

if (!$studentId) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Student ID is required']);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();

    // Verify that this student belongs to the logged-in parent
    $verifyQuery = "SELECT student_id FROM parent_students
                    WHERE parent_id = ? AND student_id = ?";
    $verifyStmt = $db->prepare($verifyQuery);
    $verifyStmt->execute([$_SESSION['parent_id'], $studentId]);

    if (!$verifyStmt->fetch()) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Access denied']);
        exit;
    }

    // Get student basic information
    $studentQuery = "SELECT s.id, s.name, s.admission_no, s.current_class, s.gender, s.school_id,
                            sc.school_name, sc.logo as school_logo, sc.grading_scale
                     FROM students s
                     INNER JOIN schools sc ON s.school_id = sc.id
                     WHERE s.id = ?";
    $studentStmt = $db->prepare($studentQuery);
    $studentStmt->execute([$studentId]);
    $student = $studentStmt->fetch(PDO::FETCH_ASSOC);

    if (!$student) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Student not found']);
        exit;
    }

    // Get latest report card for session/term/photo
    $reportQuery = "SELECT id as report_card_id, session, term, student_photo
                    FROM report_cards
                    WHERE student_admission_no = ? AND school_id = ?
                    ORDER BY created_at DESC LIMIT 1";
    $reportStmt = $db->prepare($reportQuery);
    $reportStmt->execute([$student['admission_no'], $student['school_id']]);
    $latestReport = $reportStmt->fetch(PDO::FETCH_ASSOC);

    if (!$latestReport) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'No report cards found for this student']);
        exit;
    }

    $reportCardId = $latestReport['report_card_id'];

    // Parse grading scale
    $gradingScale = null;
    if (isset($student['grading_scale']) && $student['grading_scale']) {
        $gradingScale = json_decode($student['grading_scale'], true);
    }

    // Default grading scale
    $defaultGradingScale = [
        'A' => [75, 100],
        'B' => [65, 74],
        'C' => [55, 64],
        'D' => [45, 54],
        'F' => [0, 44]
    ];

    $gradingScale = $gradingScale ?: $defaultGradingScale;

    // Helper function to calculate grade
    function getGradeAndRemark($total, $gradingScale) {
        $score = floatval($total);

        if ($score >= $gradingScale['A'][0]) return ['grade' => 'A', 'remark' => 'EXCELLENT'];
        if ($score >= $gradingScale['B'][0]) return ['grade' => 'B', 'remark' => 'VERY GOOD'];
        if ($score >= $gradingScale['C'][0]) return ['grade' => 'C', 'remark' => 'GOOD'];
        if ($score >= $gradingScale['D'][0]) return ['grade' => 'D', 'remark' => 'FAIR'];
        return ['grade' => 'F', 'remark' => 'FAIL'];
    }

    // Get subjects and scores from latest report card
    $subjectsQuery = "SELECT subject_name, ca, exam, total
                      FROM subjects
                      WHERE report_card_id = ?
                      ORDER BY total DESC";
    $subjectsStmt = $db->prepare($subjectsQuery);
    $subjectsStmt->execute([$reportCardId]);
    $subjects = $subjectsStmt->fetchAll(PDO::FETCH_ASSOC);

    // Calculate performance metrics
    $validSubjects = array_filter($subjects, function($s) {
        return isset($s['total']) && $s['total'] > 0;
    });

    $performance = ['total' => 0, 'obtainable' => 0, 'average' => 0, 'grade' => 'N/A', 'remark' => 'N/A'];

    if (count($validSubjects) > 0) {
        $totalObtained = array_sum(array_column($validSubjects, 'total'));
        $totalObtainable = count($validSubjects) * 100;
        $average = $totalObtained / count($validSubjects);
        $gradeInfo = getGradeAndRemark($average, $gradingScale);

        $performance = [
            'total_obtained' => round($totalObtained),
            'total_obtainable' => $totalObtainable,
            'average' => round($average, 2),
            'percentage' => round($average, 2),
            'grade' => $gradeInfo['grade'],
            'remark' => $gradeInfo['remark']
        ];
    }

    // Calculate grade distribution
    $gradeCounts = ['A' => 0, 'B' => 0, 'C' => 0, 'D' => 0, 'F' => 0];
    foreach ($validSubjects as $subject) {
        $gradeInfo = getGradeAndRemark($subject['total'], $gradingScale);
        $gradeCounts[$gradeInfo['grade']]++;
    }

    // Get strongest and weakest subjects
    $strongest = null;
    $weakest = null;
    if (count($validSubjects) > 0) {
        $strongest = [
            'name' => $validSubjects[0]['subject_name'],
            'score' => floatval($validSubjects[0]['total'])
        ];
        $weakest = [
            'name' => end($validSubjects)['subject_name'],
            'score' => floatval(end($validSubjects)['total'])
        ];
    }

    // Get attendance data from latest report card
    $attendanceQuery = "SELECT * FROM attendance WHERE report_card_id = ?";
    $attendanceStmt = $db->prepare($attendanceQuery);
    $attendanceStmt->execute([$reportCardId]);
    $attendance = $attendanceStmt->fetch(PDO::FETCH_ASSOC);

    $attendanceData = [
        'school_opened' => $attendance ? (int)$attendance['no_of_times_school_opened'] : 0,
        'present' => $attendance ? (int)$attendance['no_of_times_present'] : 0,
        'absent' => $attendance ? (int)$attendance['no_of_times_absent'] : 0,
        'attendance_rate' => 0
    ];

    if ($attendanceData['school_opened'] > 0) {
        $attendanceData['attendance_rate'] = round(
            ($attendanceData['present'] / $attendanceData['school_opened']) * 100,
            2
        );
    }

    // Get affective domain (behavior/attitude) - uses student_id not report_card_id
    $affectiveQuery = "SELECT trait_name, rating FROM affective_domain WHERE student_id = ?";
    $affectiveStmt = $db->prepare($affectiveQuery);
    $affectiveStmt->execute([$studentId]);
    $affective = $affectiveStmt->fetchAll(PDO::FETCH_ASSOC);

    $affectiveData = array_map(function($item) {
        return [
            'trait' => $item['trait_name'],
            'rating' => (int)$item['rating']
        ];
    }, $affective);

    // Calculate average behavior rating
    $avgBehaviorRating = 0;
    if (count($affective) > 0) {
        $totalRating = array_sum(array_column($affective, 'rating'));
        $avgBehaviorRating = round($totalRating / count($affective), 1);
    }

    // Get psychomotor domain (skills) - uses student_id not report_card_id
    $psychomotorQuery = "SELECT skill_name, rating FROM psychomotor_domain WHERE student_id = ?";
    $psychomotorStmt = $db->prepare($psychomotorQuery);
    $psychomotorStmt->execute([$studentId]);
    $psychomotor = $psychomotorStmt->fetchAll(PDO::FETCH_ASSOC);

    $psychomotorData = array_map(function($item) {
        return [
            'skill' => $item['skill_name'],
            'rating' => (int)$item['rating']
        ];
    }, $psychomotor);

    // Get teacher and principal remarks from latest report card
    $remarksQuery = "SELECT * FROM remarks WHERE report_card_id = ?";
    $remarksStmt = $db->prepare($remarksQuery);
    $remarksStmt->execute([$reportCardId]);
    $remarks = $remarksStmt->fetch(PDO::FETCH_ASSOC);

    $remarksData = null;
    if ($remarks) {
        $remarksData = [
            'teacher' => [
                'name' => $remarks['teacher_name'],
                'remark' => $remarks['teacher_remark']
            ],
            'principal' => [
                'name' => $remarks['principal_name'],
                'remark' => $remarks['principal_remark']
            ],
            'next_term_begins' => $remarks['next_term_begins']
        ];
    }

    // Format subjects with grades
    $formattedSubjects = array_map(function($subject) use ($gradingScale) {
        $gradeInfo = getGradeAndRemark($subject['total'], $gradingScale);
        return [
            'name' => $subject['subject_name'],
            'ca' => floatval($subject['ca']),
            'exam' => floatval($subject['exam']),
            'total' => floatval($subject['total']),
            'grade' => $gradeInfo['grade'],
            'remark' => $gradeInfo['remark']
        ];
    }, $validSubjects);

    // Prepare final response
    $response = [
        'success' => true,
        'data' => [
            'student' => [
                'id' => (int)$student['id'],
                'name' => $student['name'],
                'class' => $student['current_class'],
                'session' => $latestReport['session'] ?? null,
                'term' => $latestReport['term'] ?? null,
                'admission_no' => $student['admission_no'],
                'gender' => $student['gender'],
                'photo' => $latestReport['student_photo'] ?? null,
                'school_name' => $student['school_name'],
                'school_logo' => $student['school_logo']
            ],
            'academic_performance' => [
                'overall' => $performance,
                'subjects' => $formattedSubjects,
                'subjects_count' => count($validSubjects),
                'grade_distribution' => $gradeCounts,
                'strongest_subject' => $strongest,
                'weakest_subject' => $weakest
            ],
            'attendance' => $attendanceData,
            'behavior' => [
                'traits' => $affectiveData,
                'average_rating' => $avgBehaviorRating
            ],
            'skills' => [
                'psychomotor' => $psychomotorData
            ],
            'remarks' => $remarksData,
            'grading_scale' => $gradingScale
        ]
    ];

    http_response_code(200);
    echo json_encode($response);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error occurred',
        'error' => $e->getMessage()
    ]);
}
?>
