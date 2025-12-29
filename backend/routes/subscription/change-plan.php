<?php
/**
 * Change subscription plan (upgrade/downgrade)
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
    $new_plan_type = $data['new_plan_type'] ?? null;

    if (!$new_plan_type || !in_array($new_plan_type, ['monthly', 'term', 'yearly'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Valid plan type is required (monthly, term, or yearly)']);
        exit;
    }

    $school_id = $_SESSION['school_id'];

    // Get database connection
    $database = new Database();
    $db = $database->getConnection();

    // Get school details
    $stmt = $db->prepare("SELECT email, school_name, subscription_status, subscription_end_date FROM schools WHERE id = ?");
    $stmt->execute([$school_id]);
    $school = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$school) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'School not found']);
        exit;
    }

    // Check if school has active subscription
    if ($school['subscription_status'] !== 'active') {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'No active subscription to change']);
        exit;
    }

    // Get current subscription
    $stmt = $db->prepare("
        SELECT sh.*, sp.plan_name, sp.amount as old_amount, sp.duration_days as old_duration
        FROM subscription_history sh
        JOIN subscription_plans sp ON sh.plan_id = sp.id
        WHERE sh.school_id = ? AND sh.status = 'active'
        ORDER BY sh.end_date DESC
        LIMIT 1
    ");
    $stmt->execute([$school_id]);
    $current_subscription = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$current_subscription) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Current subscription not found']);
        exit;
    }

    // Get new plan details
    $new_plan_name = $new_plan_type === 'yearly' ? 'Yearly Plan'
        : ($new_plan_type === 'term' ? 'Per Term Plan' : 'Monthly Plan');
    $stmt = $db->prepare("SELECT * FROM subscription_plans WHERE plan_name = ? AND is_active = TRUE");
    $stmt->execute([$new_plan_name]);
    $new_plan = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$new_plan) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'New plan not found']);
        exit;
    }

    // Check if already on this plan
    if ($current_subscription['plan_name'] === $new_plan_name) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'You are already on this plan']);
        exit;
    }

    // Calculate prorated amount
    $days_remaining = max(1, ceil((strtotime($school['subscription_end_date']) - time()) / 86400));
    $is_upgrade = $new_plan['amount'] > $current_subscription['old_amount'];

    // Calculate the unused portion of the current plan
    $daily_rate_old = $current_subscription['old_amount'] / $current_subscription['old_duration'];
    $unused_amount = $daily_rate_old * $days_remaining;

    // Calculate the cost for the remaining days on the new plan
    $daily_rate_new = $new_plan['amount'] / $new_plan['duration_days'];
    $new_plan_cost_for_remaining_days = $daily_rate_new * $days_remaining;

    if ($is_upgrade) {
        // Upgrading from Monthly to Yearly
        // User pays for the full new plan and gets credit for unused time on old plan
        $amount_to_charge = $new_plan['amount'] - $unused_amount;
        $amount_to_charge = max(0, round($amount_to_charge, 2)); // Ensure non-negative and round

        // Set new end date to today + new plan duration
        $new_end_date = date('Y-m-d', time() + ($new_plan['duration_days'] * 86400));
        $immediate_change = true;

        // Store calculation details for reference
        $calculation_details = [
            'days_remaining' => $days_remaining,
            'old_plan_cost' => $current_subscription['old_amount'],
            'unused_amount' => round($unused_amount, 2),
            'new_plan_cost' => $new_plan['amount'],
            'amount_to_charge' => $amount_to_charge,
            'credit_applied' => round($unused_amount, 2),
            'old_plan' => $current_subscription['plan_name'],
            'new_plan' => $new_plan_name,
            'new_end_date' => $new_end_date
        ];

    } else {
        // Downgrading from Yearly to Monthly
        // Credit: Unused amount from old plan
        // They will receive a credit that will be applied to future monthly payments
        $credit_amount = $unused_amount;

        // Calculate how many months this credit covers
        $months_covered = floor($credit_amount / $new_plan['amount']);
        $remaining_credit = $credit_amount - ($months_covered * $new_plan['amount']);

        // If credit covers full billing, schedule downgrade at end of current period
        if ($months_covered > 0) {
            // Apply credit - no payment needed
            // Store the credit and scheduled downgrade
            http_response_code(200);
            echo json_encode([
                'success' => true,
                'message' => 'Plan downgrade scheduled with credit applied',
                'scheduled_change' => [
                    'new_plan' => $new_plan_name,
                    'effective_date' => $school['subscription_end_date'],
                    'credit_amount' => round($credit_amount, 2),
                    'months_covered' => $months_covered,
                    'remaining_credit' => round($remaining_credit, 2),
                    'next_payment_date' => date('Y-m-d', strtotime($school['subscription_end_date']) + ($months_covered * 30 * 86400))
                ],
                'info' => [
                    'message' => "Your unused balance of ₦" . number_format($credit_amount, 2) . " will cover {$months_covered} month(s) of the monthly plan.",
                    'next_charge' => "Your next charge will be on " . date('F j, Y', strtotime($school['subscription_end_date']) + ($months_covered * 30 * 86400))
                ]
            ]);

            // TODO: Store the scheduled plan change and credit in database
            exit;
        } else {
            // Credit doesn't cover a full month, apply partial credit to first payment
            $amount_to_charge = $new_plan['amount'] - $credit_amount;
            $amount_to_charge = max(0, round($amount_to_charge, 2));
            $immediate_change = true;
            $new_end_date = date('Y-m-d', strtotime('+30 days'));

            $calculation_details = [
                'days_remaining' => $days_remaining,
                'credit_applied' => round($credit_amount, 2),
                'monthly_plan_cost' => $new_plan['amount'],
                'amount_to_charge' => $amount_to_charge,
                'old_plan' => $current_subscription['plan_name'],
                'new_plan' => $new_plan_name,
                'new_end_date' => $new_end_date
            ];
        }
    }

    // Generate unique reference for plan change payment
    $reference = generatePaymentReference();

    // Save payment record as pending
    $stmt = $db->prepare("
        INSERT INTO subscription_payments
        (school_id, plan_id, reference, amount, currency, status)
        VALUES (?, ?, ?, ?, ?, 'pending')
    ");
    $stmt->execute([
        $school_id,
        $new_plan['id'],
        $reference,
        $amount_to_charge,
        $new_plan['currency']
    ]);

    // Initialize Paystack payment
    $amount_in_kobo = $amount_to_charge * 100;

    $paystack_response = initializePaystackPayment(
        $school['email'],
        $amount_in_kobo,
        $reference,
        [
            'school_id' => $school_id,
            'school_name' => $school['school_name'],
            'plan_name' => $new_plan['plan_name'],
            'plan_change' => true,
            'immediate_change' => $immediate_change
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

    // Return payment URL
    echo json_encode([
        'success' => true,
        'authorization_url' => $paystack_response['data']['authorization_url'],
        'access_code' => $paystack_response['data']['access_code'],
        'reference' => $reference,
        'amount_to_charge' => $amount_to_charge,
        'calculation_details' => $calculation_details,
        'message' => $is_upgrade
            ? "Upgrade payment: ₦" . number_format($amount_to_charge, 2) . " (prorated for {$days_remaining} days remaining)"
            : "Downgrade payment: ₦" . number_format($amount_to_charge, 2) . " (credit applied: ₦" . number_format($calculation_details['credit_applied'], 2) . ")"
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
