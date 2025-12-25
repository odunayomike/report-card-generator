<?php
/**
 * Debug Payments - Check all verified payments
 * This endpoint helps debug financial report calculations
 */

require_once __DIR__ . '/../../../config/database.php';

header('Content-Type: application/json');

// Start session
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Check authentication
if (!isset($_SESSION['school_id']) || $_SESSION['user_type'] !== 'school') {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();
    $schoolId = $_SESSION['school_id'];

    // Get date range
    $startDate = isset($_GET['start_date']) ? $_GET['start_date'] : date('Y-01-01');
    $endDate = isset($_GET['end_date']) ? $_GET['end_date'] : date('Y-12-31');

    // Get ALL payments with details
    $allPaymentsQuery = "SELECT
                            fp.id,
                            fp.receipt_no,
                            fp.amount,
                            fp.payment_method,
                            fp.payment_date,
                            fp.verification_status,
                            fp.verified_at,
                            fp.paystack_reference,
                            fp.bank_name,
                            fp.transaction_reference,
                            fp.notes,
                            fp.created_at,
                            s.name as student_name,
                            fc.name as fee_category
                         FROM fee_payments fp
                         INNER JOIN students s ON fp.student_id = s.id
                         INNER JOIN student_fees sf ON fp.student_fee_id = sf.id
                         INNER JOIN fee_structure fs ON sf.fee_structure_id = fs.id
                         INNER JOIN fee_categories fc ON fs.fee_category_id = fc.id
                         WHERE fp.school_id = ?
                         AND fp.payment_date BETWEEN ? AND ?
                         ORDER BY fp.payment_date DESC, fp.created_at DESC";

    $allStmt = $db->prepare($allPaymentsQuery);
    $allStmt->execute([$schoolId, $startDate, $endDate]);
    $allPayments = $allStmt->fetchAll(PDO::FETCH_ASSOC);

    // Get verified payments only
    $verifiedPaymentsQuery = "SELECT
                                 fp.id,
                                 fp.receipt_no,
                                 fp.amount,
                                 fp.payment_method,
                                 fp.payment_date,
                                 fp.verification_status,
                                 s.name as student_name,
                                 fc.name as fee_category
                              FROM fee_payments fp
                              INNER JOIN students s ON fp.student_id = s.id
                              INNER JOIN student_fees sf ON fp.student_fee_id = sf.id
                              INNER JOIN fee_structure fs ON sf.fee_structure_id = fs.id
                              INNER JOIN fee_categories fc ON fs.fee_category_id = fc.id
                              WHERE fp.school_id = ?
                              AND fp.payment_date BETWEEN ? AND ?
                              AND fp.verification_status = 'verified'
                              ORDER BY fp.payment_date DESC";

    $verifiedStmt = $db->prepare($verifiedPaymentsQuery);
    $verifiedStmt->execute([$schoolId, $startDate, $endDate]);
    $verifiedPayments = $verifiedStmt->fetchAll(PDO::FETCH_ASSOC);

    // Calculate totals
    $totalAllPayments = array_sum(array_column($allPayments, 'amount'));
    $totalVerified = array_sum(array_column($verifiedPayments, 'amount'));
    $totalPending = 0;
    $totalRejected = 0;

    foreach ($allPayments as $payment) {
        if ($payment['verification_status'] === 'pending') {
            $totalPending += $payment['amount'];
        } elseif ($payment['verification_status'] === 'rejected') {
            $totalRejected += $payment['amount'];
        }
    }

    // Group by verification status
    $byStatus = [
        'verified' => [],
        'pending' => [],
        'rejected' => []
    ];

    foreach ($allPayments as $payment) {
        $status = $payment['verification_status'];
        $byStatus[$status][] = $payment;
    }

    // Group verified payments by payment method
    $byMethod = [];
    foreach ($verifiedPayments as $payment) {
        $method = $payment['payment_method'];
        if (!isset($byMethod[$method])) {
            $byMethod[$method] = [
                'count' => 0,
                'total' => 0,
                'payments' => []
            ];
        }
        $byMethod[$method]['count']++;
        $byMethod[$method]['total'] += $payment['amount'];
        $byMethod[$method]['payments'][] = $payment;
    }

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'debug_info' => [
            'school_id' => $schoolId,
            'date_range' => [
                'start' => $startDate,
                'end' => $endDate
            ],
            'summary' => [
                'total_all_payments' => $totalAllPayments,
                'total_verified' => $totalVerified,
                'total_pending' => $totalPending,
                'total_rejected' => $totalRejected,
                'count_all' => count($allPayments),
                'count_verified' => count($verifiedPayments),
                'count_pending' => count($byStatus['pending']),
                'count_rejected' => count($byStatus['rejected'])
            ],
            'verified_by_method' => $byMethod,
            'all_payments' => $allPayments,
            'verified_payments_only' => $verifiedPayments,
            'pending_payments' => $byStatus['pending'],
            'rejected_payments' => $byStatus['rejected']
        ],
        'message' => 'If total_verified does not match financial report, there may be a date range issue or the report is using a different filter.'
    ], JSON_PRETTY_PRINT);

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
