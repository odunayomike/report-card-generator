<?php
/**
 * Get School Expenses (School Admin)
 * Returns all expenses for the school
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
    $startDate = isset($_GET['start_date']) ? $_GET['start_date'] : null;
    $endDate = isset($_GET['end_date']) ? $_GET['end_date'] : null;
    $category = isset($_GET['category']) ? $_GET['category'] : null;

    // Build query
    $whereClause = "school_id = ?";
    $params = [$schoolId];

    if ($startDate) {
        $whereClause .= " AND expense_date >= ?";
        $params[] = $startDate;
    }

    if ($endDate) {
        $whereClause .= " AND expense_date <= ?";
        $params[] = $endDate;
    }

    if ($category) {
        $whereClause .= " AND category = ?";
        $params[] = $category;
    }

    // Get expenses
    $query = "SELECT id, category, description, amount, expense_date,
                     payment_method, reference_no, receipt_image, notes,
                     created_by, created_at
              FROM school_expenses
              WHERE $whereClause
              ORDER BY expense_date DESC, created_at DESC";

    $stmt = $db->prepare($query);
    $stmt->execute($params);
    $expenses = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Calculate summary
    $totalExpenses = array_sum(array_column($expenses, 'amount'));

    // Group by category
    $byCategory = [];
    foreach ($expenses as $expense) {
        $cat = $expense['category'];
        if (!isset($byCategory[$cat])) {
            $byCategory[$cat] = 0;
        }
        $byCategory[$cat] += $expense['amount'];
    }

    // Format expenses
    $formattedExpenses = array_map(function($expense) {
        return [
            'id' => (int)$expense['id'],
            'category' => $expense['category'],
            'description' => $expense['description'],
            'amount' => (float)$expense['amount'],
            'expense_date' => $expense['expense_date'],
            'payment_method' => $expense['payment_method'],
            'reference_no' => $expense['reference_no'],
            'has_receipt' => !empty($expense['receipt_image']),
            'receipt_image' => $expense['receipt_image'],
            'notes' => $expense['notes'],
            'created_by' => $expense['created_by'],
            'created_at' => $expense['created_at']
        ];
    }, $expenses);

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'data' => [
            'expenses' => $formattedExpenses,
            'summary' => [
                'total_expenses' => $totalExpenses,
                'total_count' => count($expenses),
                'by_category' => $byCategory
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
