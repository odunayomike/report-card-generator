<?php
/**
 * Create Teacher Route
 * Allows schools to create teacher accounts
 */

// Check if school is authenticated
if (!isset($_SESSION['user_type']) || $_SESSION['user_type'] !== 'school' || !isset($_SESSION['school_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized - School access required']);
    exit;
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

$name = trim($input['name'] ?? '');
$email = trim($input['email'] ?? '');
$password = $input['password'] ?? '';
$phone = trim($input['phone'] ?? '');
$classes = $input['classes'] ?? []; // Array of class assignments

// Validate input
if (empty($name) || empty($email) || empty($password)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Name, email, and password are required']);
    exit;
}

// Validate email format
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid email format']);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();

    // Check if email already exists for this school
    $checkQuery = "SELECT id FROM teachers WHERE school_id = ? AND email = ?";
    $checkStmt = $db->prepare($checkQuery);
    $checkStmt->execute([$_SESSION['school_id'], $email]);

    if ($checkStmt->fetch()) {
        http_response_code(409);
        echo json_encode(['success' => false, 'message' => 'A teacher with this email already exists']);
        exit;
    }

    // Hash password
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    // Insert teacher
    $query = "INSERT INTO teachers (school_id, name, email, password, phone)
              VALUES (?, ?, ?, ?, ?)";

    $stmt = $db->prepare($query);
    $stmt->execute([$_SESSION['school_id'], $name, $email, $hashedPassword, $phone]);

    $teacherId = $db->lastInsertId();

    // Assign classes if provided
    if (!empty($classes) && is_array($classes)) {
        $assignQuery = "INSERT INTO teacher_classes (teacher_id, class_name, school_id, session, term)
                        VALUES (?, ?, ?, ?, ?)";
        $assignStmt = $db->prepare($assignQuery);

        foreach ($classes as $class) {
            $className = $class['class_name'] ?? '';
            $session = $class['session'] ?? '';
            $term = $class['term'] ?? '';

            if (!empty($className) && !empty($session) && !empty($term)) {
                $assignStmt->execute([$teacherId, $className, $_SESSION['school_id'], $session, $term]);
            }
        }
    }

    echo json_encode([
        'success' => true,
        'message' => 'Teacher created successfully',
        'teacher' => [
            'id' => $teacherId,
            'name' => $name,
            'email' => $email,
            'phone' => $phone
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>
