<?php
/**
 * Get School Settlement Information
 * Returns school's Paystack subaccount and bank details
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

    // Get school settlement info
    $query = "SELECT id, school_name, email,
              paystack_subaccount_code,
              bank_name,
              bank_account_number,
              bank_account_name,
              settlement_bank_verified,
              platform_fee_flat_charge
              FROM schools
              WHERE id = ?";
    $stmt = $db->prepare($query);
    $stmt->execute([$schoolId]);
    $school = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$school) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'School not found']);
        exit;
    }

    // If subaccount exists, get details from Paystack
    $subaccountDetails = null;
    if (!empty($school['paystack_subaccount_code'])) {
        $paystackResponse = getPaystackSubaccount($school['paystack_subaccount_code']);
        if ($paystackResponse['status']) {
            $subaccountDetails = $paystackResponse['data'];
        }
    }

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'data' => [
            'has_subaccount' => !empty($school['paystack_subaccount_code']),
            'subaccount_code' => $school['paystack_subaccount_code'],
            'bank_name' => $school['bank_name'],
            'bank_account_number' => $school['bank_account_number'],
            'bank_account_name' => $school['bank_account_name'],
            'settlement_bank_verified' => (bool)$school['settlement_bank_verified'],
            'platform_fee_naira' => 200, // Fixed ₦200
            'platform_fee_kobo' => intval($school['platform_fee_flat_charge']),
            'paystack_details' => $subaccountDetails
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
