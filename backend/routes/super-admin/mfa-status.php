<?php
/**
 * Super Admin MFA Status Route
 * Returns MFA configuration status
 */

require_once __DIR__ . '/../../middleware/super-admin-check.php';
requireSuperAdmin();

require_once __DIR__ . '/../../config/database.php';

$database = new Database();
$db = $database->getConnection();
$superAdminId = $_SESSION['super_admin_id'];

try {
    // Get MFA status
    $stmt = $db->prepare("
        SELECT mfa_enabled, mfa_enabled_at, mfa_backup_codes
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

    // Count backup codes
    $backupCodesCount = 0;
    if ($admin['mfa_backup_codes']) {
        $backupCodes = json_decode($admin['mfa_backup_codes'], true);
        $backupCodesCount = is_array($backupCodes) ? count($backupCodes) : 0;
    }

    // Get trusted devices count
    $stmt = $db->prepare("
        SELECT COUNT(*) as count
        FROM trusted_devices
        WHERE super_admin_id = :id
        AND trusted_until > NOW()
    ");
    $stmt->bindParam(':id', $superAdminId);
    $stmt->execute();
    $trustedDevicesCount = $stmt->fetch(PDO::FETCH_ASSOC)['count'];

    http_response_code(200);
    echo json_encode([
        'mfa_enabled' => (bool)$admin['mfa_enabled'],
        'mfa_enabled_at' => $admin['mfa_enabled_at'],
        'backup_codes_remaining' => $backupCodesCount,
        'trusted_devices_count' => (int)$trustedDevicesCount
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to get MFA status']);
}
