<?php
/**
 * School Login API Endpoint
 */

// Start session before any output or headers
session_start();

require_once '../../config/cors.php';
require_once '../../config/database.php';

$database = new Database();
$db = $database->getConnection();

// Get posted data
$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid data provided']);
    exit();
}

// Validate required fields
if (!isset($data['email']) || !isset($data['password'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Email and password are required']);
    exit();
}

try {
    // Get school by email with all details
    $query = "SELECT id, school_name, email, password, phone, address, logo, is_active FROM schools WHERE email = :email";
    $stmt = $db->prepare($query);
    $stmt->execute([':email' => $data['email']]);
    $school = $stmt->fetch();

    if (!$school) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Invalid email or password']);
        exit();
    }

    // Check if account is active
    if (!$school['is_active']) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Account is deactivated. Please contact support']);
        exit();
    }

    // Verify password
    if (!password_verify($data['password'], $school['password'])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Invalid email or password']);
        exit();
    }

    // Set school data in session (session already started at top of file)
    $_SESSION['school_id'] = $school['id'];
    $_SESSION['school_name'] = $school['school_name'];
    $_SESSION['email'] = $school['email'];

    // Debug: Log session after setting
    error_log('Login - Session ID after setting data: ' . session_id());
    error_log('Login - Session data: ' . print_r($_SESSION, true));

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Login successful',
        'school' => [
            'id' => $school['id'],
            'school_name' => $school['school_name'],
            'email' => $school['email'],
            'phone' => $school['phone'],
            'address' => $school['address'],
            'logo' => $school['logo']
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error during login: ' . $e->getMessage()
    ]);
}
?>
