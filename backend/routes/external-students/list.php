<?php
/**
 * List External Students
 * Get all external students for a school (Admin only)
 */

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Check if school admin is authenticated
if (!isset($_SESSION['user_type']) || $_SESSION['user_type'] !== 'school' || !isset($_SESSION['school_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized. School admin access required.']);
    exit;
}

require_once __DIR__ . '/../../config/database.php';

try {
    $schoolId = $_SESSION['school_id'];

    // Get query parameters
    $status = isset($_GET['status']) ? $_GET['status'] : null;
    $applyingForClass = isset($_GET['class']) ? $_GET['class'] : null;
    $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 50;
    $offset = isset($_GET['offset']) ? intval($_GET['offset']) : 0;
    $search = isset($_GET['search']) ? trim($_GET['search']) : null;

    $database = new Database();
    $db = $database->getConnection();

    // Build query
    $query = "SELECT es.*,
                     COUNT(ea.id) as assigned_exams,
                     SUM(CASE WHEN ea.has_submitted = 1 THEN 1 ELSE 0 END) as completed_exams
              FROM external_students es
              LEFT JOIN cbt_exam_assignments ea ON es.id = ea.external_student_id
              WHERE es.school_id = ?";

    $params = [$schoolId];

    if ($status) {
        $query .= " AND es.status = ?";
        $params[] = $status;
    }

    if ($applyingForClass) {
        $query .= " AND es.applying_for_class = ?";
        $params[] = $applyingForClass;
    }

    if ($search) {
        $query .= " AND (es.name LIKE ? OR es.exam_code LIKE ? OR es.parent_name LIKE ?)";
        $searchParam = "%{$search}%";
        $params[] = $searchParam;
        $params[] = $searchParam;
        $params[] = $searchParam;
    }

    $query .= " GROUP BY es.id ORDER BY es.created_at DESC LIMIT $limit OFFSET $offset";

    $stmt = $db->prepare($query);
    $stmt->execute($params);
    $externalStudents = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Get total count
    $countQuery = "SELECT COUNT(DISTINCT es.id) as total
                   FROM external_students es
                   WHERE es.school_id = ?";
    $countParams = [$schoolId];

    if ($status) {
        $countQuery .= " AND es.status = ?";
        $countParams[] = $status;
    }

    if ($applyingForClass) {
        $countQuery .= " AND es.applying_for_class = ?";
        $countParams[] = $applyingForClass;
    }

    if ($search) {
        $countQuery .= " AND (es.name LIKE ? OR es.exam_code LIKE ? OR es.parent_name LIKE ?)";
        $countParams[] = $searchParam;
        $countParams[] = $searchParam;
        $countParams[] = $searchParam;
    }

    $countStmt = $db->prepare($countQuery);
    $countStmt->execute($countParams);
    $totalCount = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];

    // Format response
    foreach ($externalStudents as &$student) {
        $student['id'] = (int)$student['id'];
        $student['assigned_exams'] = (int)$student['assigned_exams'];
        $student['completed_exams'] = (int)$student['completed_exams'];
        $student['average_score'] = (float)$student['average_score'];
        // Remove sensitive data
        unset($student['password_hash']);
    }

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'data' => $externalStudents,
        'pagination' => [
            'total' => (int)$totalCount,
            'limit' => $limit,
            'offset' => $offset,
            'has_more' => ($offset + $limit) < $totalCount
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
