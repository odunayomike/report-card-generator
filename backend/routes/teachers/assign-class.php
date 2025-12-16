<?php
/**
 * Assign Class to Teacher Route
 * Allows schools to assign classes to teachers
 */

// Check if school is authenticated
if (!isset($_SESSION['user_type']) || $_SESSION['user_type'] !== 'school' || !isset($_SESSION['school_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized - School access required']);
    exit;
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

$teacherId = intval($input['teacher_id'] ?? 0);
$classes = $input['classes'] ?? []; // Array of class assignments

// Validate input
if (!$teacherId) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Teacher ID is required']);
    exit;
}

if (!is_array($classes)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Classes must be an array']);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();

    // Verify teacher belongs to this school
    $checkQuery = "SELECT id FROM teachers WHERE id = ? AND school_id = ?";
    $checkStmt = $db->prepare($checkQuery);
    $checkStmt->execute([$teacherId, $_SESSION['school_id']]);

    if (!$checkStmt->fetch()) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Teacher not found']);
        exit;
    }

    // Delete existing class assignments for this teacher
    $deleteQuery = "DELETE FROM teacher_classes WHERE teacher_id = ?";
    $deleteStmt = $db->prepare($deleteQuery);
    $deleteStmt->execute([$teacherId]);

    // Insert new class assignments
    if (!empty($classes)) {
        $insertQuery = "INSERT INTO teacher_classes (teacher_id, class_name, school_id, session, term)
                        VALUES (?, ?, ?, ?, ?)";
        $insertStmt = $db->prepare($insertQuery);

        foreach ($classes as $class) {
            $className = trim($class['class_name'] ?? '');
            $session = trim($class['session'] ?? '');
            $term = trim($class['term'] ?? '');

            if (!empty($className) && !empty($session) && !empty($term)) {
                $insertStmt->execute([$teacherId, $className, $_SESSION['school_id'], $session, $term]);
            }
        }
    }

    echo json_encode([
        'success' => true,
        'message' => 'Classes assigned successfully'
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>
