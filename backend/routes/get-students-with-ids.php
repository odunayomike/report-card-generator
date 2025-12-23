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
    // Get unique students by admission_no with their latest record's ID
    $query = "SELECT
                s1.id,
                s1.admission_no,
                s1.name,
                s1.class,
                s1.session,
                s1.term,
                s1.gender,
                s1.guardian_email,
                s1.parent_email,
                s1.created_at
              FROM students s1
              INNER JOIN (
                SELECT admission_no, MAX(created_at) as max_date
                FROM students
                WHERE school_id = :school_id
                GROUP BY admission_no
              ) s2 ON s1.admission_no = s2.admission_no AND s1.created_at = s2.max_date
              WHERE s1.school_id = :school_id
              ORDER BY s1.name ASC";

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
