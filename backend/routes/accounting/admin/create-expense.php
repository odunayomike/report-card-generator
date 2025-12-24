<?php
/**
 * Create Expense (School Admin)
 * Record a new school expense
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
$required = ['category', 'description', 'amount', 'expense_date'];
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

$category = trim($data['category']);
$description = trim($data['description']);
$amount = floatval($data['amount']);
$expenseDate = $data['expense_date'];
$paymentMethod = isset($data['payment_method']) ? trim($data['payment_method']) : 'cash';
$referenceNo = isset($data['reference_no']) ? trim($data['reference_no']) : null;
$receiptImage = isset($data['receipt_image']) ? $data['receipt_image'] : null;
$notes = isset($data['notes']) ? trim($data['notes']) : null;

// Validate category
$validCategories = ['salaries', 'utilities', 'supplies', 'maintenance', 'transport', 'food', 'marketing', 'equipment', 'rent', 'other'];
if (!in_array($category, $validCategories)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Invalid expense category'
    ]);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();

    $schoolId = $_SESSION['school_id'];
    $createdBy = $_SESSION['email'];

    // Insert expense
    $insertQuery = "INSERT INTO school_expenses
                    (school_id, category, description, amount, expense_date,
                     payment_method, reference_no, receipt_image, notes, created_by)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

    $insertStmt = $db->prepare($insertQuery);
    $insertStmt->execute([
        $schoolId,
        $category,
        $description,
        $amount,
        $expenseDate,
        $paymentMethod,
        $referenceNo,
        $receiptImage,
        $notes,
        $createdBy
    ]);

    $expenseId = $db->lastInsertId();

    http_response_code(201);
    echo json_encode([
        'success' => true,
        'message' => 'Expense recorded successfully',
        'data' => [
            'id' => (int)$expenseId,
            'category' => $category,
            'description' => $description,
            'amount' => $amount,
            'expense_date' => $expenseDate
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
