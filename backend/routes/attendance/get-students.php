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

    // Verify teacher is assigned to this class
    $checkQuery = "SELECT id FROM teacher_classes
                   WHERE teacher_id = ? AND class_name = ? AND session = ? AND term = ?";
    $checkStmt = $db->prepare($checkQuery);
    $checkStmt->execute([$_SESSION['teacher_id'], $className, $session, $term]);

    if (!$checkStmt->fetch()) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'You are not assigned to this class']);
        exit;
    }

    // Get all students in this class
    $query = "SELECT id, name, admission_no, gender, photo
              FROM students
              WHERE school_id = ? AND class = ? AND session = ? AND term = ?
              ORDER BY name ASC";

    $stmt = $db->prepare($query);
    $stmt->execute([$_SESSION['school_id'], $className, $session, $term]);
    $students = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'students' => $students
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>
