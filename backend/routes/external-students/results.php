<?php
/**
 * Get External Student Results
 * View exam results and performance for external students (Admin)
 */

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Check if school admin is authenticated
if (!isset($_SESSION['user_type']) || $_SESSION['user_type'] !== 'school' || !isset($_SESSION['school_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized. School admin access required.']);
    exit;
}

require_once __DIR__ . '/../../config/database.php';

try {
    $schoolId = $_SESSION['school_id'];
    $externalStudentId = isset($_GET['external_student_id']) ? intval($_GET['external_student_id']) : null;

    if (!$externalStudentId) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'external_student_id is required'
        ]);
        exit;
    }

    $database = new Database();
    $db = $database->getConnection();

    // Get external student data
    $studentQuery = "SELECT * FROM external_students WHERE id = ? AND school_id = ?";
    $studentStmt = $db->prepare($studentQuery);
    $studentStmt->execute([$externalStudentId, $schoolId]);
    $student = $studentStmt->fetch(PDO::FETCH_ASSOC);

    if (!$student) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'External student not found'
        ]);
        exit;
    }

    // Get all exam attempts with results
    $attemptsQuery = "SELECT sa.*, e.exam_title, e.subject, e.total_marks, e.duration_minutes
                      FROM cbt_student_attempts sa
                      INNER JOIN cbt_exams e ON sa.exam_id = e.id
                      WHERE sa.external_student_id = ? AND sa.status = 'submitted'
                      ORDER BY sa.submitted_at DESC";
    $attemptsStmt = $db->prepare($attemptsQuery);
    $attemptsStmt->execute([$externalStudentId]);
    $attempts = $attemptsStmt->fetchAll(PDO::FETCH_ASSOC);

    // Calculate overall statistics
    $totalExams = count($attempts);
    $totalScore = 0;
    $totalPossibleMarks = 0;

    foreach ($attempts as &$attempt) {
        $attempt['total_score'] = (float)$attempt['total_score'];
        $attempt['percentage'] = (float)$attempt['percentage'];
        $attempt['time_taken_minutes'] = (int)$attempt['time_taken_minutes'];

        $totalScore += $attempt['total_score'];
        $totalPossibleMarks += $attempt['total_marks'];
    }

    $overallPercentage = $totalPossibleMarks > 0 ? ($totalScore / $totalPossibleMarks) * 100 : 0;

    // Update average score in external_students table
    if ($totalExams > 0) {
        $updateAvgQuery = "UPDATE external_students
                           SET average_score = ?,
                               total_exams_completed = ?
                           WHERE id = ?";
        $updateAvgStmt = $db->prepare($updateAvgQuery);
        $updateAvgStmt->execute([$overallPercentage, $totalExams, $externalStudentId]);
    }

    // Remove sensitive data
    unset($student['password_hash']);

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'data' => [
            'student' => [
                'id' => (int)$student['id'],
                'name' => $student['name'],
                'exam_code' => $student['exam_code'],
                'email' => $student['email'],
                'phone' => $student['phone'],
                'applying_for_class' => $student['applying_for_class'],
                'status' => $student['status'],
                'application_date' => $student['application_date']
            ],
            'statistics' => [
                'total_exams_assigned' => (int)$student['total_exams_assigned'],
                'total_exams_completed' => $totalExams,
                'pending_exams' => (int)$student['total_exams_assigned'] - $totalExams,
                'total_score' => round($totalScore, 2),
                'total_possible_marks' => $totalPossibleMarks,
                'overall_percentage' => round($overallPercentage, 2)
            ],
            'exam_results' => $attempts
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
