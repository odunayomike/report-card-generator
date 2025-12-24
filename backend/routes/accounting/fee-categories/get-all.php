<?php
/**
 * Get All Fee Categories for School
 */

// Check authentication
if (!isset($_SESSION['school_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();

    $query = "SELECT * FROM fee_categories
              WHERE school_id = ?
              ORDER BY name ASC";

    $stmt = $db->prepare($query);
    $stmt->execute([$_SESSION['school_id']]);
    $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Format response
    $formattedCategories = array_map(function($cat) {
        return [
            'id' => (int)$cat['id'],
            'name' => $cat['name'],
            'description' => $cat['description'],
            'is_active' => (bool)$cat['is_active'],
            'created_at' => $cat['created_at'],
            'updated_at' => $cat['updated_at']
        ];
    }, $categories);

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'data' => $formattedCategories,
        'count' => count($formattedCategories)
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
