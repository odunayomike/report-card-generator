<?php
/**
 * Create Student Profile (without report)
 * Allows schools and teachers to create student profiles independently
 */

// Check authentication
if (!isset($_SESSION['user_type']) || !isset($_SESSION['school_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized - Please log in']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$userType = $_SESSION['user_type'];
$schoolId = $_SESSION['school_id'];

$database = new Database();
$db = $database->getConnection();

// Get posted data
$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid data provided']);
    exit;
}

// Validate required fields
$requiredFields = ['name', 'admission_no', 'class', 'session', 'term', 'gender'];
foreach ($requiredFields as $field) {
    if (empty($data[$field])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => "Field '$field' is required"]);
        exit;
    }
}

// If teacher, verify they are assigned to this class
if ($userType === 'teacher') {
    $verifyQuery = "SELECT id FROM teacher_classes
                    WHERE teacher_id = ? AND class_name = ? AND session = ? AND term = ?";
    $verifyStmt = $db->prepare($verifyQuery);
    $verifyStmt->execute([$_SESSION['teacher_id'], $data['class'], $data['session'], $data['term']]);

    if (!$verifyStmt->fetch()) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'You are not assigned to this class']);
        exit;
    }
}

try {
    // Check if student with same admission number already exists for this school
    $checkQuery = "SELECT id FROM students
                   WHERE school_id = ? AND admission_no = ?";
    $checkStmt = $db->prepare($checkQuery);
    $checkStmt->execute([$schoolId, $data['admission_no']]);

    if ($checkStmt->fetch()) {
        http_response_code(409);
        echo json_encode([
            'success' => false,
            'message' => 'A student with this admission number already exists'
        ]);
        exit;
    }

    // Insert new student
    $query = "INSERT INTO students
              (school_id, name, admission_no, class, session, term, gender, guardian_email, height, weight, club_society, fav_col, photo)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

    $stmt = $db->prepare($query);
    $success = $stmt->execute([
        $schoolId,
        $data['name'],
        $data['admission_no'],
        $data['class'],
        $data['session'],
        $data['term'],
        $data['gender'],
        $data['guardian_email'] ?? null,
        $data['height'] ?? null,
        $data['weight'] ?? null,
        $data['club_society'] ?? null,
        $data['fav_col'] ?? null,
        $data['photo'] ?? null
    ]);

    if ($success) {
        $student_id = $db->lastInsertId();

        echo json_encode([
            'success' => true,
            'message' => 'Student profile created successfully',
            'student_id' => $student_id,
            'student' => [
                'id' => $student_id,
                'name' => $data['name'],
                'admission_no' => $data['admission_no'],
                'class' => $data['class'],
                'session' => $data['session'],
                'term' => $data['term'],
                'gender' => $data['gender']
            ]
        ]);
    } else {
        throw new Exception('Failed to create student profile');
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
