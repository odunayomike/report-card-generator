<?php
/**
 * Super Admin Login Route
 * Session is already started in index.php
 */

// Get posted data
$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid data provided']);
    exit();
}

// Validate required fields
if (!isset($data['email']) || !isset($data['password'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Email and password are required']);
    exit();
}

$email = trim($data['email']);
$password = $data['password'];

$database = new Database();
$db = $database->getConnection();

try {
    // Fetch super admin by email
    $stmt = $db->prepare("
        SELECT id, name, email, password, phone, is_active
        FROM super_admins
        WHERE email = :email
    ");
    $stmt->bindParam(':email', $email);
    $stmt->execute();

    $superAdmin = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$superAdmin) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid credentials']);
        exit;
    }

    // Verify password
    if (!password_verify($password, $superAdmin['password'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid credentials']);
        exit;
    }

    // Check if super admin is active
    if (!$superAdmin['is_active']) {
        http_response_code(403);
        echo json_encode(['error' => 'Your account has been deactivated. Please contact system support.']);
        exit;
    }

    // Set session variables
    $_SESSION['user_type'] = 'super_admin';
    $_SESSION['super_admin_id'] = $superAdmin['id'];
    $_SESSION['super_admin_name'] = $superAdmin['name'];
    $_SESSION['super_admin_email'] = $superAdmin['email'];

    // Log the login activity
    $ip_address = $_SERVER['REMOTE_ADDR'] ?? null;
    $user_agent = $_SERVER['HTTP_USER_AGENT'] ?? null;

    $logStmt = $db->prepare("
        INSERT INTO super_admin_activity_log
        (super_admin_id, action_type, target_type, description, ip_address, user_agent)
        VALUES (:super_admin_id, 'login', 'system', 'Super admin logged in', :ip_address, :user_agent)
    ");
    $logStmt->bindParam(':super_admin_id', $superAdmin['id']);
    $logStmt->bindParam(':ip_address', $ip_address);
    $logStmt->bindParam(':user_agent', $user_agent);
    $logStmt->execute();

    // Return success
    http_response_code(200);
    echo json_encode([
        'message' => 'Login successful',
        'user' => [
            'id' => $superAdmin['id'],
            'name' => $superAdmin['name'],
            'email' => $superAdmin['email'],
            'phone' => $superAdmin['phone'],
            'user_type' => 'super_admin'
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
