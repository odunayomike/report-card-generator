<?php
/**
 * Get Pending Payments for Verification (School Admin)
 * Returns all bank transfer payments awaiting verification
 */

// Check authentication
if (!isset($_SESSION['school_id']) || $_SESSION['user_type'] !== 'school') {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();

    $schoolId = $_SESSION['school_id'];

    // Get filter parameters
    $status = isset($_GET['status']) ? $_GET['status'] : 'pending';
    $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 50;
    $offset = isset($_GET['offset']) ? intval($_GET['offset']) : 0;

    // Build query based on status filter
    $whereClause = "fp.school_id = ?";
    $params = [$schoolId];

    if ($status === 'pending') {
        $whereClause .= " AND fp.verification_status = 'pending'";
    } elseif ($status === 'verified') {
        $whereClause .= " AND fp.verification_status = 'verified'";
    } elseif ($status === 'rejected') {
        $whereClause .= " AND fp.verification_status = 'rejected'";
    }

    // Get total count
    $countQuery = "SELECT COUNT(*) as total
                   FROM fee_payments fp
                   WHERE $whereClause";
    $countStmt = $db->prepare($countQuery);
    $countStmt->execute($params);
    $total = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];

    // Get payments with student and fee information (exclude archived fees from filtering, but show all payments)
    $query = "SELECT fp.id, fp.receipt_no, fp.amount, fp.payment_method,
                     fp.payment_date, fp.verification_status, fp.verified_at,
                     fp.verified_by, fp.rejection_reason, fp.bank_name,
                     fp.account_number, fp.transfer_receipt_image, fp.notes,
                     fp.created_at,
                     s.id as student_id, s.name as student_name, s.class,
                     s.admission_no,
                     sf.session, sf.term,
                     fc.name as fee_category,
                     p.name as parent_name, p.email as parent_email,
                     fs.is_active as fee_is_active
              FROM fee_payments fp
              INNER JOIN students s ON fp.student_id = s.id
              INNER JOIN student_fees sf ON fp.student_fee_id = sf.id
              INNER JOIN fee_structure fs ON sf.fee_structure_id = fs.id
              INNER JOIN fee_categories fc ON fs.fee_category_id = fc.id
              LEFT JOIN parent_students ps ON s.id = ps.student_id AND ps.is_primary = TRUE
              LEFT JOIN parents p ON ps.parent_id = p.id
              WHERE $whereClause
              ORDER BY fp.created_at DESC
              LIMIT $limit OFFSET $offset";

    $stmt = $db->prepare($query);
    $stmt->execute($params);
    $payments = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Format the data
    $formattedPayments = array_map(function($payment) {
        return [
            'id' => (int)$payment['id'],
            'receipt_no' => $payment['receipt_no'],
            'amount' => (float)$payment['amount'],
            'payment_method' => $payment['payment_method'],
            'payment_date' => $payment['payment_date'],
            'verification_status' => $payment['verification_status'],
            'verified_at' => $payment['verified_at'],
            'verified_by' => $payment['verified_by'],
            'rejection_reason' => $payment['rejection_reason'],
            'bank_name' => $payment['bank_name'],
            'account_number' => $payment['account_number'],
            'has_receipt_image' => !empty($payment['transfer_receipt_image']),
            'receipt_image' => $payment['transfer_receipt_image'], // Base64 image
            'notes' => $payment['notes'],
            'submitted_at' => $payment['created_at'],
            'student' => [
                'id' => (int)$payment['student_id'],
                'name' => $payment['student_name'],
                'class' => $payment['class'],
                'admission_no' => $payment['admission_no']
            ],
            'fee' => [
                'category' => $payment['fee_category'],
                'session' => $payment['session'],
                'term' => $payment['term']
            ],
            'parent' => [
                'name' => $payment['parent_name'],
                'email' => $payment['parent_email']
            ]
        ];
    }, $payments);

    // Get statistics
    $statsQuery = "SELECT
                      COUNT(*) as total_payments,
                      SUM(CASE WHEN verification_status = 'pending' THEN 1 ELSE 0 END) as pending_count,
                      SUM(CASE WHEN verification_status = 'verified' THEN 1 ELSE 0 END) as verified_count,
                      SUM(CASE WHEN verification_status = 'rejected' THEN 1 ELSE 0 END) as rejected_count,
                      SUM(CASE WHEN verification_status = 'pending' THEN amount ELSE 0 END) as pending_amount,
                      SUM(CASE WHEN verification_status = 'verified' THEN amount ELSE 0 END) as verified_amount
                   FROM fee_payments
                   WHERE school_id = ?";
    $statsStmt = $db->prepare($statsQuery);
    $statsStmt->execute([$schoolId]);
    $stats = $statsStmt->fetch(PDO::FETCH_ASSOC);

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'data' => [
            'payments' => $formattedPayments,
            'pagination' => [
                'total' => (int)$total,
                'limit' => $limit,
                'offset' => $offset,
                'has_more' => ($offset + $limit) < $total
            ],
            'statistics' => [
                'total_payments' => (int)$stats['total_payments'],
                'pending_count' => (int)$stats['pending_count'],
                'verified_count' => (int)$stats['verified_count'],
                'rejected_count' => (int)$stats['rejected_count'],
                'pending_amount' => (float)$stats['pending_amount'],
                'verified_amount' => (float)$stats['verified_amount']
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
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred',
        'error' => $e->getMessage()
    ]);
}
?>
