<?php
/**
 * Update Fee Category (School Admin)
 */

// Check authentication
if (!isset($_SESSION['school_id']) || $_SESSION['user_type'] !== 'school') {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Get JSON input
$json = file_get_contents('php://input');
$data = json_decode($json, true);

// Validate input
if (!isset($data['id']) || empty($data['id'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Category ID is required']);
    exit;
}

$categoryId = intval($data['id']);

try {
    $database = new Database();
    $db = $database->getConnection();

    $schoolId = $_SESSION['school_id'];

    // Verify category belongs to this school
    $checkQuery = "SELECT * FROM fee_categories WHERE id = ? AND school_id = ?";
    $checkStmt = $db->prepare($checkQuery);
    $checkStmt->execute([$categoryId, $schoolId]);
    $category = $checkStmt->fetch(PDO::FETCH_ASSOC);

    if (!$category) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Fee category not found']);
        exit;
    }

    // Build update query
    $updateFields = [];
    $params = [];

    if (isset($data['name']) && !empty(trim($data['name']))) {
        $updateFields[] = "name = ?";
        $params[] = trim($data['name']);
    }

    if (isset($data['description'])) {
        $updateFields[] = "description = ?";
        $params[] = trim($data['description']);
    }

    if (isset($data['is_active'])) {
        $updateFields[] = "is_active = ?";
        $params[] = (bool)$data['is_active'];
    }

    if (empty($updateFields)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'No fields to update']);
        exit;
    }

    $updateFields[] = "updated_at = NOW()";
    $params[] = $categoryId;

    $updateQuery = "UPDATE fee_categories SET " . implode(', ', $updateFields) . " WHERE id = ?";
    $updateStmt = $db->prepare($updateQuery);
    $updateStmt->execute($params);

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Fee category updated successfully'
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error occurred',
        'error' => $e->getMessage()
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred',
        'error' => $e->getMessage()
    ]);
}
?>
