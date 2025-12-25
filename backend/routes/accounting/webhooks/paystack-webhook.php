<?php
/**
 * Paystack Webhook Handler
 * Automatically verifies and records payments when Paystack sends webhook notifications
 */

header('Content-Type: application/json');

require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../../config/paystack.php';

// Get the webhook payload
$input = file_get_contents('php://input');
$event = json_decode($input, true);

// Log webhook receipt
error_log("Paystack webhook received: " . $input);

// Verify webhook signature
$paystackSignature = $_SERVER['HTTP_X_PAYSTACK_SIGNATURE'] ?? '';

if (empty($paystackSignature)) {
    error_log("Webhook rejected: Missing signature");
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Missing signature']);
    exit;
}

// Verify the signature
$computedSignature = hash_hmac('sha512', $input, PAYSTACK_SECRET_KEY);

if ($paystackSignature !== $computedSignature) {
    error_log("Webhook rejected: Invalid signature");
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid signature']);
    exit;
}

// Process the event
$eventType = $event['event'] ?? '';

error_log("Processing webhook event: " . $eventType);

// We only care about successful charge events
if ($eventType !== 'charge.success') {
    error_log("Ignoring event type: " . $eventType);
    http_response_code(200);
    echo json_encode(['success' => true, 'message' => 'Event ignored']);
    exit;
}

try {
    $paymentData = $event['data'];
    $reference = $paymentData['reference'];
    $metadata = $paymentData['metadata'];

    error_log("Processing payment: " . $reference);

    // Validate metadata
    if (!isset($metadata['student_id']) || !isset($metadata['student_fee_id']) || !isset($metadata['fee_amount'])) {
        error_log("Invalid metadata: " . json_encode($metadata));
        http_response_code(200);
        echo json_encode(['success' => true, 'message' => 'Invalid metadata']);
        exit;
    }

    $studentId = intval($metadata['student_id']);
    $studentFeeId = intval($metadata['student_fee_id']);
    $amount = floatval($metadata['fee_amount']);
    $totalAmountPaid = $paymentData['amount'] / 100;
    $paymentDate = date('Y-m-d', strtotime($paymentData['paid_at']));
    $parentId = intval($metadata['parent_id']);

    error_log("Payment details - Student: $studentId, Fee: $studentFeeId, Amount: $amount");

    $database = new Database();
    $db = $database->getConnection();

    // Verify student exists and get school
    $verifyQuery = "SELECT s.school_id, s.name as student_name
                    FROM students s
                    WHERE s.id = ?";
    $verifyStmt = $db->prepare($verifyQuery);
    $verifyStmt->execute([$studentId]);
    $student = $verifyStmt->fetch(PDO::FETCH_ASSOC);

    if (!$student) {
        error_log("Student not found: $studentId");
        http_response_code(200);
        echo json_encode(['success' => true, 'message' => 'Student not found']);
        exit;
    }

    // Check if payment already recorded
    $checkQuery = "SELECT id FROM fee_payments WHERE paystack_reference = ?";
    $checkStmt = $db->prepare($checkQuery);
    $checkStmt->execute([$reference]);

    if ($checkStmt->fetch()) {
        error_log("Payment already recorded: $reference");
        http_response_code(200);
        echo json_encode(['success' => true, 'message' => 'Payment already recorded']);
        exit;
    }

    // Start transaction
    $db->beginTransaction();

    // Generate receipt number
    $receiptPrefix = 'RCT/' . date('Y') . '/';
    $countQuery = "SELECT COUNT(*) as count FROM fee_payments
                   WHERE school_id = ? AND YEAR(created_at) = YEAR(CURDATE())";
    $countStmt = $db->prepare($countQuery);
    $countStmt->execute([$student['school_id']]);
    $count = $countStmt->fetch(PDO::FETCH_ASSOC)['count'];
    $receiptNo = $receiptPrefix . str_pad($count + 1, 5, '0', STR_PAD_LEFT);

    error_log("Generated receipt: $receiptNo");

    // Insert payment record
    $insertQuery = "INSERT INTO fee_payments
                    (school_id, student_id, student_fee_id, receipt_no, amount,
                     payment_method, payment_date, paystack_reference,
                     verification_status, verified_at, notes)
                    VALUES (?, ?, ?, ?, ?, 'paystack', ?, ?, 'verified', NOW(), ?)";

    $platformFee = 200;
    $notes = sprintf(
        "Paid via Paystack (%s) - Fee: ₦%s, Platform Fee: ₦%s, Total: ₦%s",
        $paymentData['channel'],
        number_format($amount, 2),
        number_format($platformFee, 2),
        number_format($totalAmountPaid, 2)
    );

    $insertStmt = $db->prepare($insertQuery);
    $insertStmt->execute([
        $student['school_id'],
        $studentId,
        $studentFeeId,
        $receiptNo,
        $amount,
        $paymentDate,
        $reference,
        $notes
    ]);

    $paymentId = $db->lastInsertId();
    error_log("Payment record created: ID $paymentId");

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
    $updateFeeStmt->execute([$amount, $amount, $amount, $studentFeeId]);

    $rowsAffected = $updateFeeStmt->rowCount();
    error_log("Student fee updated - Fee ID: $studentFeeId, Amount: $amount, Rows affected: $rowsAffected");

    if ($rowsAffected === 0) {
        error_log("WARNING: No rows updated for student_fee_id: $studentFeeId");
    }

    // Commit transaction
    $db->commit();
    error_log("Transaction committed - Payment ID: $paymentId, Receipt: $receiptNo");

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Payment processed successfully',
        'payment_id' => $paymentId,
        'receipt_no' => $receiptNo
    ]);

} catch (PDOException $e) {
    if (isset($db) && $db->inTransaction()) {
        $db->rollBack();
    }

    error_log("Database error in webhook: " . $e->getMessage());

    http_response_code(200); // Return 200 to prevent Paystack retries
    echo json_encode([
        'success' => false,
        'message' => 'Database error',
        'error' => $e->getMessage()
    ]);
} catch (Exception $e) {
    error_log("Error in webhook: " . $e->getMessage());

    http_response_code(200);
    echo json_encode([
        'success' => false,
        'message' => 'Processing error',
        'error' => $e->getMessage()
    ]);
}
