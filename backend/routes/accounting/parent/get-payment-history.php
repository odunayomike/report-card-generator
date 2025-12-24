<?php
/**
 * Get Payment History (Parent Mobile API)
 * Returns all payments made for a specific child
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
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

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Get student ID from query parameter
$studentId = isset($_GET['student_id']) ? intval($_GET['student_id']) : 0;

if (!$studentId) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Student ID is required']);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();

    // Verify that this student belongs to the logged-in parent
    $verifyQuery = "SELECT ps.student_id, s.name
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

    // Get payment history
    $paymentsQuery = "SELECT
                        fp.id,
                        fp.receipt_no,
                        fp.amount,
                        fp.payment_method,
                        fp.payment_date,
                        fp.transaction_reference,
                        fp.paystack_reference,
                        fp.bank_name,
                        fp.verification_status,
                        fp.verified_at,
                        fp.rejection_reason,
                        fp.notes,
                        fp.created_at,
                        fc.name as fee_category,
                        sf.session,
                        sf.term
                      FROM fee_payments fp
                      INNER JOIN student_fees sf ON fp.student_fee_id = sf.id
                      INNER JOIN fee_structure fs ON sf.fee_structure_id = fs.id
                      INNER JOIN fee_categories fc ON fs.fee_category_id = fc.id
                      WHERE fp.student_id = ?
                      ORDER BY fp.created_at DESC";

    $paymentsStmt = $db->prepare($paymentsQuery);
    $paymentsStmt->execute([$studentId]);
    $payments = $paymentsStmt->fetchAll(PDO::FETCH_ASSOC);

    // Format payments
    $formattedPayments = array_map(function($payment) {
        $status = $payment['verification_status'];
        $statusText = [
            'pending' => 'Awaiting Verification',
            'verified' => 'Verified',
            'rejected' => 'Rejected'
        ];

        return [
            'id' => (int)$payment['id'],
            'receipt_no' => $payment['receipt_no'],
            'amount' => (float)$payment['amount'],
            'payment_method' => $payment['payment_method'],
            'payment_date' => $payment['payment_date'],
            'fee_category' => $payment['fee_category'],
            'session' => $payment['session'],
            'term' => $payment['term'],
            'verification_status' => $status,
            'status_text' => $statusText[$status] ?? 'Unknown',
            'verified_at' => $payment['verified_at'],
            'rejection_reason' => $payment['rejection_reason'],
            'bank_name' => $payment['bank_name'],
            'transaction_reference' => $payment['transaction_reference'],
            'paystack_reference' => $payment['paystack_reference'],
            'notes' => $payment['notes'],
            'submitted_at' => $payment['created_at']
        ];
    }, $payments);

    // Calculate summary
    $totalPaid = array_sum(array_column($formattedPayments, 'amount'));
    $verifiedCount = count(array_filter($formattedPayments, function($p) {
        return $p['verification_status'] === 'verified';
    }));
    $pendingCount = count(array_filter($formattedPayments, function($p) {
        return $p['verification_status'] === 'pending';
    }));
    $rejectedCount = count(array_filter($formattedPayments, function($p) {
        return $p['verification_status'] === 'rejected';
    }));

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'data' => [
            'student_name' => $student['name'],
            'payments' => $formattedPayments,
            'summary' => [
                'total_payments' => count($formattedPayments),
                'total_amount_paid' => $totalPaid,
                'verified_count' => $verifiedCount,
                'pending_count' => $pendingCount,
                'rejected_count' => $rejectedCount
            ]
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error occurred',
        'error' => $e->getMessage()
    ]);
}
?>
