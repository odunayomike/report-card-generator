<?php
/**
 * Get School Bank Accounts (Parent Mobile API)
 * Returns active bank accounts where parents can make transfers
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../../../config/database.php';

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

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Get student ID to determine school
$studentId = isset($_GET['student_id']) ? intval($_GET['student_id']) : 0;

if (!$studentId) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Student ID is required']);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();

    // Verify student belongs to parent and get school ID
    $verifyQuery = "SELECT s.school_id, sc.school_name
                    FROM parent_students ps
                    INNER JOIN students s ON ps.student_id = s.id
                    INNER JOIN schools sc ON s.school_id = sc.id
                    WHERE ps.parent_id = ? AND ps.student_id = ?";
    $verifyStmt = $db->prepare($verifyQuery);
    $verifyStmt->execute([$_SESSION['parent_id'], $studentId]);
    $result = $verifyStmt->fetch(PDO::FETCH_ASSOC);

    if (!$result) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Access denied']);
        exit;
    }

    $schoolId = $result['school_id'];
    $schoolName = $result['school_name'];

    // Get active bank accounts
    $accountsQuery = "SELECT
                        id,
                        bank_name,
                        account_number,
                        account_name,
                        account_type,
                        is_primary
                      FROM school_bank_accounts
                      WHERE school_id = ? AND is_active = TRUE
                      ORDER BY is_primary DESC, bank_name ASC";

    $accountsStmt = $db->prepare($accountsQuery);
    $accountsStmt->execute([$schoolId]);
    $accounts = $accountsStmt->fetchAll(PDO::FETCH_ASSOC);

    if (empty($accounts)) {
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'No bank accounts available. Please contact school.',
            'data' => [
                'school_name' => $schoolName,
                'accounts' => []
            ]
        ]);
        exit;
    }

    // Format accounts
    $formattedAccounts = array_map(function($acc) {
        return [
            'id' => (int)$acc['id'],
            'bank_name' => $acc['bank_name'],
            'account_number' => $acc['account_number'],
            'account_name' => $acc['account_name'],
            'account_type' => $acc['account_type'],
            'is_primary' => (bool)$acc['is_primary']
        ];
    }, $accounts);

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'data' => [
            'school_name' => $schoolName,
            'accounts' => $formattedAccounts,
            'instruction' => 'Please make your transfer to any of the accounts below and upload your payment receipt.'
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error occurred',
        'error' => $e->getMessage()
    ]);
}
?>
