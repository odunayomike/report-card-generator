<?php
/**
 * Bulk Promote Students
 * Allows schools/teachers to promote multiple students at once
 * Can be used for end-of-year class transitions
 */

if (!isset($_SESSION['user_type']) || !isset($_SESSION['school_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$userType = $_SESSION['user_type'];
$schoolId = $_SESSION['school_id'];

$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid data provided']);
    exit;
}

// Validate required fields
if (empty($data['from_class']) || empty($data['session']) || empty($data['term'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'From class, session, and term are required']);
    exit;
}

// If teacher, verify they are assigned to this class
if ($userType === 'teacher') {
    $database = new Database();
    $db = $database->getConnection();

    $verifyQuery = "SELECT id FROM teacher_classes
                    WHERE teacher_id = ?
                    AND TRIM(LOWER(class_name)) = LOWER(?)
                    AND TRIM(LOWER(session)) = LOWER(?)";
    $verifyStmt = $db->prepare($verifyQuery);
    $verifyStmt->execute([$_SESSION['teacher_id'], trim($data['from_class']), trim($data['session'])]);

    if (!$verifyStmt->fetch()) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'You are not assigned to this class']);
        exit;
    }
}

try {
    $database = new Database();
    $db = $database->getConnection();

    require_once __DIR__ . '/../../utils/PromotionHelper.php';
    $promotionHelper = new PromotionHelper($db);

    $fromClass = $data['from_class'];
    $session = $data['session'];
    $term = $data['term'];
    $previewOnly = isset($data['preview_only']) && $data['preview_only'];

    // Get all students in the specified class for this session/term
    $studentsQuery = "SELECT DISTINCT
                      s.id as student_id,
                      s.admission_no,
                      s.name,
                      s.current_class,
                      rc.id as report_card_id,
                      rc.class,
                      rc.session,
                      rc.term
                      FROM students s
                      INNER JOIN report_cards rc ON s.admission_no = rc.student_admission_no
                      WHERE s.school_id = ?
                      AND rc.class = ?
                      AND rc.session = ?
                      AND rc.term = ?
                      ORDER BY s.name ASC";

    $stmt = $db->prepare($studentsQuery);
    $stmt->execute([$schoolId, $fromClass, $session, $term]);
    $students = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (empty($students)) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => "No students found in $fromClass for $session / $term"
        ]);
        exit;
    }

    $results = [];
    $promoted = 0;
    $retained = 0;
    $completed = 0;
    $errors = 0;

    // Process each student
    foreach ($students as $student) {
        $result = $promotionHelper->checkAndPromoteStudent(
            $student['report_card_id'],
            $schoolId,
            $student['student_id'],
            $student['admission_no'],
            $student['class'],
            $student['session'],
            $student['term']
        );

        // For preview mode, roll back after each check
        if ($previewOnly && isset($result['promoted']) && $result['promoted']) {
            // Revert the promotion
            $revertQuery = "UPDATE students SET current_class = ? WHERE id = ?";
            $revertStmt = $db->prepare($revertQuery);
            $revertStmt->execute([$fromClass, $student['student_id']]);
        }

        $results[] = [
            'student_id' => $student['student_id'],
            'admission_no' => $student['admission_no'],
            'name' => $student['name'],
            'from_class' => $result['from_class'] ?? $student['class'],
            'to_class' => $result['to_class'] ?? null,
            'average_score' => $result['average_score'] ?? null,
            'action' => $result['action'] ?? 'error',
            'reason' => $result['reason'] ?? 'Unknown error'
        ];

        if (isset($result['promoted']) && $result['promoted']) $promoted++;
        elseif (isset($result['retained']) && $result['retained']) $retained++;
        elseif (isset($result['completed']) && $result['completed']) $completed++;
        else $errors++;
    }

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => $previewOnly
            ? "Preview: $promoted would be promoted, $retained would be retained, $completed would graduate"
            : "Bulk promotion completed: $promoted promoted, $retained retained, $completed graduated",
        'preview_mode' => $previewOnly,
        'summary' => [
            'total' => count($students),
            'promoted' => $promoted,
            'retained' => $retained,
            'completed' => $completed,
            'errors' => $errors
        ],
        'results' => $results
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error processing bulk promotion: ' . $e->getMessage()
    ]);
}
