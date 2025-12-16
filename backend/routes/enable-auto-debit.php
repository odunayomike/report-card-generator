<?php
/**
 * Enable Auto-Debit for School
 * This endpoint is called after a successful payment to store the authorization code
 * and enable auto-debit for future payments
 */

$database = new Database();
$db = $database->getConnection();

$school_id = isset($_SESSION['school_id']) ? $_SESSION['school_id'] : null;

if (!$school_id) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit();
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

$reference = isset($input['reference']) ? $input['reference'] : null;
$enable_auto_debit = isset($input['enable_auto_debit']) ? $input['enable_auto_debit'] : false;

if (!$reference) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Payment reference is required']);
    exit();
}

try {
    // Verify the payment with Paystack
    require_once __DIR__ . '/../config/paystack.php';
    $verification = verifyPaystackPayment($reference);

    if (!$verification || !isset($verification['status']) || $verification['status'] !== true) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Payment verification failed']);
        exit();
    }

    $data = $verification['data'];
    $authorization = isset($data['authorization']) ? $data['authorization'] : null;
    $customer = isset($data['customer']) ? $data['customer'] : null;

    if (!$authorization || !$customer) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Authorization data not found']);
        exit();
    }

    // Extract authorization details
    $authorization_code = $authorization['authorization_code'];
    $card_last4 = isset($authorization['last4']) ? $authorization['last4'] : null;
    $card_brand = isset($authorization['brand']) ? $authorization['brand'] : null;
    $customer_code = isset($customer['customer_code']) ? $customer['customer_code'] : null;

    // Calculate next billing date (30 days from now)
    $next_billing_date = date('Y-m-d', strtotime('+30 days'));

    // Update school with authorization code and auto-debit status
    $query = "
        UPDATE schools
        SET authorization_code = :auth_code,
            customer_code = :customer_code,
            auto_debit_enabled = :auto_debit,
            card_last4 = :last4,
            card_brand = :brand,
            next_billing_date = :next_billing
        WHERE id = :school_id
    ";

    $stmt = $db->prepare($query);
    $stmt->execute([
        ':auth_code' => $authorization_code,
        ':customer_code' => $customer_code,
        ':auto_debit' => $enable_auto_debit ? 1 : 0,
        ':last4' => $card_last4,
        ':brand' => $card_brand,
        ':next_billing' => $next_billing_date,
        ':school_id' => $school_id
    ]);

    // Update the payment record with authorization code
    $updatePaymentQuery = "
        UPDATE subscription_payments
        SET authorization_code = :auth_code
        WHERE reference = :reference AND school_id = :school_id
    ";
    $updateStmt = $db->prepare($updatePaymentQuery);
    $updateStmt->execute([
        ':auth_code' => $authorization_code,
        ':reference' => $reference,
        ':school_id' => $school_id
    ]);

    // Create default notification preferences if they don't exist
    $notifQuery = "
        INSERT INTO notification_preferences (school_id)
        VALUES (:school_id)
        ON DUPLICATE KEY UPDATE school_id = school_id
    ";
    $notifStmt = $db->prepare($notifQuery);
    $notifStmt->execute([':school_id' => $school_id]);

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => $enable_auto_debit ? 'Auto-debit enabled successfully' : 'Payment processed successfully',
        'auto_debit_enabled' => $enable_auto_debit,
        'card_details' => [
            'last4' => $card_last4,
            'brand' => $card_brand
        ],
        'next_billing_date' => $next_billing_date
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error enabling auto-debit: ' . $e->getMessage()
    ]);
}
