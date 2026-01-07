<?php
/**
 * Super Admin MFA Disable Route
 * Requires password confirmation to disable MFA
 */

require_once __DIR__ . '/../../middleware/super-admin-check.php';
requireSuperAdmin();

require_once __DIR__ . '/../../config/database.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['password'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Password is required to disable MFA']);
    exit;
}

$password = $data['password'];
$superAdminId = $_SESSION['super_admin_id'];

$database = new Database();
$db = $database->getConnection();

try {
    // Verify password
    $stmt = $db->prepare("
        SELECT password, mfa_enabled
        FROM super_admins
        WHERE id = :id
    ");
    $stmt->bindParam(':id', $superAdminId);
    $stmt->execute();

    $admin = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$admin) {
        http_response_code(404);
        echo json_encode(['error' => 'Admin not found']);
        exit;
    }

    if (!password_verify($password, $admin['password'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid password']);
        exit;
    }

    if (!$admin['mfa_enabled']) {
        http_response_code(400);
        echo json_encode(['error' => 'MFA is not enabled']);
        exit;
    }

    // Disable MFA and clear secrets
    $stmt = $db->prepare("
        UPDATE super_admins
        SET mfa_enabled = FALSE,
            mfa_secret = NULL,
            mfa_backup_codes = NULL,
            mfa_enabled_at = NULL
        WHERE id = :id
    ");
    $stmt->bindParam(':id', $superAdminId);
    $stmt->execute();

    // Remove all trusted devices
    $stmt = $db->prepare("
        DELETE FROM trusted_devices
        WHERE super_admin_id = :id
    ");
    $stmt->bindParam(':id', $superAdminId);
    $stmt->execute();

    // Log activity
    logSuperAdminActivity('delete', 'settings', 'Disabled MFA');

    http_response_code(200);
    echo json_encode([
        'message' => 'MFA has been disabled',
        'mfa_enabled' => false
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to disable MFA']);
}
