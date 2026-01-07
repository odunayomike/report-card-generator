<?php
/**
 * External Student Login
 * Authentication for prospective students taking entrance exams
 */

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

require_once __DIR__ . '/../../config/database.php';

try {
    $input = json_decode(file_get_contents('php://input'), true);

    // Validate input
    if (!isset($input['exam_code']) || empty(trim($input['exam_code']))) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Exam code is required']);
        exit;
    }

    if (!isset($input['password']) || empty($input['password'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Password is required']);
        exit;
    }

    $examCode = trim($input['exam_code']);
    $password = $input['password'];

    $database = new Database();
    $db = $database->getConnection();

    // Find external student by exam code
    $query = "SELECT es.*,
                     sch.school_name,
                     sch.logo
              FROM external_students es
              INNER JOIN schools sch ON es.school_id = sch.id
              WHERE es.exam_code = ?";

    $stmt = $db->prepare($query);
    $stmt->execute([$examCode]);
    $externalStudent = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$externalStudent) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Invalid exam code or password'
        ]);
        exit;
    }

    // Verify password
    if (!password_verify($password, $externalStudent['password_hash'])) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Invalid exam code or password'
        ]);
        exit;
    }

    // Check if already converted
    if ($externalStudent['status'] === 'converted') {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'message' => 'This account has been converted to a regular student account. Please use the student login.'
        ]);
        exit;
    }

    // Set session
    $_SESSION['user_type'] = 'external_student';
    $_SESSION['external_student_id'] = $externalStudent['id'];
    $_SESSION['school_id'] = $externalStudent['school_id'];
    $_SESSION['exam_code'] = $externalStudent['exam_code'];

    // Log login activity
    logActivity(
        $db,
        $externalStudent['id'],
        $externalStudent['school_id'],
        'login',
        "External student logged in: {$externalStudent['name']}",
        $_SERVER['REMOTE_ADDR'] ?? null,
        $_SERVER['HTTP_USER_AGENT'] ?? null
    );

    // Get assigned exams count
    $examCountQuery = "SELECT COUNT(*) as total_assigned,
                              SUM(CASE WHEN has_submitted = 1 THEN 1 ELSE 0 END) as total_completed
                       FROM cbt_exam_assignments
                       WHERE external_student_id = ?";
    $examStmt = $db->prepare($examCountQuery);
    $examStmt->execute([$externalStudent['id']]);
    $examStats = $examStmt->fetch(PDO::FETCH_ASSOC);

    // Prepare response
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Login successful',
        'data' => [
            'external_student' => [
                'id' => (int)$externalStudent['id'],
                'name' => $externalStudent['name'],
                'email' => $externalStudent['email'],
                'phone' => $externalStudent['phone'],
                'exam_code' => $externalStudent['exam_code'],
                'applying_for_class' => $externalStudent['applying_for_class'],
                'status' => $externalStudent['status'],
                'application_date' => $externalStudent['application_date']
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
            ],
            'session_token' => session_id()
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}

/**
 * Log external student activity
 */
function logActivity($db, $externalStudentId, $schoolId, $activityType, $details, $ipAddress, $userAgent = null) {
    try {
        $query = "INSERT INTO external_student_activity_log
                  (external_student_id, school_id, activity_type, details, ip_address, user_agent)
                  VALUES (?, ?, ?, ?, ?, ?)";
        $stmt = $db->prepare($query);
        $stmt->execute([$externalStudentId, $schoolId, $activityType, $details, $ipAddress, $userAgent]);
    } catch (PDOException $e) {
        error_log("Failed to log activity: " . $e->getMessage());
    }
}
?>
