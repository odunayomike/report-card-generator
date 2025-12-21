<?php
/**
 * Super Admin Logout Route
 * Session is already started in index.php
 */

if (!isset($_SESSION['user_type']) || $_SESSION['user_type'] !== 'super_admin') {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$database = new Database();
$db = $database->getConnection();

try {

    // Log the logout activity
    $super_admin_id = $_SESSION['super_admin_id'];
    $ip_address = $_SERVER['REMOTE_ADDR'] ?? null;
    $user_agent = $_SERVER['HTTP_USER_AGENT'] ?? null;

    $stmt = $db->prepare("
        INSERT INTO super_admin_activity_log
        (super_admin_id, action_type, target_type, description, ip_address, user_agent)
        VALUES (:super_admin_id, 'logout', 'system', 'Super admin logged out', :ip_address, :user_agent)
    ");
    $stmt->bindParam(':super_admin_id', $super_admin_id);
    $stmt->bindParam(':ip_address', $ip_address);
    $stmt->bindParam(':user_agent', $user_agent);
    $stmt->execute();

    // Destroy session
    session_destroy();

    http_response_code(200);
    echo json_encode(['message' => 'Logout successful']);

} catch (PDOException $e) {
    // Even if logging fails, destroy the session
    session_destroy();
    http_response_code(200);
    echo json_encode(['message' => 'Logout successful']);
}
