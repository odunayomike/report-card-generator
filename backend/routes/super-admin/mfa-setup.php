<?php
/**
 * Super Admin MFA Setup Route
 * Generates secret and QR code for setting up MFA
 */

require_once __DIR__ . '/../../middleware/super-admin-check.php';
requireSuperAdmin();

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../utils/TOTP.php';

$database = new Database();
$db = $database->getConnection();
$totp = new TOTP();

$superAdminId = $_SESSION['super_admin_id'];

try {
    // Get current MFA status
    $stmt = $db->prepare("
        SELECT mfa_enabled, mfa_secret, email, name
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

    // If MFA is already enabled, require it to be disabled first
    if ($admin['mfa_enabled']) {
        http_response_code(400);
        echo json_encode([
            'error' => 'MFA is already enabled. Disable it first to reconfigure.',
            'mfa_enabled' => true
        ]);
        exit;
    }

    // Generate new secret
    $secret = $totp->generateSecret();

    // Generate backup codes
    $backupCodes = $totp->generateBackupCodes(10);
    $hashedBackupCodes = $totp->hashBackupCodes($backupCodes);

    // Store the secret (but don't enable MFA yet - wait for verification)
    $stmt = $db->prepare("
        UPDATE super_admins
        SET mfa_secret = :secret,
            mfa_backup_codes = :backup_codes
        WHERE id = :id
    ");
    $stmt->execute([
        ':secret' => $secret,
        ':backup_codes' => json_encode($hashedBackupCodes),
        ':id' => $superAdminId
    ]);

    // Generate QR code URL
    $qrUrl = $totp->getQRCodeUrl($secret, 'SchoolHub Super Admin', $admin['email']);

    // Log activity
    logSuperAdminActivity('create', 'settings', 'Initiated MFA setup');

    http_response_code(200);
    echo json_encode([
        'message' => 'MFA setup initiated. Scan the QR code with your authenticator app.',
        'secret' => $secret,
        'qr_code_url' => $qrUrl,
        'backup_codes' => $backupCodes, // Send plain text codes only once
        'mfa_enabled' => false
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to setup MFA']);
}
