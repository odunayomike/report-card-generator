<?php
/**
 * Get Contact Messages
 * Super Admin route to view all contact form submissions
 */

// Check if super admin is authenticated
if (!isset($_SESSION['user_type']) || $_SESSION['user_type'] !== 'super_admin') {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$database = new Database();
$db = $database->getConnection();

try {
    // Get all contact messages with pagination
    $page = isset($_GET['page']) ? intval($_GET['page']) : 1;
    $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 50;
    $offset = ($page - 1) * $limit;

    $status = $_GET['status'] ?? 'all'; // all, sent, pending

    // Build query based on status
    $whereClause = '';
    if ($status === 'sent') {
        $whereClause = 'WHERE email_sent = 1';
    } elseif ($status === 'pending') {
        $whereClause = 'WHERE email_sent = 0';
    }

    // Get total count
    $countQuery = "SELECT COUNT(*) as total FROM contact_messages $whereClause";
    $countStmt = $db->query($countQuery);
    $totalCount = $countStmt->fetch()['total'];

    // Get messages
    $query = "SELECT * FROM contact_messages $whereClause
              ORDER BY created_at DESC
              LIMIT $limit OFFSET $offset";
    $stmt = $db->query($query);
    $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'messages' => $messages,
        'total' => $totalCount,
        'page' => $page,
        'limit' => $limit,
        'total_pages' => ceil($totalCount / $limit)
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
