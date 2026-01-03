<?php
/**
 * Get My Classes Route
 * Returns classes assigned to the authenticated teacher
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

    // Get classes assigned to this teacher with student counts
    // Note: student_count shows current students in this class (not session/term specific)
    $query = "SELECT tc.id, tc.class_name, tc.session, tc.term, tc.created_at,
              COUNT(DISTINCT s.id) as student_count
              FROM teacher_classes tc
              LEFT JOIN students s ON tc.class_name = s.current_class
                  AND s.school_id = tc.school_id
              WHERE tc.teacher_id = ?
              GROUP BY tc.id, tc.class_name, tc.session, tc.term
              ORDER BY tc.session DESC, tc.term ASC, tc.class_name ASC";

    $stmt = $db->prepare($query);
    $stmt->execute([$_SESSION['teacher_id']]);
    $classes = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'classes' => $classes
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>
