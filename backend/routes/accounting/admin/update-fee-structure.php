<?php
/**
 * Update Fee Structure (School Admin)
 * Update an existing fee structure with validation
 */

// Check authentication
if (!isset($_SESSION['school_id']) || $_SESSION['user_type'] !== 'school') {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Get JSON input
$json = file_get_contents('php://input');
$data = json_decode($json, true);

// Validate input
$required = ['id', 'fee_category_id', 'session', 'amount'];
foreach ($required as $field) {
    if (!isset($data[$field]) || ($field !== 'amount' && $field !== 'id' && empty($data[$field]))) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => ucfirst(str_replace('_', ' ', $field)) . ' is required'
        ]);
        exit;
    }
}

$id = intval($data['id']);
$feeCategoryId = intval($data['fee_category_id']);
$class = isset($data['class']) && !empty($data['class']) ? trim($data['class']) : null;
$studentId = isset($data['student_id']) && !empty($data['student_id']) ? intval($data['student_id']) : null;
$session = trim($data['session']);
$term = isset($data['term']) && !empty($data['term']) ? trim($data['term']) : null;
$amount = floatval($data['amount']);
$frequency = isset($data['frequency']) ? $data['frequency'] : 'per-term';
$isMandatory = isset($data['is_mandatory']) ? (bool)$data['is_mandatory'] : true;

// Validate frequency
$validFrequencies = ['one-time', 'per-term', 'per-session', 'monthly'];
if (!in_array($frequency, $validFrequencies)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Invalid frequency'
    ]);
    exit;
}

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

    // Verify fee category belongs to this school
    $categoryCheckQuery = "SELECT id FROM fee_categories WHERE id = ? AND school_id = ?";
    $categoryCheckStmt = $db->prepare($categoryCheckQuery);
    $categoryCheckStmt->execute([$feeCategoryId, $schoolId]);

    if (!$categoryCheckStmt->fetch()) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Fee category not found']);
        exit;
    }

    // If student_id is provided, verify student belongs to this school
    if ($studentId !== null) {
        $studentCheckQuery = "SELECT id FROM students WHERE id = ? AND school_id = ?";
        $studentCheckStmt = $db->prepare($studentCheckQuery);
        $studentCheckStmt->execute([$studentId, $schoolId]);

        if (!$studentCheckStmt->fetch()) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Student not found']);
            exit;
        }
    }

    // Check if there are existing student_fees records tied to this fee_structure
    $studentFeesQuery = "SELECT COUNT(*) as count FROM student_fees WHERE fee_structure_id = ?";
    $studentFeesStmt = $db->prepare($studentFeesQuery);
    $studentFeesStmt->execute([$id]);
    $studentFeesCount = $studentFeesStmt->fetch(PDO::FETCH_ASSOC)['count'];

    $hasLinkedRecords = $studentFeesCount > 0;

    // Update fee structure
    $updateQuery = "UPDATE fee_structure
                    SET fee_category_id = ?,
                        class = ?,
                        student_id = ?,
                        session = ?,
                        term = ?,
                        amount = ?,
                        frequency = ?,
                        is_mandatory = ?,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = ? AND school_id = ?";

    $updateStmt = $db->prepare($updateQuery);
    $updateStmt->execute([
        $feeCategoryId,
        $class,
        $studentId,
        $session,
        $term,
        $amount,
        $frequency,
        $isMandatory,
        $id,
        $schoolId
    ]);

    // If amount changed and there are linked student_fees, update them
    if ($hasLinkedRecords && isset($data['update_linked_fees']) && $data['update_linked_fees'] === true) {
        $updateLinkedQuery = "UPDATE student_fees
                             SET amount_due = ?
                             WHERE fee_structure_id = ?
                             AND amount_paid = 0";
        $updateLinkedStmt = $db->prepare($updateLinkedQuery);
        $updateLinkedStmt->execute([$amount, $id]);

        $updatedLinkedCount = $updateLinkedStmt->rowCount();
    } else {
        $updatedLinkedCount = 0;
    }

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Fee structure updated successfully',
        'data' => [
            'id' => $id,
            'has_linked_records' => $hasLinkedRecords,
            'linked_records_count' => (int)$studentFeesCount,
            'updated_linked_fees' => $updatedLinkedCount,
            'fee_category_id' => $feeCategoryId,
            'class' => $class,
            'student_id' => $studentId,
            'session' => $session,
            'term' => $term,
            'amount' => $amount,
            'frequency' => $frequency,
            'is_mandatory' => $isMandatory
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
