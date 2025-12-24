<?php
/**
 * Delete Fee Structure (School Admin)
 * Delete a fee structure with proper validation
 */

// Check authentication
if (!isset($_SESSION['school_id']) || $_SESSION['user_type'] !== 'school') {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Get JSON input
$json = file_get_contents('php://input');
$data = json_decode($json, true);

if (!isset($data['id']) || empty($data['id'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Fee structure ID is required']);
    exit;
}

$id = intval($data['id']);

try {
    $database = new Database();
    $db = $database->getConnection();

    $schoolId = $_SESSION['school_id'];

    // Verify fee structure belongs to this school
    $checkQuery = "SELECT id FROM fee_structure WHERE id = ? AND school_id = ?";
    $checkStmt = $db->prepare($checkQuery);
    $checkStmt->execute([$id, $schoolId]);

    if (!$checkStmt->fetch()) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Fee structure not found']);
        exit;
    }

    // Check if there are existing student_fees or payments tied to this fee_structure
    $studentFeesQuery = "SELECT COUNT(*) as count FROM student_fees WHERE fee_structure_id = ?";
    $studentFeesStmt = $db->prepare($studentFeesQuery);
    $studentFeesStmt->execute([$id]);
    $studentFeesCount = $studentFeesStmt->fetch(PDO::FETCH_ASSOC)['count'];

    // Check for payments
    $paymentsQuery = "SELECT COUNT(*) as count
                     FROM fee_payments fp
                     INNER JOIN student_fees sf ON fp.student_fee_id = sf.id
                     WHERE sf.fee_structure_id = ?";
    $paymentsStmt = $db->prepare($paymentsQuery);
    $paymentsStmt->execute([$id]);
    $paymentsCount = $paymentsStmt->fetch(PDO::FETCH_ASSOC)['count'];

    // Don't allow deletion if there are payments
    if ($paymentsCount > 0) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Cannot delete fee structure with existing payments',
            'payments_count' => (int)$paymentsCount
        ]);
        exit;
    }

    // Delete student_fees records first (if any)
    if ($studentFeesCount > 0) {
        $deleteStudentFeesQuery = "DELETE FROM student_fees WHERE fee_structure_id = ?";
        $deleteStudentFeesStmt = $db->prepare($deleteStudentFeesQuery);
        $deleteStudentFeesStmt->execute([$id]);
    }

    // Delete fee structure
    $deleteQuery = "DELETE FROM fee_structure WHERE id = ? AND school_id = ?";
    $deleteStmt = $db->prepare($deleteQuery);
    $deleteStmt->execute([$id, $schoolId]);

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Fee structure deleted successfully',
        'deleted_student_fees' => (int)$studentFeesCount
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
