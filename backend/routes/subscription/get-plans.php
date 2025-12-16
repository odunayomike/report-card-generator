<?php
/**
 * Get all active subscription plans
 */

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Get database connection
$database = new Database();
$db = $database->getConnection();

try {
    // Get all active plans
    $stmt = $db->prepare("
        SELECT id, plan_name, amount, duration_days, currency, description
        FROM subscription_plans
        WHERE is_active = TRUE
        ORDER BY amount ASC
    ");

    $stmt->execute();
    $plans = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'plans' => $plans
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
