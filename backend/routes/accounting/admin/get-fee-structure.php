<?php
/**
 * Get Fee Structure (School Admin)
 * Returns all fee structures for the school
 */

// Check authentication
if (!isset($_SESSION['school_id']) || $_SESSION['user_type'] !== 'school') {
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

    // Get fee structures with category information and student info
    $query = "SELECT fs.id, fs.fee_category_id, fs.class, fs.student_id, fs.session, fs.term,
                     fs.amount, fs.frequency, fs.is_mandatory, fs.created_at,
                     fc.name as category_name, fc.description as category_description,
                     s.name as student_name, s.admission_no
              FROM fee_structure fs
              INNER JOIN fee_categories fc ON fs.fee_category_id = fc.id
              LEFT JOIN students s ON fs.student_id = s.id
              WHERE fs.school_id = ?
              ORDER BY fs.session DESC, fs.term DESC, fc.name ASC";

    $stmt = $db->prepare($query);
    $stmt->execute([$schoolId]);
    $feeStructures = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Format the data
    $formattedFees = array_map(function($fee) {
        return [
            'id' => (int)$fee['id'],
            'fee_category_id' => (int)$fee['fee_category_id'],
            'category_name' => $fee['category_name'],
            'category_description' => $fee['category_description'],
            'class' => $fee['class'],
            'student_id' => $fee['student_id'] ? (int)$fee['student_id'] : null,
            'student_name' => $fee['student_name'],
            'admission_number' => $fee['admission_no'],
            'session' => $fee['session'],
            'term' => $fee['term'],
            'amount' => (float)$fee['amount'],
            'frequency' => $fee['frequency'],
            'is_mandatory' => (bool)$fee['is_mandatory'],
            'created_at' => $fee['created_at']
        ];
    }, $feeStructures);

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'data' => $formattedFees
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
