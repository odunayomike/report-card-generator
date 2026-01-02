<?php
/**
 * Mark Notification(s) as Read
 * Mark one or multiple notifications as read
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

    $notificationId = $input['notification_id'] ?? null;
    $markAll = $input['mark_all'] ?? false;

    $database = new Database();
    $db = $database->getConnection();

    if ($markAll) {
        // Mark all notifications as read for this parent
        $query = "UPDATE notifications
                  SET is_read = TRUE, read_at = NOW()
                  WHERE parent_id = ? AND is_read = FALSE";
        $stmt = $db->prepare($query);
        $stmt->execute([$parentId]);
        $affected = $stmt->rowCount();

        echo json_encode([
            'success' => true,
            'message' => 'All notifications marked as read',
            'marked_count' => $affected
        ]);

    } elseif ($notificationId) {
        // Mark specific notification as read
        $query = "UPDATE notifications
                  SET is_read = TRUE, read_at = NOW()
                  WHERE id = ? AND parent_id = ? AND is_read = FALSE";
        $stmt = $db->prepare($query);
        $stmt->execute([$notificationId, $parentId]);

        if ($stmt->rowCount() > 0) {
            echo json_encode([
                'success' => true,
                'message' => 'Notification marked as read'
            ]);
        } else {
            // Check if notification exists
            $checkQuery = "SELECT id FROM notifications WHERE id = ? AND parent_id = ?";
            $checkStmt = $db->prepare($checkQuery);
            $checkStmt->execute([$notificationId, $parentId]);

            if ($checkStmt->fetch()) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Notification already marked as read'
                ]);
            } else {
                http_response_code(404);
                echo json_encode([
                    'success' => false,
                    'message' => 'Notification not found'
                ]);
            }
        }

    } else {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'notification_id or mark_all parameter required'
        ]);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
