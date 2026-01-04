<?php
/**
 * Get All Teachers Route
 * Returns all teachers for the authenticated school
 */

// Check if school is authenticated
if (!isset($_SESSION['user_type']) || $_SESSION['user_type'] !== 'school' || !isset($_SESSION['school_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized - School access required']);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();

    // Get all teachers for this school with their assigned classes
    $query = "SELECT t.id, t.name, t.email, t.phone, t.is_active, t.created_at,
              GROUP_CONCAT(
                  DISTINCT CONCAT(tc.class_name, '|', tc.session, '|', IFNULL(tc.term, ''), '|', IFNULL(tc.subject, ''))
                  SEPARATOR ';;'
              ) as classes
              FROM teachers t
              LEFT JOIN teacher_classes tc ON t.id = tc.teacher_id
              WHERE t.school_id = ?
              GROUP BY t.id
              ORDER BY t.name ASC";

    $stmt = $db->prepare($query);
    $stmt->execute([$_SESSION['school_id']]);
    $teachers = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Parse classes for each teacher
    foreach ($teachers as &$teacher) {
        $classesArray = [];

        if (!empty($teacher['classes'])) {
            $classesList = explode(';;', $teacher['classes']);
            foreach ($classesList as $classInfo) {
                $parts = explode('|', $classInfo);
                if (count($parts) === 4) {
                    $classData = [
                        'class_name' => $parts[0],
                        'session' => $parts[1],
                        'term' => $parts[2]
                    ];
                    // Only add subject if it's not empty
                    if (!empty($parts[3])) {
                        $classData['subject'] = $parts[3];
                    }
                    $classesArray[] = $classData;
                }
            }
        }

        $teacher['classes'] = $classesArray;
    }

    echo json_encode([
        'success' => true,
        'teachers' => $teachers
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>
