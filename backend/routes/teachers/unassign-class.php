<?php
/**
 * Unassign Class/Subject from Teacher
 * Removes a specific class or subject assignment from a teacher
 */

// Check if school is authenticated
if (!isset($_SESSION['user_type']) || $_SESSION['user_type'] !== 'school' || !isset($_SESSION['school_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized - School access required']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

$teacherId = $data['teacher_id'] ?? null;
$className = $data['class_name'] ?? null;
$session = $data['session'] ?? null;
$term = $data['term'] ?? null; // Optional - can be null for all-term assignments
$subject = $data['subject'] ?? null; // Can be null for full class assignment

// Validate required fields (term is now optional)
if (!$teacherId || !$className || !$session) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();

    // Verify the teacher belongs to this school
    $verifyQuery = "SELECT id FROM teachers WHERE id = ? AND school_id = ?";
    $verifyStmt = $db->prepare($verifyQuery);
    $verifyStmt->execute([$teacherId, $_SESSION['school_id']]);

    if (!$verifyStmt->fetch()) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Teacher not found or does not belong to this school']);
        exit;
    }

    // Build the DELETE query - handle optional term and subject
    $deleteQuery = "DELETE FROM teacher_classes WHERE teacher_id = ? AND class_name = ? AND session = ?";
    $params = [$teacherId, $className, $session];

    // Add term condition if provided
    if ($term !== null && $term !== '') {
        $deleteQuery .= " AND term = ?";
        $params[] = $term;
    } else {
        $deleteQuery .= " AND term IS NULL";
    }

    // Add subject condition
    if ($subject !== null && $subject !== '') {
        $deleteQuery .= " AND subject = ?";
        $params[] = $subject;
    } else {
        $deleteQuery .= " AND subject IS NULL";
    }

    $deleteStmt = $db->prepare($deleteQuery);
    $deleteStmt->execute($params);

    if ($deleteStmt->rowCount() > 0) {
        echo json_encode([
            'success' => true,
            'message' => 'Class assignment removed successfully'
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Assignment not found or already removed'
        ]);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
