<?php
/**
 * Get All Students Route Handler
 * Supports both school and teacher access
 */

// Check authentication (either school or teacher)
if (!isset($_SESSION['user_type']) || !isset($_SESSION['school_id'])) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'Unauthorized. Please login.'
    ]);
    exit();
}

$userType = $_SESSION['user_type'];
$school_id = $_SESSION['school_id'];
$database = new Database();
$db = $database->getConnection();

try {
    if ($userType === 'teacher') {
        // Teachers only see students in their assigned classes
        $query = "SELECT DISTINCT s.id, s.name, s.class, s.session, s.admission_no, s.term, s.gender, s.created_at
                  FROM students s
                  INNER JOIN teacher_classes tc ON s.class = tc.class_name
                      AND s.session = tc.session
                      AND s.term = tc.term
                  WHERE s.school_id = :school_id
                      AND tc.teacher_id = :teacher_id
                  ORDER BY s.created_at DESC";

        $stmt = $db->prepare($query);
        $stmt->execute([
            ':school_id' => $school_id,
            ':teacher_id' => $_SESSION['teacher_id']
        ]);
        $students = $stmt->fetchAll();
    } else {
        // Schools see all students
        $query = "SELECT id, name, class, session, admission_no, term, gender, created_at
                  FROM students
                  WHERE school_id = :school_id
                  ORDER BY created_at DESC";

        $stmt = $db->prepare($query);
        $stmt->execute([':school_id' => $school_id]);
        $students = $stmt->fetchAll();
    }

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
