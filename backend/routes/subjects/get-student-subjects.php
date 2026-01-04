<?php
/**
 * Get Subjects a Student is Enrolled In
 * Returns list of subjects for a specific student in a given session
 */

// Check authentication
if (!isset($_SESSION['school_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$studentId = isset($_GET['student_id']) ? intval($_GET['student_id']) : 0;
$session = $_GET['session'] ?? '';

if (!$studentId) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Student ID is required']);
    exit;
}

if (empty($session)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Session is required']);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();

    $schoolId = $_SESSION['school_id'];

    // Verify student belongs to this school
    $verifyQuery = "SELECT id, name, admission_no, current_class FROM students
                    WHERE id = ? AND school_id = ?";
    $verifyStmt = $db->prepare($verifyQuery);
    $verifyStmt->execute([$studentId, $schoolId]);
    $student = $verifyStmt->fetch(PDO::FETCH_ASSOC);

    if (!$student) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Student not found']);
        exit;
    }

    // Get enrolled subjects
    $query = "SELECT id, subject_name, enrolled_at
              FROM student_subject_enrollment
              WHERE student_id = ? AND session = ?
              ORDER BY subject_name ASC";

    $stmt = $db->prepare($query);
    $stmt->execute([$studentId, $session]);
    $enrollments = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Format subjects
    $subjects = array_map(function($enrollment) {
        return [
            'id' => (int)$enrollment['id'],
            'name' => $enrollment['subject_name'],
            'enrolled_at' => $enrollment['enrolled_at']
        ];
    }, $enrollments);

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'data' => [
            'student' => [
                'id' => (int)$student['id'],
                'name' => $student['name'],
                'admission_no' => $student['admission_no'],
                'current_class' => $student['current_class']
            ],
            'session' => $session,
            'subjects' => $subjects,
            'total' => count($subjects)
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error occurred',
        'error' => $e->getMessage()
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred',
        'error' => $e->getMessage()
    ]);
}
