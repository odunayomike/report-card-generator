<?php
/**
 * Verify Paystack Payment (Parent Mobile API)
 * Verifies payment with Paystack and creates payment record
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../../config/paystack.php';

// Start session
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Check authentication
if (!isset($_SESSION['parent_id']) || $_SESSION['user_type'] !== 'parent') {
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
if (!isset($data['reference']) || empty($data['reference'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Payment reference is required']);
    exit;
}

$reference = trim($data['reference']);

try {
    // Verify payment with Paystack
    $url = "https://api.paystack.co/transaction/verify/" . $reference;

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Authorization: Bearer " . PAYSTACK_SECRET_KEY
    ]);

    $result = curl_exec($ch);
    $httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpcode !== 200) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Failed to verify payment with Paystack'
        ]);
        exit;
    }

    $response = json_decode($result, true);

    if (!$response['status'] || $response['data']['status'] !== 'success') {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Payment verification failed',
            'payment_status' => $response['data']['status'] ?? 'unknown'
        ]);
        exit;
    }

    $paymentData = $response['data'];
    $metadata = $paymentData['metadata'];

    // Extract metadata
    $studentId = $metadata['student_id'];
    $studentFeeId = $metadata['student_fee_id'];
    $amount = $paymentData['amount'] / 100; // Convert from kobo to naira
    $paymentDate = date('Y-m-d', strtotime($paymentData['paid_at']));

    $database = new Database();
    $db = $database->getConnection();

    // Verify parent owns this student
    $verifyQuery = "SELECT s.school_id, s.name as student_name
                    FROM parent_students ps
                    INNER JOIN students s ON ps.student_id = s.id
                    WHERE ps.parent_id = ? AND ps.student_id = ?";
    $verifyStmt = $db->prepare($verifyQuery);
    $verifyStmt->execute([$_SESSION['parent_id'], $studentId]);
    $student = $verifyStmt->fetch(PDO::FETCH_ASSOC);

    if (!$student) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Access denied']);
        exit;
    }

    // Check if payment already recorded
    $checkQuery = "SELECT id FROM fee_payments WHERE paystack_reference = ?";
    $checkStmt = $db->prepare($checkQuery);
    $checkStmt->execute([$reference]);

    if ($checkStmt->fetch()) {
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Payment already recorded',
            'already_processed' => true
        ]);
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

    // Insert payment record
    $insertQuery = "INSERT INTO fee_payments
                    (school_id, student_id, student_fee_id, receipt_no, amount,
                     payment_method, payment_date, paystack_reference,
                     verification_status, verified_at, notes)
                    VALUES (?, ?, ?, ?, ?, 'paystack', ?, ?, 'verified', NOW(), ?)";

    $notes = "Paid via Paystack - " . $paymentData['channel'];

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

    // Commit transaction
    $db->commit();

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Payment verified and recorded successfully',
        'data' => [
            'payment_id' => (int)$paymentId,
            'receipt_no' => $receiptNo,
            'amount' => $amount,
            'payment_date' => $paymentDate,
            'student_name' => $student['student_name'],
            'paystack_reference' => $reference,
            'verification_status' => 'verified'
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
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred',
        'error' => $e->getMessage()
    ]);
}
?>
