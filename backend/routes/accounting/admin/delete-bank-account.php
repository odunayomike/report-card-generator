<?php
/**
 * Delete Bank Account (School Admin)
 * Delete a bank account
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
if (!isset($data['id']) || empty($data['id'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Account ID is required']);
    exit;
}

$accountId = intval($data['id']);

try {
    $database = new Database();
    $db = $database->getConnection();

    $schoolId = $_SESSION['school_id'];

    // Verify account belongs to this school
    $checkQuery = "SELECT * FROM school_bank_accounts WHERE id = ? AND school_id = ?";
    $checkStmt = $db->prepare($checkQuery);
    $checkStmt->execute([$accountId, $schoolId]);
    $account = $checkStmt->fetch(PDO::FETCH_ASSOC);

    if (!$account) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Bank account not found']);
        exit;
    }

    // Check if this account has been used for any payments
    $paymentCheckQuery = "SELECT COUNT(*) as count FROM fee_payments
                          WHERE school_id = ? AND account_number = ?";
    $paymentCheckStmt = $db->prepare($paymentCheckQuery);
    $paymentCheckStmt->execute([$schoolId, $account['account_number']]);
    $paymentCount = $paymentCheckStmt->fetch(PDO::FETCH_ASSOC)['count'];

    if ($paymentCount > 0) {
        // Don't delete, just deactivate
        $updateQuery = "UPDATE school_bank_accounts
                       SET is_active = FALSE, updated_at = NOW()
                       WHERE id = ?";
        $updateStmt = $db->prepare($updateQuery);
        $updateStmt->execute([$accountId]);

        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Bank account has been deactivated (cannot delete accounts with payment history)',
            'deactivated' => true
        ]);
    } else {
        // Safe to delete
        $deleteQuery = "DELETE FROM school_bank_accounts WHERE id = ?";
        $deleteStmt = $db->prepare($deleteQuery);
        $deleteStmt->execute([$accountId]);

        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Bank account deleted successfully',
            'deleted' => true
        ]);
    }

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
