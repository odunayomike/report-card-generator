<?php
/**
 * Super Admin MFA Verification Route
 * Verifies MFA code during login
 * Session is already started in index.php
 */

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['code']) || !isset($data['email'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Code and email are required']);
    exit;
}

$code = trim($data['code']);
$email = trim($data['email']);
$rememberDevice = isset($data['remember_device']) && $data['remember_device'] === true;

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../utils/TOTP.php';

$database = new Database();
$db = $database->getConnection();
$totp = new TOTP();

try {
    // Get super admin
    $stmt = $db->prepare("
        SELECT id, name, email, mfa_enabled, mfa_secret, mfa_backup_codes
        FROM super_admins
        WHERE email = :email AND is_active = TRUE
    ");
    $stmt->bindParam(':email', $email);
    $stmt->execute();

    $admin = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$admin || !$admin['mfa_enabled'] || !$admin['mfa_secret']) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid MFA configuration']);
        exit;
    }

    $verified = false;
    $usedBackupCode = false;
    $backupCodeIndex = null;

    // First try TOTP code
    if ($totp->verifyCode($admin['mfa_secret'], $code)) {
        $verified = true;
    } else {
        // Try backup codes
        $backupCodes = json_decode($admin['mfa_backup_codes'], true);
        if ($backupCodes) {
            $backupCodeIndex = $totp->verifyBackupCode($code, $backupCodes);
            if ($backupCodeIndex !== false) {
                $verified = true;
                $usedBackupCode = true;
            }
        }
    }

    // Record verification attempt
    $ip = $_SERVER['REMOTE_ADDR'] ?? null;
    $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? null;

    $stmt = $db->prepare("
        INSERT INTO mfa_verification_attempts
        (super_admin_id, success, ip_address, user_agent)
        VALUES (:admin_id, :success, :ip, :user_agent)
    ");
    $stmt->execute([
        ':admin_id' => $admin['id'],
        ':success' => $verified,
        ':ip' => $ip,
        ':user_agent' => $userAgent
    ]);

    if (!$verified) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid verification code']);
        exit;
    }

    // If backup code was used, remove it from the list
    if ($usedBackupCode) {
        $backupCodes = json_decode($admin['mfa_backup_codes'], true);
        unset($backupCodes[$backupCodeIndex]);
        $backupCodes = array_values($backupCodes); // Re-index array

        $stmt = $db->prepare("
            UPDATE super_admins
            SET mfa_backup_codes = :codes
            WHERE id = :id
        ");
        $stmt->execute([
            ':codes' => json_encode($backupCodes),
            ':id' => $admin['id']
        ]);
    }

    // Regenerate session ID to prevent session fixation
    session_regenerate_id(true);

    // Set session variables
    $_SESSION['user_type'] = 'super_admin';
    $_SESSION['super_admin_id'] = $admin['id'];
    $_SESSION['super_admin_name'] = $admin['name'];
    $_SESSION['super_admin_email'] = $admin['email'];
    $_SESSION['mfa_verified'] = true;

    // Handle "remember this device"
    $deviceToken = null;
    if ($rememberDevice) {
        $deviceToken = bin2hex(random_bytes(32));
        $trustedUntil = date('Y-m-d H:i:s', strtotime('+30 days'));

        $stmt = $db->prepare("
            INSERT INTO trusted_devices
            (super_admin_id, device_token, ip_address, user_agent, trusted_until)
            VALUES (:admin_id, :token, :ip, :user_agent, :trusted_until)
        ");
        $stmt->execute([
            ':admin_id' => $admin['id'],
            ':token' => $deviceToken,
            ':ip' => $ip,
            ':user_agent' => $userAgent,
            ':trusted_until' => $trustedUntil
        ]);
    }

    // Log activity
    require_once __DIR__ . '/../../middleware/super-admin-check.php';
    logSuperAdminActivity('login', 'system', 'MFA verified and logged in');

    http_response_code(200);
    echo json_encode([
        'message' => 'MFA verification successful',
        'user' => [
            'id' => $admin['id'],
            'name' => $admin['name'],
            'email' => $admin['email'],
            'user_type' => 'super_admin'
        ],
        'device_token' => $deviceToken,
        'backup_code_used' => $usedBackupCode,
        'backup_codes_remaining' => $usedBackupCode ? count($backupCodes) : null
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Verification failed']);
}
