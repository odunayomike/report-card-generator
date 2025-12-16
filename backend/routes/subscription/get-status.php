<?php
/**
 * Get current subscription status for the logged-in school
 */

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Check if user is authenticated
if (!isset($_SESSION['school_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Not authenticated']);
    exit;
}

try {
    $school_id = $_SESSION['school_id'];

    // Get database connection
    $database = new Database();
    $db = $database->getConnection();

    // Get school subscription info
    $stmt = $db->prepare("
        SELECT subscription_status, subscription_end_date
        FROM schools
        WHERE id = ?
    ");
    $stmt->execute([$school_id]);
    $school = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$school) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'School not found']);
        exit;
    }

    // Get current active subscription
    $stmt = $db->prepare("
        SELECT sh.*, sp.plan_name, sp.amount, sp.currency
        FROM subscription_history sh
        JOIN subscription_plans sp ON sh.plan_id = sp.id
        WHERE sh.school_id = ? AND sh.status = 'active'
        ORDER BY sh.end_date DESC
        LIMIT 1
    ");
    $stmt->execute([$school_id]);
    $current_subscription = $stmt->fetch(PDO::FETCH_ASSOC);

    // Get payment history
    $stmt = $db->prepare("
        SELECT sp.*, spl.plan_name
        FROM subscription_payments sp
        JOIN subscription_plans spl ON sp.plan_id = spl.id
        WHERE sp.school_id = ? AND sp.status = 'success'
        ORDER BY sp.paid_at DESC
        LIMIT 5
    ");
    $stmt->execute([$school_id]);
    $payment_history = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Check if subscription has expired
    $is_expired = false;
    if ($school['subscription_end_date']) {
        $is_expired = strtotime($school['subscription_end_date']) < time();
        if ($is_expired && $school['subscription_status'] === 'active') {
            // Update status to expired
            $stmt = $db->prepare("
                UPDATE schools
                SET subscription_status = 'expired'
                WHERE id = ?
            ");
            $stmt->execute([$school_id]);
            $school['subscription_status'] = 'expired';
        }
    }

    // Calculate days remaining
    $days_remaining = 0;
    if ($school['subscription_end_date'] && !$is_expired) {
        $days_remaining = ceil((strtotime($school['subscription_end_date']) - time()) / 86400);
    }

    echo json_encode([
        'success' => true,
        'subscription' => [
            'status' => $school['subscription_status'],
            'end_date' => $school['subscription_end_date'],
            'days_remaining' => $days_remaining,
            'is_active' => $school['subscription_status'] === 'active'
        ],
        'current_subscription' => $current_subscription,
        'payment_history' => $payment_history
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
