<?php
/**
 * Archive/Unarchive Fee Structure (School Admin)
 * Toggle the is_active status of a fee structure
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

if (!isset($data['id']) || empty($data['id'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Fee structure ID is required']);
    exit;
}

if (!isset($data['is_active'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'is_active status is required']);
    exit;
}

$id = intval($data['id']);
$isActive = (int)(bool)$data['is_active'];

try {
    $database = new Database();
    $db = $database->getConnection();

    $schoolId = $_SESSION['school_id'];

    // Verify fee structure belongs to this school
    $checkQuery = "SELECT id, is_active FROM fee_structure WHERE id = ? AND school_id = ?";
    $checkStmt = $db->prepare($checkQuery);
    $checkStmt->execute([$id, $schoolId]);
    $feeStructure = $checkStmt->fetch(PDO::FETCH_ASSOC);

    if (!$feeStructure) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Fee structure not found']);
        exit;
    }

    // Update is_active status
    $updateQuery = "UPDATE fee_structure SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND school_id = ?";
    $updateStmt = $db->prepare($updateQuery);
    $updateStmt->execute([$isActive, $id, $schoolId]);

    $action = $isActive ? 'activated' : 'archived';

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => "Fee structure {$action} successfully",
        'data' => [
            'id' => $id,
            'is_active' => (bool)$isActive
        ]
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
