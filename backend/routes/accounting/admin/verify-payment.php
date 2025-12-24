<?php
/**
 * Verify Payment (School Admin)
 * Approve a pending bank transfer payment
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

$paymentId = intval($data['payment_id']);
$notes = isset($data['notes']) ? trim($data['notes']) : null;

try {
    $database = new Database();
    $db = $database->getConnection();

    $schoolId = $_SESSION['school_id'];
    $adminEmail = $_SESSION['email'];

    // Get payment details
    $query = "SELECT fp.*, sf.fee_structure_id
              FROM fee_payments fp
              INNER JOIN student_fees sf ON fp.student_fee_id = sf.id
              WHERE fp.id = ? AND fp.school_id = ?";
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

    // Start transaction
    $db->beginTransaction();

    // Update payment verification status
    $updateQuery = "UPDATE fee_payments
                    SET verification_status = 'verified',
                        verified_at = NOW(),
                        verified_by = ?,
                        notes = CASE
                            WHEN ? IS NOT NULL THEN CONCAT(COALESCE(notes, ''), ' | Admin note: ', ?)
                            ELSE notes
                        END,
                        updated_at = NOW()
                    WHERE id = ?";
    $updateStmt = $db->prepare($updateQuery);
    $updateStmt->execute([$adminEmail, $notes, $notes, $paymentId]);

    // Update student fees
    $updateFeeQuery = "UPDATE student_fees
                       SET amount_paid = amount_paid + ?,
                           status = CASE
                               WHEN (amount_paid + ?) >= amount_due THEN 'paid'
                               WHEN (amount_paid + ?) > 0 THEN 'partial'
                               ELSE status
                           END,
                           updated_at = NOW()
                       WHERE id = ?";
    $updateFeeStmt = $db->prepare($updateFeeQuery);
    $updateFeeStmt->execute([
        $payment['amount'],
        $payment['amount'],
        $payment['amount'],
        $payment['student_fee_id']
    ]);

    // Commit transaction
    $db->commit();

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Payment verified successfully',
        'data' => [
            'payment_id' => $paymentId,
            'receipt_no' => $payment['receipt_no'],
            'amount' => (float)$payment['amount'],
            'verified_at' => date('Y-m-d H:i:s'),
            'verified_by' => $adminEmail
        ]
    ]);

} catch (PDOException $e) {
    if (isset($db) && $db->inTransaction()) {
        $db->rollBack();
    }

    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error occurred',
        'error' => $e->getMessage()
    ]);
} catch (Exception $e) {
    if (isset($db) && $db->inTransaction()) {
        $db->rollBack();
    }

    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred',
        'error' => $e->getMessage()
    ]);
}
?>
