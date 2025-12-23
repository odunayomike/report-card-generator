<?php
/**
 * Get all parents linked to a specific student
 * For school admin use
 */

// Check authentication - must be school admin
if (!isset($_SESSION['school_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized - School login required']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

if (!isset($_GET['student_id'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Student ID is required']);
    exit;
}

$studentId = intval($_GET['student_id']);
$schoolId = $_SESSION['school_id'];

$database = new Database();
$db = $database->getConnection();

try {
    // First verify that the student belongs to this school
    $verifyQuery = "SELECT id, name FROM students WHERE id = ? AND school_id = ?";
    $verifyStmt = $db->prepare($verifyQuery);
    $verifyStmt->execute([$studentId, $schoolId]);
    $student = $verifyStmt->fetch(PDO::FETCH_ASSOC);

    if (!$student) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Student not found or does not belong to your school']);
        exit;
    }

    // Get all parents linked to this student
    $query = "SELECT
                p.id,
                p.email,
                p.name,
                p.phone,
                p.is_active,
                ps.relationship,
                ps.is_primary,
                ps.created_at
              FROM parent_students ps
              INNER JOIN parents p ON ps.parent_id = p.id
              WHERE ps.student_id = ?
              ORDER BY ps.is_primary DESC, ps.created_at ASC";

    $stmt = $db->prepare($query);
    $stmt->execute([$studentId]);
    $parents = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'student' => $student,
        'parents' => $parents,
        'count' => count($parents)
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
