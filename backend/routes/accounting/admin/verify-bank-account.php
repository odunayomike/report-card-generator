<?php
/**
 * Verify Bank Account with Paystack
 * Resolves account number to get account name
 */

require_once __DIR__ . '/../../../config/paystack.php';

// Check authentication
if (!isset($_SESSION['user_type']) || !isset($_SESSION['school_id'])) {
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
$data = json_decode(file_get_contents('php://input'), true);

// Validate required fields
if (!isset($data['account_number']) || !isset($data['bank_code'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Account number and bank code are required']);
    exit;
}

$accountNumber = trim($data['account_number']);
$bankCode = trim($data['bank_code']);

try {
    // In test mode, use test bank code 001 and return mock account name
    $isTestMode = strpos(PAYSTACK_SECRET_KEY, 'sk_test_') === 0;

    if ($isTestMode) {
        // For test mode, return a mock successful response without calling Paystack
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'data' => [
                'account_number' => $accountNumber,
                'account_name' => 'Test Account Name',
                'bank_code' => '001'
            ]
        ]);
        exit;
    }

    // Resolve account with Paystack (only in live mode)
    $paystackResponse = resolvePaystackBankAccount($accountNumber, $bankCode);

    if (!$paystackResponse['status']) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Failed to verify bank account',
            'error' => $paystackResponse['message'] ?? 'Invalid account number or bank code'
        ]);
        exit;
    }

    // Return account details
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'data' => [
            'account_number' => $paystackResponse['data']['account_number'],
            'account_name' => $paystackResponse['data']['account_name'],
            'bank_code' => $bankCode
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred',
        'error' => $e->getMessage()
    ]);
}
