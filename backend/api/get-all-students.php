<?php
/**
 * Get All Students API Endpoint
 * Retrieves a list of all students
 */

require_once '../config/cors.php';
require_once '../config/database.php';

session_start();

// Debug: Log session data
error_log('Session ID: ' . session_id());
error_log('Session data: ' . print_r($_SESSION, true));

$database = new Database();
$db = $database->getConnection();

// Check if user is logged in
if (!isset($_SESSION['school_id'])) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'Unauthorized. Please login.',
        'debug' => [
            'session_id' => session_id(),
            'has_session' => !empty($_SESSION),
            'cookies' => isset($_COOKIE['PHPSESSID'])
        ]
    ]);
    exit();
}

$school_id = $_SESSION['school_id'];

try {
    $query = "SELECT id, name, class, session, admission_no, term, gender, created_at
              FROM students
              WHERE school_id = :school_id
              ORDER BY created_at DESC";

    $stmt = $db->prepare($query);
    $stmt->execute([':school_id' => $school_id]);
    $students = $stmt->fetchAll();

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'data' => $students,
        'count' => count($students)
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error retrieving students: ' . $e->getMessage()
    ]);
}
?>
