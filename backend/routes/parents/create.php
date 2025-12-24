<?php
/**
 * Create Parent Account
 * Allows schools to create parent accounts with email and password
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../../config/database.php';

// Start session
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Check authentication - only schools or teachers can create parent accounts
$authenticated = false;
$schoolId = null;

if (isset($_SESSION['school_id']) && $_SESSION['user_type'] === 'school') {
    $authenticated = true;
    $schoolId = $_SESSION['school_id'];
} elseif (isset($_SESSION['teacher_id']) && $_SESSION['user_type'] === 'teacher') {
    $authenticated = true;
    // Get school_id from teacher
    $database = new Database();
    $db = $database->getConnection();
    $teacherQuery = "SELECT school_id FROM teachers WHERE id = ?";
    $stmt = $db->prepare($teacherQuery);
    $stmt->execute([$_SESSION['teacher_id']]);
    $teacher = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($teacher) {
        $schoolId = $teacher['school_id'];
    }
}

if (!$authenticated || !$schoolId) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Get JSON input
$json = file_get_contents('php://input');
$data = json_decode($json, true);

// Validate input
$required = ['name', 'email', 'phone', 'password'];
foreach ($required as $field) {
    if (!isset($data[$field]) || empty(trim($data[$field]))) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => ucfirst(str_replace('_', ' ', $field)) . ' is required'
        ]);
        exit;
    }
}

$name = trim($data['name']);
$email = trim(strtolower($data['email']));
$phone = trim($data['phone']);
$password = $data['password'];

// Validate email format
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid email format']);
    exit;
}

// Validate password length
if (strlen($password) < 6) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Password must be at least 6 characters']);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();

    // Check if parent with this email already exists
    $checkQuery = "SELECT id, name FROM parents WHERE email = ?";
    $checkStmt = $db->prepare($checkQuery);
    $checkStmt->execute([$email]);
    $existingParent = $checkStmt->fetch(PDO::FETCH_ASSOC);

    if ($existingParent) {
        http_response_code(409);
        echo json_encode([
            'success' => false,
            'message' => 'A parent account with this email already exists',
            'existing_parent' => [
                'id' => (int)$existingParent['id'],
                'name' => $existingParent['name']
            ]
        ]);
        exit;
    }

    // Hash the password
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    // Insert new parent
    $insertQuery = "INSERT INTO parents (email, name, phone, password, is_active, created_at, updated_at)
                    VALUES (?, ?, ?, ?, TRUE, NOW(), NOW())";

    $insertStmt = $db->prepare($insertQuery);
    $insertStmt->execute([$email, $name, $phone, $hashedPassword]);

    $parentId = $db->lastInsertId();

    http_response_code(201);
    echo json_encode([
        'success' => true,
        'message' => 'Parent account created successfully',
        'data' => [
            'parent_id' => (int)$parentId,
            'name' => $name,
            'email' => $email,
            'phone' => $phone
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error occurred',
        'error' => $e->getMessage()
    ]);
}
