<?php
/**
 * Check External Student Session
 * Validates if external student is authenticated
 */

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

require_once __DIR__ . '/../../config/database.php';

try {
    // Check if session exists
    if (!isset($_SESSION['user_type']) || $_SESSION['user_type'] !== 'external_student' || !isset($_SESSION['external_student_id'])) {
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'authenticated' => false,
            'message' => 'No active session'
        ]);
        exit;
    }

    $externalStudentId = $_SESSION['external_student_id'];

    $database = new Database();
    $db = $database->getConnection();

    // Fetch current external student data
    $query = "SELECT es.*,
                     sch.school_name,
                     sch.logo
              FROM external_students es
              INNER JOIN schools sch ON es.school_id = sch.id
              WHERE es.id = ?";

    $stmt = $db->prepare($query);
    $stmt->execute([$externalStudentId]);
    $externalStudent = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$externalStudent) {
        // External student not found, destroy session
        session_destroy();
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'authenticated' => false,
            'message' => 'External student account not found'
        ]);
        exit;
    }

    // Check if converted
    if ($externalStudent['status'] === 'converted') {
        session_destroy();
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'authenticated' => false,
            'message' => 'Account has been converted. Please use student login.',
            'converted' => true,
            'student_id' => $externalStudent['converted_to_student_id']
        ]);
        exit;
    }

    // Get exam statistics
    $examCountQuery = "SELECT COUNT(*) as total_assigned,
                              SUM(CASE WHEN has_submitted = 1 THEN 1 ELSE 0 END) as total_completed
                       FROM cbt_exam_assignments
                       WHERE external_student_id = ?";
    $examStmt = $db->prepare($examCountQuery);
    $examStmt->execute([$externalStudentId]);
    $examStats = $examStmt->fetch(PDO::FETCH_ASSOC);

    // Return authenticated session
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'authenticated' => true,
        'data' => [
            'external_student' => [
                'id' => (int)$externalStudent['id'],
                'name' => $externalStudent['name'],
                'email' => $externalStudent['email'],
                'phone' => $externalStudent['phone'],
                'exam_code' => $externalStudent['exam_code'],
                'applying_for_class' => $externalStudent['applying_for_class'],
                'status' => $externalStudent['status'],
                'application_date' => $externalStudent['application_date'],
                'average_score' => (float)$externalStudent['average_score']
            ],
            'school' => [
                'id' => (int)$externalStudent['school_id'],
                'name' => $externalStudent['school_name'],
                'logo' => $externalStudent['logo']
            ],
            'exam_stats' => [
                'total_assigned' => (int)$examStats['total_assigned'],
                'total_completed' => (int)$examStats['total_completed'],
                'pending' => (int)$examStats['total_assigned'] - (int)$examStats['total_completed']
            ]
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
