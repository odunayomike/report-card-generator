<?php
/**
 * Get Assigned Subjects for Teacher
 * Returns unique subjects that the authenticated teacher is assigned to teach
 */

// Check if teacher is authenticated
if (!isset($_SESSION['user_type']) || $_SESSION['user_type'] !== 'teacher' || !isset($_SESSION['teacher_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized - Teacher access required']);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();

    // Get unique subjects assigned to this teacher
    $query = "SELECT DISTINCT subject
              FROM teacher_classes
              WHERE teacher_id = ? AND subject IS NOT NULL
              ORDER BY subject ASC";

    $stmt = $db->prepare($query);
    $stmt->execute([$_SESSION['teacher_id']]);
    $subjects = $stmt->fetchAll(PDO::FETCH_COLUMN);

    echo json_encode([
        'success' => true,
        'subjects' => $subjects
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>
