<?php
/**
 * Get Parent Notifications
 * Fetch all notifications for the authenticated parent
 */

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
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

    // Get query parameters
    $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 50;
    $offset = isset($_GET['offset']) ? intval($_GET['offset']) : 0;
    $unreadOnly = isset($_GET['unread_only']) && $_GET['unread_only'] === 'true';
    $type = isset($_GET['type']) ? $_GET['type'] : null;

    // Validate type if provided
    $validTypes = ['report_card', 'fee_payment', 'attendance', 'announcement'];
    if ($type && !in_array($type, $validTypes)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid notification type']);
        exit;
    }

    $database = new Database();
    $db = $database->getConnection();

    // Build query
    $query = "SELECT
                n.id,
                n.type,
                n.title,
                n.message,
                n.data,
                n.is_read,
                n.read_at,
                n.created_at,
                s.name as student_name,
                s.admission_no as student_admission_no,
                sch.school_name
              FROM notifications n
              LEFT JOIN students s ON n.student_id = s.id
              LEFT JOIN schools sch ON n.school_id = sch.id
              WHERE n.parent_id = ?";

    $params = [$parentId];

    if ($unreadOnly) {
        $query .= " AND n.is_read = FALSE";
    }

    if ($type) {
        $query .= " AND n.type = ?";
        $params[] = $type;
    }

    $query .= " ORDER BY n.created_at DESC LIMIT $limit OFFSET $offset";

    $stmt = $db->prepare($query);
    $stmt->execute($params);
    $notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Parse JSON data field
    foreach ($notifications as &$notification) {
        if ($notification['data']) {
            $notification['data'] = json_decode($notification['data'], true);
        }
        $notification['is_read'] = (bool)$notification['is_read'];
    }

    // Get unread count
    $countQuery = "SELECT COUNT(*) as unread_count
                   FROM notifications
                   WHERE parent_id = ? AND is_read = FALSE";
    $countStmt = $db->prepare($countQuery);
    $countStmt->execute([$parentId]);
    $countResult = $countStmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'notifications' => $notifications,
        'unread_count' => (int)$countResult['unread_count'],
        'limit' => $limit,
        'offset' => $offset
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
