<?php
/**
 * Check Parent Session Status
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../../config/database.php';

// Start session
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Check if parent is logged in
if (!isset($_SESSION['parent_id']) || $_SESSION['user_type'] !== 'parent') {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'authenticated' => false,
        'message' => 'Not authenticated'
    ]);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();

    // Get parent details
    $query = "SELECT id, email, name, phone, is_active
              FROM parents
              WHERE id = ? AND is_active = TRUE";

    $stmt = $db->prepare($query);
    $stmt->execute([$_SESSION['parent_id']]);
    $parent = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$parent) {
        // Parent not found or inactive, destroy session
        session_destroy();
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'authenticated' => false,
            'message' => 'Account not found or inactive'
        ]);
        exit;
    }

    // Get children count
    $countQuery = "SELECT COUNT(*) as children_count
                   FROM parent_students
                   WHERE parent_id = ?";

    $countStmt = $db->prepare($countQuery);
    $countStmt->execute([$parent['id']]);
    $countResult = $countStmt->fetch(PDO::FETCH_ASSOC);

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'authenticated' => true,
        'data' => [
            'id' => (int)$parent['id'],
            'name' => $parent['name'],
            'email' => $parent['email'],
            'phone' => $parent['phone'],
            'children_count' => (int)$countResult['children_count']
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error occurred',
        'error' => $e->getMessage()
    ]);
}
?>
