<?php
// Super Admin Authorization Middleware

function requireSuperAdmin() {
    if (!isset($_SESSION['user_type']) || $_SESSION['user_type'] !== 'super_admin') {
        http_response_code(403);
        echo json_encode(['error' => 'Access denied. Super admin privileges required.']);
        exit;
    }

    // Verify super admin is still active
    require_once __DIR__ . '/../config/database.php';

    try {
        $db = new Database();
        $conn = $db->getConnection();

        $stmt = $conn->prepare("
            SELECT is_active FROM super_admins WHERE id = :id
        ");
        $stmt->bindParam(':id', $_SESSION['super_admin_id']);
        $stmt->execute();

        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$result || !$result['is_active']) {
            session_destroy();
            http_response_code(403);
            echo json_encode(['error' => 'Super admin account is inactive']);
            exit;
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Authorization check failed']);
        exit;
    }
}

function logSuperAdminActivity($action_type, $target_type, $description, $target_id = null, $school_id = null) {
    if (!isset($_SESSION['super_admin_id'])) {
        return;
    }

    require_once __DIR__ . '/../config/database.php';

    try {
        $db = new Database();
        $conn = $db->getConnection();

        $ip_address = $_SERVER['REMOTE_ADDR'] ?? null;
        $user_agent = $_SERVER['HTTP_USER_AGENT'] ?? null;

        $stmt = $conn->prepare("
            INSERT INTO super_admin_activity_log
            (super_admin_id, action_type, target_type, target_id, school_id, description, ip_address, user_agent)
            VALUES (:super_admin_id, :action_type, :target_type, :target_id, :school_id, :description, :ip_address, :user_agent)
        ");

        $stmt->bindParam(':super_admin_id', $_SESSION['super_admin_id']);
        $stmt->bindParam(':action_type', $action_type);
        $stmt->bindParam(':target_type', $target_type);
        $stmt->bindParam(':target_id', $target_id);
        $stmt->bindParam(':school_id', $school_id);
        $stmt->bindParam(':description', $description);
        $stmt->bindParam(':ip_address', $ip_address);
        $stmt->bindParam(':user_agent', $user_agent);

        $stmt->execute();
    } catch (PDOException $e) {
        // Silently fail - don't block the main operation
        error_log("Failed to log super admin activity: " . $e->getMessage());
    }
}
