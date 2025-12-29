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
        // Teachers only see students in their assigned classes (term-independent)
        // Get unique students by admission number with their most recent report
        $query = "SELECT s.admission_no, s.name, s.gender,
                  MAX(s.created_at) as latest_report_date,
                  COUNT(s.id) as total_reports,
                  GROUP_CONCAT(DISTINCT s.class ORDER BY s.created_at DESC SEPARATOR ', ') as classes,
                  (SELECT s2.class FROM students s2 WHERE s2.admission_no = s.admission_no AND s2.school_id = :school_id ORDER BY s2.created_at DESC LIMIT 1) as current_class
                  FROM students s
                  INNER JOIN teacher_classes tc ON TRIM(LOWER(s.class)) = TRIM(LOWER(tc.class_name))
                      AND TRIM(LOWER(s.session)) = TRIM(LOWER(tc.session))
                  WHERE s.school_id = :school_id
                      AND tc.teacher_id = :teacher_id
                  GROUP BY s.admission_no, s.name, s.gender
                  ORDER BY latest_report_date DESC";

        $stmt = $db->prepare($query);
        $stmt->execute([
            ':school_id' => $school_id,
            ':teacher_id' => $_SESSION['teacher_id']
        ]);
        $students = $stmt->fetchAll();
    } else {
        // Schools see all unique students
        // Get unique students by admission number with their most recent report info
        $query = "SELECT s.admission_no, s.name, s.gender,
                  MAX(s.created_at) as latest_report_date,
                  COUNT(s.id) as total_reports,
                  GROUP_CONCAT(DISTINCT s.class ORDER BY s.created_at DESC SEPARATOR ', ') as classes,
                  (SELECT s2.class FROM students s2 WHERE s2.admission_no = s.admission_no AND s2.school_id = :school_id ORDER BY s2.created_at DESC LIMIT 1) as current_class
                  FROM students s
                  WHERE s.school_id = :school_id
                  GROUP BY s.admission_no, s.name, s.gender
                  ORDER BY latest_report_date DESC";

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
