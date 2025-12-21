<?php
// Update School Subscription (Super Admin Override)

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
$subscription_status = $input['subscription_status'] ?? null;
$subscription_end_date = $input['subscription_end_date'] ?? null;

if (!in_array($subscription_status, ['active', 'expired', 'trial'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid subscription status']);
    exit;
}

try {
    $db = new Database();
    $conn = $db->getConnection();

    // Get school info
    $stmt = $conn->prepare("SELECT id, school_name FROM schools WHERE id = :school_id");
    $stmt->bindParam(':school_id', $school_id);
    $stmt->execute();

    $school = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$school) {
        http_response_code(404);
        echo json_encode(['error' => 'School not found']);
        exit;
    }

    // Update subscription
    $updateStmt = $conn->prepare("
        UPDATE schools
        SET subscription_status = :status,
            subscription_end_date = :end_date,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = :school_id
    ");
    $updateStmt->bindParam(':status', $subscription_status);
    $updateStmt->bindParam(':end_date', $subscription_end_date);
    $updateStmt->bindParam(':school_id', $school_id);
    $updateStmt->execute();

    // Log activity
    $description = "Updated subscription for school: {$school['school_name']} to $subscription_status" .
                   ($subscription_end_date ? " until $subscription_end_date" : "");

    logSuperAdminActivity('subscription_override', 'subscription', $description, null, $school_id);

    http_response_code(200);
    echo json_encode([
        'message' => 'Subscription updated successfully',
        'school_id' => $school_id,
        'subscription_status' => $subscription_status,
        'subscription_end_date' => $subscription_end_date
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
