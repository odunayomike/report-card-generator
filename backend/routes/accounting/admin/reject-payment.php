<?php
/**
 * Reject Payment (School Admin)
 * Reject a pending bank transfer payment
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

// Validate input
if (!isset($data['payment_id']) || empty($data['payment_id'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Payment ID is required']);
    exit;
}

if (!isset($data['reason']) || empty(trim($data['reason']))) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Rejection reason is required']);
    exit;
}

$paymentId = intval($data['payment_id']);
$reason = trim($data['reason']);

try {
    $database = new Database();
    $db = $database->getConnection();

    $schoolId = $_SESSION['school_id'];
    $adminEmail = $_SESSION['email'];

    // Get payment details
    $query = "SELECT *
              FROM fee_payments
              WHERE id = ? AND school_id = ?";
    $stmt = $db->prepare($query);
    $stmt->execute([$paymentId, $schoolId]);
    $payment = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$payment) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Payment not found']);
        exit;
    }

    // Check if already verified or rejected
    if ($payment['verification_status'] !== 'pending') {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Payment has already been ' . $payment['verification_status']
        ]);
        exit;
    }

    // Update payment verification status
    $updateQuery = "UPDATE fee_payments
                    SET verification_status = 'rejected',
                        rejection_reason = ?,
                        verified_at = NOW(),
                        verified_by = ?,
                        updated_at = NOW()
                    WHERE id = ?";
    $updateStmt = $db->prepare($updateQuery);
    $updateStmt->execute([$reason, $adminEmail, $paymentId]);

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Payment rejected successfully',
        'data' => [
            'payment_id' => $paymentId,
            'receipt_no' => $payment['receipt_no'],
            'rejection_reason' => $reason,
            'rejected_at' => date('Y-m-d H:i:s'),
            'rejected_by' => $adminEmail
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
?>
