<?php
/**
 * Remove/unlink a parent from a student
 * For school admin use
 */

// Check authentication - must be school admin
if (!isset($_SESSION['school_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized - School login required']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

if (!$data || !isset($data['student_id']) || !isset($data['parent_id'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Student ID and Parent ID are required']);
    exit;
}

$studentId = intval($data['student_id']);
$parentId = intval($data['parent_id']);
$schoolId = $_SESSION['school_id'];

$database = new Database();
$db = $database->getConnection();

try {
    $db->beginTransaction();

    // Verify that the student belongs to this school
    $verifyQuery = "SELECT id FROM students WHERE id = ? AND school_id = ?";
    $verifyStmt = $db->prepare($verifyQuery);
    $verifyStmt->execute([$studentId, $schoolId]);

    if (!$verifyStmt->fetch()) {
        $db->rollBack();
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Student not found or does not belong to your school']);
        exit;
    }

    // Check if relationship exists
    $checkQuery = "SELECT id FROM parent_students WHERE parent_id = ? AND student_id = ?";
    $checkStmt = $db->prepare($checkQuery);
    $checkStmt->execute([$parentId, $studentId]);

    if (!$checkStmt->fetch()) {
        $db->rollBack();
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Parent-student relationship not found']);
        exit;
    }

    // Remove the relationship
    $deleteQuery = "DELETE FROM parent_students WHERE parent_id = ? AND student_id = ?";
    $deleteStmt = $db->prepare($deleteQuery);
    $deleteStmt->execute([$parentId, $studentId]);

    // Update student's parent_email if this was the primary parent
    $updateQuery = "UPDATE students
                    SET parent_email = NULL
                    WHERE id = ?
                    AND parent_email = (SELECT email FROM parents WHERE id = ?)";
    $updateStmt = $db->prepare($updateQuery);
    $updateStmt->execute([$studentId, $parentId]);

    $db->commit();

    echo json_encode([
        'success' => true,
        'message' => 'Parent unlinked from student successfully'
    ]);

} catch (PDOException $e) {
    $db->rollBack();
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
