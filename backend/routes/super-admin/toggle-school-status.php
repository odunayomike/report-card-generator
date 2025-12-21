<?php
// Toggle School Active Status (Super Admin)

require_once __DIR__ . '/../../middleware/super-admin-check.php';
requireSuperAdmin();

require_once __DIR__ . '/../../config/database.php';

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['school_id'])) {
    http_response_code(400);
    echo json_encode(['error' => 'School ID is required']);
    exit;
}

$school_id = (int)$input['school_id'];
$is_active = isset($input['is_active']) ? (bool)$input['is_active'] : null;

try {
    $db = new Database();
    $conn = $db->getConnection();

    // Get current school status
    $stmt = $conn->prepare("SELECT id, school_name, is_active FROM schools WHERE id = :school_id");
    $stmt->bindParam(':school_id', $school_id);
    $stmt->execute();

    $school = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$school) {
        http_response_code(404);
        echo json_encode(['error' => 'School not found']);
        exit;
    }

    // If is_active not specified, toggle current status
    if ($is_active === null) {
        $is_active = !$school['is_active'];
    }

    // Update school status
    $updateStmt = $conn->prepare("
        UPDATE schools
        SET is_active = :is_active,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = :school_id
    ");
    $updateStmt->bindParam(':is_active', $is_active, PDO::PARAM_BOOL);
    $updateStmt->bindParam(':school_id', $school_id);
    $updateStmt->execute();

    // Log activity
    $action_type = $is_active ? 'school_activate' : 'school_deactivate';
    $description = $is_active
        ? "Activated school: {$school['school_name']}"
        : "Deactivated school: {$school['school_name']}";

    logSuperAdminActivity($action_type, 'school', $description, $school_id, $school_id);

    http_response_code(200);
    echo json_encode([
        'message' => 'School status updated successfully',
        'school_id' => $school_id,
        'is_active' => $is_active
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
