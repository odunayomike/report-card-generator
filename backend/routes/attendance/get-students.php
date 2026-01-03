<?php
/**
 * Get Students for Attendance Route
 * Returns students in teacher's assigned class for attendance marking
 */

// Check if teacher is authenticated
if (!isset($_SESSION['user_type']) || $_SESSION['user_type'] !== 'teacher' || !isset($_SESSION['teacher_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized - Teacher access required']);
    exit;
}

// Get query parameters
$className = $_GET['class'] ?? '';
$session = $_GET['session'] ?? '';
$term = $_GET['term'] ?? '';

// Validate input
if (empty($className) || empty($session) || empty($term)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Class, session, and term are required']);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();

    // Verify teacher is assigned to this class (term-independent)
    $checkQuery = "SELECT id FROM teacher_classes
                   WHERE teacher_id = ?
                   AND TRIM(LOWER(class_name)) = LOWER(?)
                   AND TRIM(LOWER(session)) = LOWER(?)";
    $checkStmt = $db->prepare($checkQuery);
    $checkStmt->execute([$_SESSION['teacher_id'], trim($className), trim($session)]);

    if (!$checkStmt->fetch()) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'You are not assigned to this class']);
        exit;
    }

    // Get all students in this class (using current_class from students table)
    $query = "SELECT id, name, admission_no, gender
              FROM students
              WHERE school_id = ? AND current_class = ?
              ORDER BY name ASC";

    $stmt = $db->prepare($query);
    $stmt->execute([$_SESSION['school_id'], $className]);
    $students = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Get photos from the most recent report card for each student
    foreach ($students as &$student) {
        $photoQuery = "SELECT student_photo FROM report_cards
                       WHERE student_admission_no = ?
                       AND student_photo IS NOT NULL
                       ORDER BY created_at DESC LIMIT 1";
        $photoStmt = $db->prepare($photoQuery);
        $photoStmt->execute([$student['admission_no']]);
        $photoResult = $photoStmt->fetch(PDO::FETCH_ASSOC);
        $student['photo'] = $photoResult ? $photoResult['student_photo'] : null;
    }

    echo json_encode([
        'success' => true,
        'students' => $students
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>
