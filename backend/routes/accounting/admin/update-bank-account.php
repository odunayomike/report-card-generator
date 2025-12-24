<?php
/**
 * Update Bank Account (School Admin)
 * Update existing bank account details
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

    // Start transaction
    $db->beginTransaction();

    // Build update query dynamically based on provided fields
    $updateFields = [];
    $params = [];

    if (isset($data['bank_name']) && !empty(trim($data['bank_name']))) {
        $updateFields[] = "bank_name = ?";
        $params[] = trim($data['bank_name']);
    }

    if (isset($data['account_number']) && !empty(trim($data['account_number']))) {
        $updateFields[] = "account_number = ?";
        $params[] = trim($data['account_number']);
    }

    if (isset($data['account_name']) && !empty(trim($data['account_name']))) {
        $updateFields[] = "account_name = ?";
        $params[] = trim($data['account_name']);
    }

    if (isset($data['account_type'])) {
        $validTypes = ['savings', 'current', 'domiciliary'];
        if (!in_array($data['account_type'], $validTypes)) {
            $db->rollBack();
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid account type']);
            exit;
        }
        $updateFields[] = "account_type = ?";
        $params[] = $data['account_type'];
    }

    if (isset($data['is_active'])) {
        $updateFields[] = "is_active = ?";
        $params[] = (bool)$data['is_active'];
    }

    if (isset($data['is_primary'])) {
        $isPrimary = (bool)$data['is_primary'];

        // If setting as primary, unset other primary accounts
        if ($isPrimary) {
            $updatePrimaryQuery = "UPDATE school_bank_accounts
                                  SET is_primary = FALSE
                                  WHERE school_id = ? AND id != ?";
            $updatePrimaryStmt = $db->prepare($updatePrimaryQuery);
            $updatePrimaryStmt->execute([$schoolId, $accountId]);
        }

        $updateFields[] = "is_primary = ?";
        $params[] = $isPrimary;
    }

    if (empty($updateFields)) {
        $db->rollBack();
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'No fields to update']);
        exit;
    }

    // Add updated_at timestamp
    $updateFields[] = "updated_at = NOW()";

    // Add account ID to params
    $params[] = $accountId;

    // Execute update
    $updateQuery = "UPDATE school_bank_accounts
                    SET " . implode(', ', $updateFields) . "
                    WHERE id = ?";
    $updateStmt = $db->prepare($updateQuery);
    $updateStmt->execute($params);

    // Commit transaction
    $db->commit();

    // Fetch updated account
    $selectQuery = "SELECT * FROM school_bank_accounts WHERE id = ?";
    $selectStmt = $db->prepare($selectQuery);
    $selectStmt->execute([$accountId]);
    $updatedAccount = $selectStmt->fetch(PDO::FETCH_ASSOC);

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Bank account updated successfully',
        'data' => [
            'id' => (int)$updatedAccount['id'],
            'bank_name' => $updatedAccount['bank_name'],
            'account_number' => $updatedAccount['account_number'],
            'account_name' => $updatedAccount['account_name'],
            'account_type' => $updatedAccount['account_type'],
            'is_active' => (bool)$updatedAccount['is_active'],
            'is_primary' => (bool)$updatedAccount['is_primary']
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
