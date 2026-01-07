<?php
/**
 * Super Admin MFA Enable Route
 * Verifies TOTP code and enables MFA
 */

require_once __DIR__ . '/../../middleware/super-admin-check.php';
requireSuperAdmin();

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../utils/TOTP.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['code'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Verification code is required']);
    exit;
}

$code = trim($data['code']);
$superAdminId = $_SESSION['super_admin_id'];

$database = new Database();
$db = $database->getConnection();
$totp = new TOTP();

try {
    // Get the secret
    $stmt = $db->prepare("
        SELECT mfa_enabled, mfa_secret
        FROM super_admins
        WHERE id = :id
    ");
    $stmt->bindParam(':id', $superAdminId);
    $stmt->execute();

    $admin = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$admin || !$admin['mfa_secret']) {
        http_response_code(400);
        echo json_encode(['error' => 'MFA setup not initiated. Run setup first.']);
        exit;
    }

    if ($admin['mfa_enabled']) {
        http_response_code(400);
        echo json_encode(['error' => 'MFA is already enabled']);
        exit;
    }

    // Verify the code
    if (!$totp->verifyCode($admin['mfa_secret'], $code)) {
        // Record failed verification attempt
        $ip = $_SERVER['REMOTE_ADDR'] ?? null;
        $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? null;

        $stmt = $db->prepare("
            INSERT INTO mfa_verification_attempts
            (super_admin_id, success, ip_address, user_agent)
            VALUES (:admin_id, FALSE, :ip, :user_agent)
        ");
        $stmt->execute([
            ':admin_id' => $superAdminId,
            ':ip' => $ip,
            ':user_agent' => $userAgent
        ]);

        http_response_code(401);
        echo json_encode(['error' => 'Invalid verification code']);
        exit;
    }

    // Code is valid - enable MFA
    $stmt = $db->prepare("
        UPDATE super_admins
        SET mfa_enabled = TRUE,
            mfa_enabled_at = NOW()
        WHERE id = :id
    ");
    $stmt->bindParam(':id', $superAdminId);
    $stmt->execute();

    // Record successful verification
    $ip = $_SERVER['REMOTE_ADDR'] ?? null;
    $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? null;

    $stmt = $db->prepare("
        INSERT INTO mfa_verification_attempts
        (super_admin_id, success, ip_address, user_agent)
        VALUES (:admin_id, TRUE, :ip, :user_agent)
    ");
    $stmt->execute([
        ':admin_id' => $superAdminId,
        ':ip' => $ip,
        ':user_agent' => $userAgent
    ]);

    // Log activity
    logSuperAdminActivity('update', 'settings', 'Enabled MFA');

    http_response_code(200);
    echo json_encode([
        'message' => 'MFA has been successfully enabled',
        'mfa_enabled' => true
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to enable MFA']);
}
