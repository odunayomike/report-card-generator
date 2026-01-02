<?php
/**
 * Register Device Token for Push Notifications
 * Register FCM device token for the authenticated parent
 */

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Check if parent is authenticated
if (!isset($_SESSION['user_type']) || $_SESSION['user_type'] !== 'parent' || !isset($_SESSION['parent_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

try {
    $parentId = $_SESSION['parent_id'];
    $input = json_decode(file_get_contents('php://input'), true);

    $deviceToken = $input['device_token'] ?? null;
    $deviceType = $input['device_type'] ?? null;
    $deviceName = $input['device_name'] ?? null;

    // Validate input
    if (!$deviceToken) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'device_token is required']);
        exit;
    }

    if (!$deviceType || !in_array($deviceType, ['android', 'ios'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'device_type must be android or ios']);
        exit;
    }

    $database = new Database();
    $db = $database->getConnection();

    // Check if token already exists
    $checkQuery = "SELECT id, is_active FROM parent_device_tokens
                   WHERE parent_id = ? AND device_token = ?";
    $checkStmt = $db->prepare($checkQuery);
    $checkStmt->execute([$parentId, $deviceToken]);
    $existing = $checkStmt->fetch(PDO::FETCH_ASSOC);

    if ($existing) {
        // Update existing token
        $updateQuery = "UPDATE parent_device_tokens
                        SET is_active = TRUE,
                            device_type = ?,
                            device_name = ?,
                            last_used_at = NOW()
                        WHERE id = ?";
        $updateStmt = $db->prepare($updateQuery);
        $updateStmt->execute([$deviceType, $deviceName, $existing['id']]);

        echo json_encode([
            'success' => true,
            'message' => 'Device token updated',
            'token_id' => $existing['id']
        ]);
    } else {
        // Insert new token
        $insertQuery = "INSERT INTO parent_device_tokens
                        (parent_id, device_token, device_type, device_name)
                        VALUES (?, ?, ?, ?)";
        $insertStmt = $db->prepare($insertQuery);
        $insertStmt->execute([$parentId, $deviceToken, $deviceType, $deviceName]);

        echo json_encode([
            'success' => true,
            'message' => 'Device token registered',
            'token_id' => $db->lastInsertId()
        ]);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
