<?php
/**
 * Create New Fee Category
 */

// Check authentication
if (!isset($_SESSION['school_id'])) {
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
if (!isset($data['name']) || empty(trim($data['name']))) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Category name is required']);
    exit;
}

$name = trim($data['name']);
$description = isset($data['description']) ? trim($data['description']) : null;
$isActive = isset($data['is_active']) ? (bool)$data['is_active'] : true;

try {
    $database = new Database();
    $db = $database->getConnection();

    // Check if category already exists
    $checkQuery = "SELECT id FROM fee_categories
                   WHERE school_id = ? AND name = ?";
    $checkStmt = $db->prepare($checkQuery);
    $checkStmt->execute([$_SESSION['school_id'], $name]);

    if ($checkStmt->fetch()) {
        http_response_code(409);
        echo json_encode([
            'success' => false,
            'message' => 'A fee category with this name already exists'
        ]);
        exit;
    }

    // Insert new category
    $insertQuery = "INSERT INTO fee_categories (school_id, name, description, is_active)
                    VALUES (?, ?, ?, ?)";
    $insertStmt = $db->prepare($insertQuery);
    $insertStmt->execute([$_SESSION['school_id'], $name, $description, $isActive]);

    $categoryId = $db->lastInsertId();

    http_response_code(201);
    echo json_encode([
        'success' => true,
        'message' => 'Fee category created successfully',
        'data' => [
            'id' => (int)$categoryId,
            'name' => $name,
            'description' => $description,
            'is_active' => $isActive
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
