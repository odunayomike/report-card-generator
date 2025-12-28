<?php
/**
 * Get Financial Report (School Admin)
 * Returns comprehensive financial summary
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

    // Get date range
    $startDate = isset($_GET['start_date']) ? $_GET['start_date'] : date('Y-01-01');
    $endDate = isset($_GET['end_date']) ? $_GET['end_date'] : date('Y-12-31');

    // 1. Fee Collection Summary
    $feeQuery = "SELECT
                    COUNT(DISTINCT fp.id) as total_payments,
                    SUM(fp.amount) as total_collected,
                    SUM(CASE WHEN fp.verification_status = 'verified' THEN fp.amount ELSE 0 END) as verified_amount,
                    SUM(CASE WHEN fp.verification_status = 'pending' THEN fp.amount ELSE 0 END) as pending_amount
                 FROM fee_payments fp
                 WHERE fp.school_id = ?
                 AND fp.payment_date BETWEEN ? AND ?";

    $feeStmt = $db->prepare($feeQuery);
    $feeStmt->execute([$schoolId, $startDate, $endDate]);
    $feeData = $feeStmt->fetch(PDO::FETCH_ASSOC);

    // 2. Outstanding Fees (exclude archived fee structures)
    $outstandingQuery = "SELECT
                            COUNT(DISTINCT sf.student_id) as students_with_balance,
                            SUM(sf.amount_due - sf.amount_paid) as total_outstanding
                         FROM student_fees sf
                         INNER JOIN students s ON sf.student_id = s.id
                         INNER JOIN fee_structure fs ON sf.fee_structure_id = fs.id
                         WHERE s.school_id = ?
                         AND sf.status != 'paid'
                         AND sf.session = ?
                         AND fs.is_active = TRUE";

    $currentSession = isset($_GET['session']) ? $_GET['session'] : date('Y') . '/' . (date('Y') + 1);
    $outstandingStmt = $db->prepare($outstandingQuery);
    $outstandingStmt->execute([$schoolId, $currentSession]);
    $outstandingData = $outstandingStmt->fetch(PDO::FETCH_ASSOC);

    // 3. Expense Summary
    $expenseQuery = "SELECT
                        COUNT(*) as total_expenses,
                        SUM(amount) as total_spent,
                        category,
                        SUM(amount) as category_total
                     FROM school_expenses
                     WHERE school_id = ?
                     AND expense_date BETWEEN ? AND ?
                     GROUP BY category";

    $expenseStmt = $db->prepare($expenseQuery);
    $expenseStmt->execute([$schoolId, $startDate, $endDate]);
    $expensesByCategory = $expenseStmt->fetchAll(PDO::FETCH_ASSOC);

    $totalExpenses = array_sum(array_column($expensesByCategory, 'category_total'));

    // 4. Monthly Breakdown
    $monthlyQuery = "SELECT
                        DATE_FORMAT(payment_date, '%Y-%m') as month,
                        SUM(amount) as income
                     FROM fee_payments
                     WHERE school_id = ?
                     AND payment_date BETWEEN ? AND ?
                     AND verification_status = 'verified'
                     GROUP BY month
                     ORDER BY month";

    $monthlyStmt = $db->prepare($monthlyQuery);
    $monthlyStmt->execute([$schoolId, $startDate, $endDate]);
    $monthlyIncome = $monthlyStmt->fetchAll(PDO::FETCH_ASSOC);

    $monthlyExpenseQuery = "SELECT
                                DATE_FORMAT(expense_date, '%Y-%m') as month,
                                SUM(amount) as expenses
                             FROM school_expenses
                             WHERE school_id = ?
                             AND expense_date BETWEEN ? AND ?
                             GROUP BY month
                             ORDER BY month";

    $monthlyExpenseStmt = $db->prepare($monthlyExpenseQuery);
    $monthlyExpenseStmt->execute([$schoolId, $startDate, $endDate]);
    $monthlyExpenses = $monthlyExpenseStmt->fetchAll(PDO::FETCH_ASSOC);

    // Combine monthly data
    $monthlyData = [];
    foreach ($monthlyIncome as $inc) {
        $monthlyData[$inc['month']] = [
            'month' => $inc['month'],
            'income' => (float)$inc['income'],
            'expenses' => 0
        ];
    }
    foreach ($monthlyExpenses as $exp) {
        if (!isset($monthlyData[$exp['month']])) {
            $monthlyData[$exp['month']] = [
                'month' => $exp['month'],
                'income' => 0,
                'expenses' => (float)$exp['expenses']
            ];
        } else {
            $monthlyData[$exp['month']]['expenses'] = (float)$exp['expenses'];
        }
    }

    // Calculate net income
    foreach ($monthlyData as &$data) {
        $data['net'] = $data['income'] - $data['expenses'];
    }
    ksort($monthlyData);

    // 5. Payment Methods Breakdown
    $paymentMethodQuery = "SELECT
                              payment_method,
                              COUNT(*) as count,
                              SUM(amount) as total
                           FROM fee_payments
                           WHERE school_id = ?
                           AND payment_date BETWEEN ? AND ?
                           AND verification_status = 'verified'
                           GROUP BY payment_method";

    $paymentMethodStmt = $db->prepare($paymentMethodQuery);
    $paymentMethodStmt->execute([$schoolId, $startDate, $endDate]);
    $paymentMethods = $paymentMethodStmt->fetchAll(PDO::FETCH_ASSOC);

    // Calculate totals
    $totalIncome = (float)$feeData['verified_amount'];
    $netIncome = $totalIncome - $totalExpenses;

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'data' => [
            'period' => [
                'start_date' => $startDate,
                'end_date' => $endDate
            ],
            'summary' => [
                'total_income' => $totalIncome,
                'total_expenses' => $totalExpenses,
                'net_income' => $netIncome,
                'total_outstanding' => (float)$outstandingData['total_outstanding'],
                'students_with_balance' => (int)$outstandingData['students_with_balance']
            ],
            'income' => [
                'total_payments' => (int)$feeData['total_payments'],
                'verified_amount' => (float)$feeData['verified_amount'],
                'pending_amount' => (float)$feeData['pending_amount']
            ],
            'expenses' => [
                'total_count' => count($expensesByCategory),
                'total_amount' => $totalExpenses,
                'by_category' => array_map(function($cat) {
                    return [
                        'category' => $cat['category'],
                        'total' => (float)$cat['category_total']
                    ];
                }, $expensesByCategory)
            ],
            'monthly_breakdown' => array_values($monthlyData),
            'payment_methods' => array_map(function($pm) {
                return [
                    'method' => $pm['payment_method'],
                    'count' => (int)$pm['count'],
                    'total' => (float)$pm['total']
                ];
            }, $paymentMethods)
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
