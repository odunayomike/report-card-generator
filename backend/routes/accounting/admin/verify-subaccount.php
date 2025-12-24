<?php
/**
 * Verify Subaccount with Paystack
 * Checks if the subaccount exists in Paystack and returns its details
 */

require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../../config/paystack.php';

// Check authentication - must be school admin
if (!isset($_SESSION['user_type']) || $_SESSION['user_type'] !== 'school' || !isset($_SESSION['school_id'])) {
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

    // Get school details
    $schoolQuery = "SELECT id, school_name, paystack_subaccount_code,
                           bank_name, bank_account_number, bank_account_name
                    FROM schools WHERE id = ?";
    $schoolStmt = $db->prepare($schoolQuery);
    $schoolStmt->execute([$schoolId]);
    $school = $schoolStmt->fetch(PDO::FETCH_ASSOC);

    if (!$school) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'School not found']);
        exit;
    }

    if (empty($school['paystack_subaccount_code'])) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'No subaccount configured for this school'
        ]);
        exit;
    }

    // Verify with Paystack API
    $paystackResponse = getPaystackSubaccount($school['paystack_subaccount_code']);

    if (!$paystackResponse['status']) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Failed to verify subaccount with Paystack',
            'error' => $paystackResponse['message'] ?? 'Unknown error',
            'subaccount_code' => $school['paystack_subaccount_code']
        ]);
        exit;
    }

    $subaccountData = $paystackResponse['data'];

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Subaccount verified successfully',
        'data' => [
            'subaccount_code' => $subaccountData['subaccount_code'],
            'business_name' => $subaccountData['business_name'],
            'settlement_bank' => $subaccountData['settlement_bank'],
            'account_number' => $subaccountData['account_number'],
            'percentage_charge' => $subaccountData['percentage_charge'],
            'is_verified' => $subaccountData['is_verified'] ?? false,
            'active' => $subaccountData['active'] ?? false,
            'created_at' => $subaccountData['createdAt'] ?? null,
            'database_info' => [
                'bank_name' => $school['bank_name'],
                'bank_account_number' => $school['bank_account_number'],
                'bank_account_name' => $school['bank_account_name']
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
