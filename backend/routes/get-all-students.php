<?php
/**
 * Get All Students Route Handler
 */

// Check if user is logged in
if (!isset($_SESSION['school_id'])) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'Unauthorized. Please login.'
    ]);
    exit();
}

$school_id = $_SESSION['school_id'];
$database = new Database();
$db = $database->getConnection();

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
