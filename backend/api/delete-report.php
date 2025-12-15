<?php
/**
 * Delete Report Card API Endpoint
 * Deletes a student and all associated records
 */

require_once '../config/cors.php';
require_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

// Get student ID from query parameter
$student_id = isset($_GET['id']) ? intval($_GET['id']) : 0;

if ($student_id <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid student ID']);
    exit();
}

try {
    $query = "DELETE FROM students WHERE id = :id";
    $stmt = $db->prepare($query);
    $stmt->execute([':id' => $student_id]);

    if ($stmt->rowCount() > 0) {
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Report card deleted successfully'
        ]);
    } else {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Student not found'
        ]);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error deleting report card: ' . $e->getMessage()
    ]);
}
?>
