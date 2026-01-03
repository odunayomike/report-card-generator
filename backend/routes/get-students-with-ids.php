<?php
/**
 * Get All Students with IDs (for parent management)
 * Returns actual student records with IDs, not grouped
 */

// Check authentication
if (!isset($_SESSION['user_type']) || !isset($_SESSION['school_id'])) {
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
    // Get all students (one record per student in new structure)
    $query = "SELECT
                id,
                admission_no,
                name,
                current_class as class,
                gender,
                guardian_email,
                created_at
              FROM students
              WHERE school_id = :school_id
              ORDER BY name ASC";

    $stmt = $db->prepare($query);
    $stmt->execute([':school_id' => $school_id]);
    $students = $stmt->fetchAll(PDO::FETCH_ASSOC);

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
