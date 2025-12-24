<?php
/**
 * Parent Submit Payment (Bank Transfer with Receipt Upload or Paystack)
 * Parents can upload bank transfer receipts or pay via Paystack
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
$required = ['student_id', 'student_fee_id', 'amount', 'payment_method', 'payment_date'];
foreach ($required as $field) {
    if (!isset($data[$field]) || empty($data[$field])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => ucfirst(str_replace('_', ' ', $field)) . ' is required'
        ]);
        exit;
    }
}

$studentId = intval($data['student_id']);
$studentFeeId = intval($data['student_fee_id']);
$amount = floatval($data['amount']);
$paymentMethod = $data['payment_method'];
$paymentDate = $data['payment_date'];

// Bank transfer specific fields
$transferReceiptImage = isset($data['transfer_receipt_image']) ? $data['transfer_receipt_image'] : null;
$bankName = isset($data['bank_name']) ? trim($data['bank_name']) : null;
$accountNumber = isset($data['account_number']) ? trim($data['account_number']) : null;

// Paystack specific fields
$paystackReference = isset($data['paystack_reference']) ? $data['paystack_reference'] : null;

$notes = isset($data['notes']) ? trim($data['notes']) : null;

// Validate payment method
$validMethods = ['bank_transfer', 'paystack'];
if (!in_array($paymentMethod, $validMethods)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Invalid payment method. Use bank_transfer or paystack'
    ]);
    exit;
}

// Validate bank transfer requirements
if ($paymentMethod === 'bank_transfer') {
    if (!$transferReceiptImage) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Receipt image is required for bank transfer'
        ]);
        exit;
    }
    if (!$bankName || !$accountNumber) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Bank name and account number are required for bank transfer'
        ]);
        exit;
    }
}

// Validate Paystack requirements
if ($paymentMethod === 'paystack' && !$paystackReference) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Paystack reference is required for online payment'
    ]);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();

    // Verify that this student belongs to the logged-in parent
    $verifyQuery = "SELECT ps.student_id, s.school_id, s.name as student_name
                    FROM parent_students ps
                    INNER JOIN students s ON ps.student_id = s.id
                    WHERE ps.parent_id = ? AND ps.student_id = ?";
    $verifyStmt = $db->prepare($verifyQuery);
    $verifyStmt->execute([$_SESSION['parent_id'], $studentId]);
    $student = $verifyStmt->fetch(PDO::FETCH_ASSOC);

    if (!$student) {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'message' => 'You do not have access to this student'
        ]);
        exit;
    }

    $schoolId = $student['school_id'];
    $studentName = $student['student_name'];

    // Verify student fee exists and get details
    $feeQuery = "SELECT sf.*, fs.fee_category_id, fc.name as category_name
                 FROM student_fees sf
                 INNER JOIN fee_structure fs ON sf.fee_structure_id = fs.id
                 INNER JOIN fee_categories fc ON fs.fee_category_id = fc.id
                 WHERE sf.id = ? AND sf.student_id = ?";
    $feeStmt = $db->prepare($feeQuery);
    $feeStmt->execute([$studentFeeId, $studentId]);
    $fee = $feeStmt->fetch(PDO::FETCH_ASSOC);

    if (!$fee) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Fee record not found'
        ]);
        exit;
    }

    // Validate amount
    if ($amount <= 0) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Payment amount must be greater than zero'
        ]);
        exit;
    }

    if ($amount > $fee['balance']) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Payment amount cannot exceed outstanding balance'
        ]);
        exit;
    }

    // Start transaction
    $db->beginTransaction();

    // Generate receipt number
    $receiptPrefix = 'RCT/' . date('Y') . '/';
    $countQuery = "SELECT COUNT(*) as count FROM fee_payments WHERE school_id = ? AND YEAR(created_at) = YEAR(CURDATE())";
    $countStmt = $db->prepare($countQuery);
    $countStmt->execute([$schoolId]);
    $count = $countStmt->fetch(PDO::FETCH_ASSOC)['count'];
    $receiptNo = $receiptPrefix . str_pad($count + 1, 5, '0', STR_PAD_LEFT);

    // Determine verification status
    // Paystack payments are auto-verified, bank transfers need manual verification
    $verificationStatus = ($paymentMethod === 'paystack') ? 'verified' : 'pending';

    // Insert payment record
    $insertQuery = "INSERT INTO fee_payments
                    (school_id, student_id, student_fee_id, receipt_no, amount,
                     payment_method, payment_date, paystack_reference,
                     transfer_receipt_image, bank_name, account_number,
                     notes, verification_status, verified_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

    $verifiedAt = ($paymentMethod === 'paystack') ? date('Y-m-d H:i:s') : null;

    $insertStmt = $db->prepare($insertQuery);
    $insertStmt->execute([
        $schoolId,
        $studentId,
        $studentFeeId,
        $receiptNo,
        $amount,
        $paymentMethod,
        $paymentDate,
        $paystackReference,
        $transferReceiptImage,
        $bankName,
        $accountNumber,
        $notes,
        $verificationStatus,
        $verifiedAt
    ]);

    $paymentId = $db->lastInsertId();

    // Update student_fees only if payment is verified (Paystack)
    if ($verificationStatus === 'verified') {
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
    }

    // Commit transaction
    $db->commit();

    $message = ($paymentMethod === 'paystack')
        ? 'Payment submitted and verified successfully'
        : 'Payment submitted successfully. Awaiting verification by school.';

    http_response_code(201);
    echo json_encode([
        'success' => true,
        'message' => $message,
        'data' => [
            'payment_id' => (int)$paymentId,
            'receipt_no' => $receiptNo,
            'amount' => $amount,
            'payment_method' => $paymentMethod,
            'verification_status' => $verificationStatus,
            'student_name' => $studentName,
            'fee_category' => $fee['category_name']
        ]
    ]);

} catch (PDOException $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }

    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error occurred',
        'error' => $e->getMessage()
    ]);
}
?>
