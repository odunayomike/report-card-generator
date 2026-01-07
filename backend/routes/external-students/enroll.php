<?php
/**
 * External Student Enrollment
 * Quick enrollment of prospective students for entrance examinations
 */

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
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
    $createdBy = $_SESSION['school_id']; // School admin ID
    $input = json_decode(file_get_contents('php://input'), true);

    // Validate required fields
    $requiredFields = ['name', 'applying_for_class', 'parent_name', 'parent_phone'];
    foreach ($requiredFields as $field) {
        if (!isset($input[$field]) || empty(trim($input[$field]))) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => ucfirst(str_replace('_', ' ', $field)) . ' is required'
            ]);
            exit;
        }
    }

    // Extract and validate input
    $name = trim($input['name']);
    $email = isset($input['email']) ? trim($input['email']) : null;
    $phone = isset($input['phone']) ? trim($input['phone']) : null;
    $dateOfBirth = isset($input['date_of_birth']) ? $input['date_of_birth'] : null;
    $gender = isset($input['gender']) ? strtoupper($input['gender']) : null;
    $address = isset($input['address']) ? trim($input['address']) : null;
    $applyingForClass = trim($input['applying_for_class']);
    $previousSchool = isset($input['previous_school']) ? trim($input['previous_school']) : null;

    // Parent information
    $parentName = trim($input['parent_name']);
    $parentEmail = isset($input['parent_email']) ? trim($input['parent_email']) : null;
    $parentPhone = trim($input['parent_phone']);
    $parentRelationship = isset($input['parent_relationship']) ? $input['parent_relationship'] : 'father';

    // Notes
    $notes = isset($input['notes']) ? trim($input['notes']) : null;

    // Validate email format if provided
    if ($email && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid email format']);
        exit;
    }

    if ($parentEmail && !filter_var($parentEmail, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid parent email format']);
        exit;
    }

    // Validate gender
    if ($gender && !in_array($gender, ['MALE', 'FEMALE'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Gender must be MALE or FEMALE']);
        exit;
    }

    // Validate parent relationship
    if (!in_array($parentRelationship, ['father', 'mother', 'guardian'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid parent relationship']);
        exit;
    }

    $database = new Database();
    $db = $database->getConnection();

    // Generate unique exam code
    $examCode = generateExamCode($db, $schoolId);

    // Generate default password (can be changed later)
    // Format: EXT + last 4 digits of phone or random 4 digits
    $defaultPassword = 'EXT' . substr($parentPhone, -4);
    $passwordHash = password_hash($defaultPassword, PASSWORD_DEFAULT);

    // Insert external student
    $query = "INSERT INTO external_students (
                school_id, name, email, phone, date_of_birth, gender, address,
                applying_for_class, previous_school, parent_name, parent_email,
                parent_phone, parent_relationship, exam_code, password_hash,
                created_by, notes
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

    $stmt = $db->prepare($query);
    $stmt->execute([
        $schoolId,
        $name,
        $email,
        $phone,
        $dateOfBirth,
        $gender,
        $address,
        $applyingForClass,
        $previousSchool,
        $parentName,
        $parentEmail,
        $parentPhone,
        $parentRelationship,
        $examCode,
        $passwordHash,
        $createdBy,
        $notes
    ]);

    $externalStudentId = $db->lastInsertId();

    // Log activity
    logActivity($db, $externalStudentId, $schoolId, 'enrollment', "External student enrolled: $name", $_SERVER['REMOTE_ADDR'] ?? null);

    // Return success with credentials
    http_response_code(201);
    echo json_encode([
        'success' => true,
        'message' => 'External student enrolled successfully',
        'data' => [
            'id' => (int)$externalStudentId,
            'name' => $name,
            'exam_code' => $examCode,
            'default_password' => $defaultPassword,
            'applying_for_class' => $applyingForClass,
            'parent_name' => $parentName,
            'parent_phone' => $parentPhone
        ],
        'credentials' => [
            'exam_code' => $examCode,
            'password' => $defaultPassword,
            'login_url' => 'https://schoolhub.tech/external-student/login'
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
 * Generate unique exam code for external student
 */
function generateExamCode($db, $schoolId) {
    $year = date('Y');
    $attempts = 0;
    $maxAttempts = 10;

    do {
        // Format: EXT-YEAR-SCHOOLID-RANDOM (e.g., EXT-2024-5-0012)
        $random = str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);
        $examCode = "EXT-{$year}-{$schoolId}-{$random}";

        // Check if code already exists
        $checkQuery = "SELECT id FROM external_students WHERE exam_code = ?";
        $stmt = $db->prepare($checkQuery);
        $stmt->execute([$examCode]);

        if (!$stmt->fetch()) {
            return $examCode; // Code is unique
        }

        $attempts++;
    } while ($attempts < $maxAttempts);

    // Fallback to timestamp-based code
    return "EXT-{$year}-{$schoolId}-" . time();
}

/**
 * Log external student activity
 */
function logActivity($db, $externalStudentId, $schoolId, $activityType, $details, $ipAddress) {
    try {
        $query = "INSERT INTO external_student_activity_log
                  (external_student_id, school_id, activity_type, details, ip_address)
                  VALUES (?, ?, ?, ?, ?)";
        $stmt = $db->prepare($query);
        $stmt->execute([$externalStudentId, $schoolId, $activityType, $details, $ipAddress]);
    } catch (PDOException $e) {
        // Log error but don't fail the main operation
        error_log("Failed to log activity: " . $e->getMessage());
    }
}
?>
