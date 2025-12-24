<?php
/**
 * Delete Paystack Subaccount for School
 * Removes subaccount configuration from school record
 */

require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../../config/paystack.php';

// Check authentication - must be school admin
if (!isset($_SESSION['user_type']) || $_SESSION['user_type'] !== 'school' || !isset($_SESSION['school_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();
    $schoolId = $_SESSION['school_id'];

    // Get school details to verify subaccount exists
    $schoolQuery = "SELECT id, school_name, paystack_subaccount_code FROM schools WHERE id = ?";
    $schoolStmt = $db->prepare($schoolQuery);
    $schoolStmt->execute([$schoolId]);
    $school = $schoolStmt->fetch(PDO::FETCH_ASSOC);

    if (!$school) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'School not found']);
        exit;
    }

    if (empty($school['paystack_subaccount_code'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'No settlement account found']);
        exit;
    }

    // Deactivate subaccount in Paystack first
    $paystackResponse = deletePaystackSubaccount($school['paystack_subaccount_code']);

    // Log if Paystack deactivation fails, but continue with local deletion
    $paystackDeactivated = $paystackResponse['status'] ?? false;
    $paystackMessage = $paystackDeactivated ? 'Deactivated in Paystack' : 'Failed to deactivate in Paystack';

    // Remove subaccount configuration from school record
    $updateSchoolQuery = "UPDATE schools
                         SET paystack_subaccount_code = NULL,
                             bank_name = NULL,
                             bank_account_number = NULL,
                             bank_account_name = NULL,
                             settlement_bank_verified = 0,
                             platform_fee_flat_charge = 20000
                         WHERE id = ?";
    $updateSchoolStmt = $db->prepare($updateSchoolQuery);
    $updateSchoolStmt->execute([$schoolId]);

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Settlement account removed successfully',
        'paystack_status' => $paystackMessage,
        'paystack_deactivated' => $paystackDeactivated
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
