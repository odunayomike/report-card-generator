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
        // Check if teacher_id is set
        if (!isset($_SESSION['teacher_id'])) {
            http_response_code(401);
            echo json_encode([
                'success' => false,
                'message' => 'Teacher ID not found in session. Please login again.'
            ]);
            exit();
        }

        // Teachers see all students in their assigned classes
        // They can manage subject enrollment for any student in their classes
        $query = "SELECT DISTINCT
                  s.id,
                  s.admission_no,
                  s.name,
                  s.gender,
                  s.current_class,
                  s.updated_at as latest_update_date,
                  (SELECT COUNT(*) FROM report_cards rc WHERE rc.student_admission_no = s.admission_no AND rc.school_id = s.school_id) as total_reports,
                  (SELECT GROUP_CONCAT(DISTINCT rc2.class ORDER BY rc2.created_at DESC SEPARATOR ', ')
                   FROM report_cards rc2 WHERE rc2.student_admission_no = s.admission_no AND rc2.school_id = s.school_id) as classes
                  FROM students s
                  INNER JOIN teacher_classes tc ON LOWER(TRIM(s.current_class)) = LOWER(TRIM(tc.class_name))
                      AND s.school_id = tc.school_id
                  WHERE s.school_id = :school_id
                      AND tc.teacher_id = :teacher_id
                  ORDER BY s.current_class ASC, s.name ASC";

        $stmt = $db->prepare($query);
        $stmt->execute([
            ':school_id' => $school_id,
            ':teacher_id' => $_SESSION['teacher_id']
        ]);
        $students = $stmt->fetchAll();
    } else {
        // Schools see all students
        // Get all students from master table with report count
        $query = "SELECT
                  s.id,
                  s.admission_no,
                  s.name,
                  s.gender,
                  s.current_class,
                  s.updated_at as latest_update_date,
                  (SELECT COUNT(*) FROM report_cards rc WHERE rc.student_admission_no = s.admission_no AND rc.school_id = s.school_id) as total_reports,
                  (SELECT GROUP_CONCAT(DISTINCT rc2.class ORDER BY rc2.created_at DESC SEPARATOR ', ')
                   FROM report_cards rc2 WHERE rc2.student_admission_no = s.admission_no AND rc2.school_id = s.school_id) as classes
                  FROM students s
                  WHERE s.school_id = :school_id
                  ORDER BY s.updated_at DESC";

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
