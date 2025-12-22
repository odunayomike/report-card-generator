<?php
/**
 * Initialize Paystack payment for subscription
 */

require_once __DIR__ . '/../../config/paystack.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
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
    $data = json_decode(file_get_contents('php://input'), true);
    $plan_id = $data['plan_id'] ?? null;
    $plan_type = $data['plan_type'] ?? 'monthly'; // monthly, term, or yearly

    $school_id = $_SESSION['school_id'];

    // Get database connection
    $database = new Database();
    $db = $database->getConnection();

    // Get school details
    $stmt = $db->prepare("SELECT email, school_name FROM schools WHERE id = ?");
    $stmt->execute([$school_id]);
    $school = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$school) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'School not found']);
        exit;
    }

    // Get plan details - either by ID or by plan_type
    if ($plan_id) {
        $stmt = $db->prepare("SELECT * FROM subscription_plans WHERE id = ? AND is_active = TRUE");
        $stmt->execute([$plan_id]);
        $plan = $stmt->fetch(PDO::FETCH_ASSOC);
    } else {
        // Lookup plan by type
        $plan_name = $plan_type === 'yearly' ? 'Yearly Plan'
            : ($plan_type === 'term' ? 'Per Term Plan' : 'Monthly Plan');
        $stmt = $db->prepare("SELECT * FROM subscription_plans WHERE plan_name = ? AND is_active = TRUE");
        $stmt->execute([$plan_name]);
        $plan = $stmt->fetch(PDO::FETCH_ASSOC);
    }

    if (!$plan) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Plan not found']);
        exit;
    }

    // Generate unique reference
    $reference = generatePaymentReference();

    // Save payment record as pending
    $stmt = $db->prepare("
        INSERT INTO subscription_payments
        (school_id, plan_id, reference, amount, currency, status)
        VALUES (?, ?, ?, ?, ?, 'pending')
    ");
    $stmt->execute([
        $school_id,
        $plan_id,
        $reference,
        $plan['amount'],
        $plan['currency']
    ]);

    // Initialize Paystack payment
    // Amount must be in kobo (multiply by 100)
    $amount_in_kobo = $plan['amount'] * 100;

    $paystack_response = initializePaystackPayment(
        $school['email'],
        $amount_in_kobo,
        $reference,
        [
            'school_id' => $school_id,
            'school_name' => $school['school_name'],
            'plan_name' => $plan['plan_name']
        ]
    );

    if (!$paystack_response['status']) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Failed to initialize payment',
            'error' => $paystack_response['message'] ?? 'Unknown error'
        ]);
        exit;
    }

    // Return payment URL and reference
    echo json_encode([
        'success' => true,
        'authorization_url' => $paystack_response['data']['authorization_url'],
        'access_code' => $paystack_response['data']['access_code'],
        'reference' => $reference
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
