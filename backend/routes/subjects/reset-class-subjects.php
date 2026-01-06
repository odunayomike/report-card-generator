<?php
/**
 * Reset Class Subjects Configuration
 * Deletes custom subjects for a class so it falls back to defaults
 */

// Check authentication
if (!isset($_SESSION['school_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$className = $input['class_name'] ?? '';

if (empty($className)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Class name is required']);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();
    $schoolId = $_SESSION['school_id'];

    // Delete all configured subjects for this class
    $query = "DELETE FROM class_subjects WHERE school_id = ? AND class_name = ?";
    $stmt = $db->prepare($query);
    $stmt->execute([$schoolId, $className]);

    $deletedCount = $stmt->rowCount();

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => "Reset complete. Deleted {$deletedCount} custom subject(s). Class will now use default subjects.",
        'deleted_count' => $deletedCount
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error resetting subjects: ' . $e->getMessage()
    ]);
}
?>
