<?php
/**
 * Get Students Enrolled in a Specific Subject
 * Returns all students taking a particular subject in a given class and session
 */

// Check authentication
if (!isset($_SESSION['school_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$subjectName = $_GET['subject_name'] ?? '';
$className = $_GET['class_name'] ?? '';
$session = $_GET['session'] ?? '';

if (empty($subjectName)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Subject name is required']);
    exit;
}

if (empty($session)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Session is required']);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();

    $schoolId = $_SESSION['school_id'];

    // Build query based on whether class is specified
    $query = "SELECT DISTINCT
                s.id,
                s.name,
                s.admission_no,
                s.current_class,
                s.gender,
                sse.enrolled_at
              FROM student_subject_enrollment sse
              INNER JOIN students s ON sse.student_id = s.id
              WHERE sse.school_id = ?
                AND sse.subject_name = ?
                AND sse.session = ?";

    $params = [$schoolId, $subjectName, $session];

    // Add class filter if specified
    if (!empty($className)) {
        $query .= " AND s.current_class = ?";
        $params[] = $className;
    }

    $query .= " ORDER BY s.name ASC";

    $stmt = $db->prepare($query);
    $stmt->execute($params);
    $students = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Format students
    $formattedStudents = array_map(function($student) {
        return [
            'id' => (int)$student['id'],
            'name' => $student['name'],
            'admission_no' => $student['admission_no'],
            'current_class' => $student['current_class'],
            'gender' => $student['gender'],
            'enrolled_at' => $student['enrolled_at']
        ];
    }, $students);

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'data' => [
            'subject_name' => $subjectName,
            'session' => $session,
            'class_name' => $className ?: 'All classes',
            'students' => $formattedStudents,
            'total' => count($formattedStudents)
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error occurred',
        'error' => $e->getMessage()
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred',
        'error' => $e->getMessage()
    ]);
}
