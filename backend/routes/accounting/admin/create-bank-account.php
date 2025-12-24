<?php
/**
 * Create Bank Account (School Admin)
 * Add a new bank account for the school
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
$required = ['bank_name', 'account_number', 'account_name'];
foreach ($required as $field) {
    if (!isset($data[$field]) || empty(trim($data[$field]))) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => ucfirst(str_replace('_', ' ', $field)) . ' is required'
        ]);
        exit;
    }
}

$bankName = trim($data['bank_name']);
$accountNumber = trim($data['account_number']);
$accountName = trim($data['account_name']);
$accountType = isset($data['account_type']) ? trim($data['account_type']) : 'current';
$isPrimary = isset($data['is_primary']) ? (bool)$data['is_primary'] : false;

// Validate account type
$validTypes = ['savings', 'current', 'domiciliary'];
if (!in_array($accountType, $validTypes)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Invalid account type. Must be savings, current, or domiciliary'
    ]);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();

    $schoolId = $_SESSION['school_id'];

    // Start transaction
    $db->beginTransaction();

    // Check if account number already exists for this school
    $checkQuery = "SELECT id FROM school_bank_accounts
                   WHERE school_id = ? AND account_number = ?";
    $checkStmt = $db->prepare($checkQuery);
    $checkStmt->execute([$schoolId, $accountNumber]);

    if ($checkStmt->fetch()) {
        $db->rollBack();
        http_response_code(409);
        echo json_encode([
            'success' => false,
            'message' => 'This account number already exists'
        ]);
        exit;
    }

    // If this is being set as primary, unset other primary accounts
    if ($isPrimary) {
        $updateQuery = "UPDATE school_bank_accounts
                       SET is_primary = FALSE
                       WHERE school_id = ?";
        $updateStmt = $db->prepare($updateQuery);
        $updateStmt->execute([$schoolId]);
    }

    // Insert new bank account
    $insertQuery = "INSERT INTO school_bank_accounts
                    (school_id, bank_name, account_number, account_name,
                     account_type, is_primary, is_active)
                    VALUES (?, ?, ?, ?, ?, ?, TRUE)";

    $insertStmt = $db->prepare($insertQuery);
    $insertStmt->execute([
        $schoolId,
        $bankName,
        $accountNumber,
        $accountName,
        $accountType,
        $isPrimary
    ]);

    $accountId = $db->lastInsertId();

    // Commit transaction
    $db->commit();

    http_response_code(201);
    echo json_encode([
        'success' => true,
        'message' => 'Bank account created successfully',
        'data' => [
            'id' => (int)$accountId,
            'bank_name' => $bankName,
            'account_number' => $accountNumber,
            'account_name' => $accountName,
            'account_type' => $accountType,
            'is_primary' => $isPrimary,
            'is_active' => true
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
