<?php
/**
 * Create Fee Structure (School Admin)
 * Add a new fee structure
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
$required = ['fee_category_id', 'session', 'amount'];
foreach ($required as $field) {
    if (!isset($data[$field]) || ($field !== 'amount' && empty($data[$field]))) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => ucfirst(str_replace('_', ' ', $field)) . ' is required'
        ]);
        exit;
    }
}

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

    // Verify fee category belongs to this school
    $checkQuery = "SELECT id FROM fee_categories WHERE id = ? AND school_id = ?";
    $checkStmt = $db->prepare($checkQuery);
    $checkStmt->execute([$feeCategoryId, $schoolId]);

    if (!$checkStmt->fetch()) {
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

    // Insert fee structure
    $insertQuery = "INSERT INTO fee_structure
                    (school_id, fee_category_id, class, student_id, session, term, amount,
                     frequency, is_mandatory)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

    $insertStmt = $db->prepare($insertQuery);
    $insertStmt->execute([
        $schoolId,
        $feeCategoryId,
        $class,
        $studentId,
        $session,
        $term,
        $amount,
        $frequency,
        $isMandatory
    ]);

    $feeId = $db->lastInsertId();

    http_response_code(201);
    echo json_encode([
        'success' => true,
        'message' => 'Fee structure created successfully',
        'data' => [
            'id' => (int)$feeId,
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
?>
