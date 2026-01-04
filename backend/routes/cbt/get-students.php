<?php
/**
 * Get Students for CBT Exam Assignment
 * Teachers and School Admins can get list of students to assign exams
 */

// Check if teacher or school admin is authenticated
$isTeacher = isset($_SESSION['user_type']) && $_SESSION['user_type'] === 'teacher' && isset($_SESSION['teacher_id']);
$isSchool = isset($_SESSION['user_type']) && $_SESSION['user_type'] === 'school' && isset($_SESSION['school_id']);

if (!$isTeacher && !$isSchool) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized - Teacher or School access required']);
    exit;
}

// Set user context
$userId = $isTeacher ? $_SESSION['teacher_id'] : null;
$schoolId = $isTeacher ? $_SESSION['school_id'] : $_SESSION['school_id'];

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$database = new Database();
$db = $database->getConnection();

try {
    $className = $_GET['class_name'] ?? '';
    $session = $_GET['session'] ?? '';
    $term = $_GET['term'] ?? '';

    if (empty($className) || empty($session) || empty($term)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Class name, session, and term are required']);
        exit;
    }

    // Verify teacher teaches this class (term-independent; school admins can access all classes)
    if ($isTeacher) {
        $teacherClassQuery = "SELECT id FROM teacher_classes
                              WHERE teacher_id = ?
                              AND TRIM(LOWER(class_name)) = LOWER(?)
                              AND TRIM(LOWER(session)) = LOWER(?)
                              AND school_id = ?";
        $teacherClassStmt = $db->prepare($teacherClassQuery);
        $teacherClassStmt->execute([$userId, trim($className), trim($session), $schoolId]);

        if (!$teacherClassStmt->fetch()) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'You are not assigned to teach this class']);
            exit;
        }
    }

    // Get students in this class
    // If teacher has subject assignment, filter by subject enrollment
    // Otherwise show all students in class
    $teacherSubject = null;
    if ($isTeacher) {
        $teacherSubjectQuery = "SELECT subject FROM teacher_classes
                                WHERE teacher_id = ? AND class_name = ? AND session = ?
                                LIMIT 1";
        $teacherSubjectStmt = $db->prepare($teacherSubjectQuery);
        $teacherSubjectStmt->execute([$userId, $className, $session]);
        $result = $teacherSubjectStmt->fetch(PDO::FETCH_ASSOC);
        $teacherSubject = $result ? $result['subject'] : null;
    }

    $query = "SELECT DISTINCT s.id, s.name, s.admission_no, s.current_class as class_name
              FROM students s
              WHERE s.school_id = ? AND s.current_class = ?";

    // If teacher has a specific subject, filter by enrollment
    if ($isTeacher && $teacherSubject) {
        $query .= " AND EXISTS (
                        SELECT 1 FROM student_subject_enrollment sse
                        WHERE sse.student_id = s.id
                        AND sse.subject_name = ?
                        AND sse.session = ?
                    )";
        $query .= " ORDER BY s.name ASC";
        $stmt = $db->prepare($query);
        $stmt->execute([$schoolId, $className, $teacherSubject, $session]);
    } else {
        $query .= " ORDER BY s.name ASC";
        $stmt = $db->prepare($query);
        $stmt->execute([$schoolId, $className]);
    }

    $students = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'students' => $students,
        'total' => count($students)
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>
