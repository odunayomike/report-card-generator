<?php
/**
 * Get School Bank Accounts (School Admin)
 * Returns all bank accounts for the school
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

    // Get all bank accounts for the school
    $query = "SELECT id, bank_name, account_number, account_name, account_type,
                     is_active, is_primary, created_at, updated_at
              FROM school_bank_accounts
              WHERE school_id = ?
              ORDER BY is_primary DESC, bank_name ASC";

    $stmt = $db->prepare($query);
    $stmt->execute([$schoolId]);
    $accounts = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Format the data
    $formattedAccounts = array_map(function($account) {
        return [
            'id' => (int)$account['id'],
            'bank_name' => $account['bank_name'],
            'account_number' => $account['account_number'],
            'account_name' => $account['account_name'],
            'account_type' => $account['account_type'],
            'is_active' => (bool)$account['is_active'],
            'is_primary' => (bool)$account['is_primary'],
            'created_at' => $account['created_at'],
            'updated_at' => $account['updated_at']
        ];
    }, $accounts);

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'data' => $formattedAccounts
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
