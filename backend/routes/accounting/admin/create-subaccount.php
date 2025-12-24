<?php
/**
 * Create Paystack Subaccount for School
 * This allows schools to receive direct settlements from Paystack
 */

require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../../config/paystack.php';

// Check authentication - must be school admin
if (!isset($_SESSION['user_type']) || $_SESSION['user_type'] !== 'school' || !isset($_SESSION['school_id'])) {
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
$requiredFields = ['bank_code', 'account_number', 'account_name', 'bank_name'];
foreach ($requiredFields as $field) {
    if (!isset($data[$field]) || empty($data[$field])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => ucfirst(str_replace('_', ' ', $field)) . ' is required']);
        exit;
    }
}

$bankCode = trim($data['bank_code']);
$bankName = trim($data['bank_name']);
$accountNumber = trim($data['account_number']);
$accountName = trim($data['account_name']);
$platformFeeKobo = 20000; // Fixed ₦200 fee in kobo

try {
    $database = new Database();
    $db = $database->getConnection();
    $schoolId = $_SESSION['school_id'];

    // Get school details
    $schoolQuery = "SELECT id, school_name, email, paystack_subaccount_code FROM schools WHERE id = ?";
    $schoolStmt = $db->prepare($schoolQuery);
    $schoolStmt->execute([$schoolId]);
    $school = $schoolStmt->fetch(PDO::FETCH_ASSOC);

    if (!$school) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'School not found']);
        exit;
    }

    // Check if school already has a subaccount
    if (!empty($school['paystack_subaccount_code'])) {
        // Update existing subaccount
        $updateData = [
            'settlement_bank' => $bankCode,
            'account_number' => $accountNumber
        ];

        $paystackResponse = updatePaystackSubaccount($school['paystack_subaccount_code'], $updateData);

        if (!$paystackResponse['status']) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Failed to update Paystack subaccount',
                'error' => $paystackResponse['message'] ?? 'Unknown error'
            ]);
            exit;
        }

        // Update school record in database
        $updateSchoolQuery = "UPDATE schools
                             SET bank_name = ?,
                                 bank_account_number = ?,
                                 bank_account_name = ?,
                                 settlement_bank_verified = 1,
                                 platform_fee_flat_charge = ?
                             WHERE id = ?";
        $updateSchoolStmt = $db->prepare($updateSchoolQuery);
        $updateSchoolStmt->execute([$bankName, $accountNumber, $accountName, $platformFeeKobo, $schoolId]);

        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Settlement account updated successfully',
            'data' => [
                'subaccount_code' => $school['paystack_subaccount_code'],
                'account_number' => $accountNumber,
                'account_name' => $accountName,
                'platform_fee_naira' => 200
            ]
        ]);
        exit;
    }

    // Create new subaccount
    $description = 'Settlement account for ' . $school['school_name'];
    $paystackResponse = createPaystackSubaccount(
        $school['school_name'],
        $bankCode,
        $accountNumber,
        $description,
        $school['email'], // primary_contact_email
        $accountName, // primary_contact_name (from verified bank account)
        null // primary_contact_phone (optional)
    );

    if (!$paystackResponse['status']) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Failed to create Paystack subaccount',
            'error' => $paystackResponse['message'] ?? 'Unknown error'
        ]);
        exit;
    }

    $subaccountCode = $paystackResponse['data']['subaccount_code'];

    // Update school record
    $updateSchoolQuery = "UPDATE schools
                         SET paystack_subaccount_code = ?,
                             bank_name = ?,
                             bank_account_number = ?,
                             bank_account_name = ?,
                             settlement_bank_verified = 1,
                             platform_fee_flat_charge = ?
                         WHERE id = ?";
    $updateSchoolStmt = $db->prepare($updateSchoolQuery);
    $updateSchoolStmt->execute([
        $subaccountCode,
        $bankName,
        $accountNumber,
        $accountName,
        $platformFeeKobo,
        $schoolId
    ]);

    http_response_code(201);
    echo json_encode([
        'success' => true,
        'message' => 'Settlement account created successfully',
        'data' => [
            'subaccount_code' => $subaccountCode,
            'account_number' => $accountNumber,
            'account_name' => $accountName,
            'platform_fee_naira' => 200
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
