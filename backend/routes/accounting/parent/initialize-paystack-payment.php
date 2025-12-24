<?php
/**
 * Initialize Paystack Payment (Parent Mobile API)
 * Generates Paystack authorization URL for online payment
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../../config/paystack.php';

// Start session
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Check authentication
if (!isset($_SESSION['parent_id']) || $_SESSION['user_type'] !== 'parent') {
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
$required = ['student_id', 'student_fee_id', 'amount', 'email'];
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

$studentId = intval($data['student_id']);
$studentFeeId = intval($data['student_fee_id']);
$amount = floatval($data['amount']);
$email = trim($data['email']);
$callbackUrl = isset($data['callback_url']) ? $data['callback_url'] : null;

try {
    $database = new Database();
    $db = $database->getConnection();

    // Verify that this student belongs to the logged-in parent
    // Also get school's Paystack subaccount for settlement
    $verifyQuery = "SELECT ps.student_id, s.name as student_name, s.school_id,
                           p.name as parent_name,
                           sch.paystack_subaccount_code,
                           sch.name as school_name
                    FROM parent_students ps
                    INNER JOIN students s ON ps.student_id = s.id
                    INNER JOIN parents p ON ps.parent_id = p.id
                    INNER JOIN schools sch ON s.school_id = sch.id
                    WHERE ps.parent_id = ? AND ps.student_id = ?";
    $verifyStmt = $db->prepare($verifyQuery);
    $verifyStmt->execute([$_SESSION['parent_id'], $studentId]);
    $student = $verifyStmt->fetch(PDO::FETCH_ASSOC);

    if (!$student) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Access denied']);
        exit;
    }

    // Verify student fee exists
    $feeQuery = "SELECT sf.*, fc.name as category_name
                 FROM student_fees sf
                 INNER JOIN fee_structure fs ON sf.fee_structure_id = fs.id
                 INNER JOIN fee_categories fc ON fs.fee_category_id = fc.id
                 WHERE sf.id = ? AND sf.student_id = ?";
    $feeStmt = $db->prepare($feeQuery);
    $feeStmt->execute([$studentFeeId, $studentId]);
    $fee = $feeStmt->fetch(PDO::FETCH_ASSOC);

    if (!$fee) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Fee record not found']);
        exit;
    }

    // Validate amount
    if ($amount <= 0 || $amount > $fee['balance']) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Invalid payment amount'
        ]);
        exit;
    }

    // Platform fee (fixed ₦200 = 20,000 kobo)
    $platformFeeKobo = 20000; // ₦200 fixed fee

    // Convert amount to kobo (Paystack uses kobo for NGN)
    $feeAmountInKobo = $amount * 100;

    // Total amount parent will pay = fee + platform fee
    // Paystack transaction fee will be added on top (bearer: account)
    $totalAmountInKobo = $feeAmountInKobo + $platformFeeKobo;

    // Generate unique reference
    $reference = 'FEE_' . $studentId . '_' . $studentFeeId . '_' . time();

    // Prepare metadata
    $metadata = [
        'student_id' => $studentId,
        'student_fee_id' => $studentFeeId,
        'student_name' => $student['student_name'],
        'parent_name' => $student['parent_name'],
        'fee_category' => $fee['category_name'],
        'session' => $fee['session'],
        'term' => $fee['term'],
        'parent_id' => $_SESSION['parent_id'],
        'fee_amount' => $amount,
        'platform_fee' => 200,
        'custom_fields' => [
            [
                'display_name' => 'School Fee',
                'variable_name' => 'school_fee',
                'value' => number_format($amount, 2)
            ],
            [
                'display_name' => 'Platform Fee',
                'variable_name' => 'platform_fee',
                'value' => '200.00'
            ]
        ]
    ];

    // Initialize Paystack transaction
    $url = "https://api.paystack.co/transaction/initialize";

    $fields = [
        'email' => $email,
        'amount' => $totalAmountInKobo, // Total = fee + platform fee
        'reference' => $reference,
        'metadata' => $metadata,
        'currency' => 'NGN',
        'bearer' => 'account' // Parent pays Paystack transaction fees
    ];

    // Add subaccount for direct settlement to school (if configured)
    if (!empty($student['paystack_subaccount_code'])) {
        $fields['subaccount'] = $student['paystack_subaccount_code'];
        $fields['transaction_charge'] = $platformFeeKobo; // Platform receives ₦200
        // School receives the fee amount exactly
        // Parent pays: fee + ₦200 + Paystack charges
    }

    if ($callbackUrl) {
        $fields['callback_url'] = $callbackUrl;
    }

    $fields_string = json_encode($fields);

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $fields_string);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Authorization: Bearer " . PAYSTACK_SECRET_KEY,
        "Content-Type: application/json"
    ]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    $result = curl_exec($ch);
    $httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpcode !== 200) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Failed to initialize payment with Paystack',
            'error' => $result
        ]);
        exit;
    }

    $response = json_decode($result, true);

    if (!$response['status']) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Paystack initialization failed',
            'error' => $response['message']
        ]);
        exit;
    }

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Payment initialized successfully',
        'data' => [
            'authorization_url' => $response['data']['authorization_url'],
            'access_code' => $response['data']['access_code'],
            'reference' => $reference,
            'amount' => $amount,
            'fee_category' => $fee['category_name'],
            'student_name' => $student['student_name']
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
