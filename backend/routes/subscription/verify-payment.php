<?php
/**
 * Verify Paystack payment and activate subscription
 */

require_once __DIR__ . '/../../config/paystack.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

try {
    $reference = $_GET['reference'] ?? null;

    if (!$reference) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Payment reference is required']);
        exit;
    }

    // Get database connection
    $database = new Database();
    $db = $database->getConnection();

    // Get payment record
    $stmt = $db->prepare("
        SELECT sp.*, pl.duration_days
        FROM subscription_payments sp
        JOIN subscription_plans pl ON sp.plan_id = pl.id
        WHERE sp.reference = ?
    ");
    $stmt->execute([$reference]);
    $payment = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$payment) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Payment not found']);
        exit;
    }

    // If already verified, return success
    if ($payment['status'] === 'success') {
        echo json_encode([
            'success' => true,
            'message' => 'Payment already verified',
            'payment' => $payment
        ]);
        exit;
    }

    // Verify payment with Paystack
    $paystack_response = verifyPaystackPayment($reference);

    if (!$paystack_response['status']) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Payment verification failed',
            'error' => $paystack_response['message'] ?? 'Unknown error'
        ]);
        exit;
    }

    $paystack_data = $paystack_response['data'];

    // Check if payment was successful
    if ($paystack_data['status'] !== 'success') {
        // Update payment status to failed
        $stmt = $db->prepare("
            UPDATE subscription_payments
            SET status = 'failed', paystack_reference = ?, updated_at = NOW()
            WHERE reference = ?
        ");
        $stmt->execute([$paystack_data['reference'], $reference]);

        echo json_encode([
            'success' => false,
            'message' => 'Payment was not successful',
            'status' => $paystack_data['status']
        ]);
        exit;
    }

    // Begin transaction
    $db->beginTransaction();

    try {
        // Update payment record
        $stmt = $db->prepare("
            UPDATE subscription_payments
            SET status = 'success',
                paystack_reference = ?,
                payment_method = ?,
                paid_at = NOW(),
                updated_at = NOW()
            WHERE reference = ?
        ");
        $stmt->execute([
            $paystack_data['reference'],
            $paystack_data['channel'] ?? 'card',
            $reference
        ]);

        $payment_id = $payment['id'];

        // Calculate subscription dates
        $start_date = date('Y-m-d');
        $end_date = date('Y-m-d', strtotime('+' . $payment['duration_days'] . ' days'));

        // Create subscription history
        $stmt = $db->prepare("
            INSERT INTO subscription_history
            (school_id, payment_id, plan_id, start_date, end_date, status)
            VALUES (?, ?, ?, ?, ?, 'active')
        ");
        $stmt->execute([
            $payment['school_id'],
            $payment_id,
            $payment['plan_id'],
            $start_date,
            $end_date
        ]);

        // Update school subscription status
        $stmt = $db->prepare("
            UPDATE schools
            SET subscription_status = 'active',
                subscription_end_date = ?,
                updated_at = NOW()
            WHERE id = ?
        ");
        $stmt->execute([$end_date, $payment['school_id']]);

        $db->commit();

        echo json_encode([
            'success' => true,
            'message' => 'Subscription activated successfully',
            'subscription' => [
                'start_date' => $start_date,
                'end_date' => $end_date,
                'status' => 'active'
            ]
        ]);

    } catch (Exception $e) {
        $db->rollBack();
        throw $e;
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
