<?php
/**
 * CBT Exam Results List
 * Shows all student exam attempts and results
 * Teachers see only their class students, School admins see all
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

$database = new Database();
$db = $database->getConnection();

try {
    // Get filter parameters
    $classFilter = $_GET['class'] ?? null;
    $subjectFilter = $_GET['subject'] ?? null;
    $examIdFilter = $_GET['exam_id'] ?? null;
    $statusFilter = $_GET['status'] ?? null;

    // Base query - get all exam attempts with student and exam details
    $query = "SELECT
                a.id,
                a.student_id,
                a.exam_id,
                a.status,
                a.total_score as score,
                a.percentage,
                a.started_at,
                a.submitted_at,
                s.name as student_name,
                s.admission_no,
                s.class,
                e.exam_title,
                e.subject,
                e.assessment_type,
                e.total_marks,
                e.session,
                e.term
              FROM cbt_student_attempts a
              INNER JOIN students s ON a.student_id = s.id
              INNER JOIN cbt_exams e ON a.exam_id = e.id
              WHERE e.school_id = ?";

    $params = [$schoolId];

    // For teachers, only show results for their created exams
    if ($isTeacher) {
        $query .= " AND e.created_by = ?";
        $params[] = $userId;
    }

    // Apply filters
    if ($classFilter) {
        $query .= " AND s.class = ?";
        $params[] = $classFilter;
    }

    if ($subjectFilter) {
        $query .= " AND e.subject = ?";
        $params[] = $subjectFilter;
    }

    if ($examIdFilter) {
        $query .= " AND e.id = ?";
        $params[] = intval($examIdFilter);
    }

    if ($statusFilter) {
        $query .= " AND a.status = ?";
        $params[] = $statusFilter;
    }

    // Order by most recent first
    $query .= " ORDER BY a.started_at DESC";

    $stmt = $db->prepare($query);
    $stmt->execute($params);
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Format the results
    foreach ($results as &$result) {
        $result['score'] = floatval($result['score']);
        $result['percentage'] = floatval($result['percentage']);
        $result['total_marks'] = floatval($result['total_marks']);
    }

    echo json_encode([
        'success' => true,
        'results' => $results,
        'total' => count($results)
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
