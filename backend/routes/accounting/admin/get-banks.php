<?php
/**
 * Get List of Nigerian Banks from Paystack
 * Returns all banks supported by Paystack for settlement
 */

require_once __DIR__ . '/../../../config/paystack.php';

// Check authentication
if (!isset($_SESSION['user_type']) || !isset($_SESSION['school_id'])) {
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
    // Get banks from Paystack
    $paystackResponse = getPaystackBanks();

    if (!$paystackResponse['status']) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Failed to fetch banks from Paystack',
            'error' => $paystackResponse['message'] ?? 'Unknown error'
        ]);
        exit;
    }

    // Return banks list
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'data' => $paystackResponse['data']
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred',
        'error' => $e->getMessage()
    ]);
}
