<?php
/**
 * Get Assigned Classes for Teacher
 * Returns unique class names that the authenticated teacher is assigned to
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

    // Get unique class names assigned to this teacher
    $query = "SELECT DISTINCT class_name
              FROM teacher_classes
              WHERE teacher_id = ?
              ORDER BY class_name ASC";

    $stmt = $db->prepare($query);
    $stmt->execute([$_SESSION['teacher_id']]);
    $classes = $stmt->fetchAll(PDO::FETCH_COLUMN);

    echo json_encode([
        'success' => true,
        'classes' => $classes
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>
