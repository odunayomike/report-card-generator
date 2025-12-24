<?php
/**
 * Get Child's Outstanding Fees (Parent Mobile API)
 * Returns all fees for a specific child
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

// Get student ID from query parameter
$studentId = isset($_GET['student_id']) ? intval($_GET['student_id']) : 0;

if (!$studentId) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Student ID is required']);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();

    // Verify that this student belongs to the logged-in parent
    $verifyQuery = "SELECT ps.student_id, s.name, s.class, s.admission_no, s.session, s.term
                    FROM parent_students ps
                    INNER JOIN students s ON ps.student_id = s.id
                    WHERE ps.parent_id = ? AND ps.student_id = ?";
    $verifyStmt = $db->prepare($verifyQuery);
    $verifyStmt->execute([$_SESSION['parent_id'], $studentId]);
    $student = $verifyStmt->fetch(PDO::FETCH_ASSOC);

    if (!$student) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Access denied']);
        exit;
    }

    // Get all fees for this student
    $feesQuery = "SELECT
                    sf.id,
                    sf.amount_due,
                    sf.amount_paid,
                    sf.balance,
                    sf.due_date,
                    sf.status,
                    sf.session,
                    sf.term,
                    sf.notes,
                    fc.name as category_name,
                    fc.description as category_description,
                    fs.frequency
                  FROM student_fees sf
                  INNER JOIN fee_structure fs ON sf.fee_structure_id = fs.id
                  INNER JOIN fee_categories fc ON fs.fee_category_id = fc.id
                  WHERE sf.student_id = ?
                  ORDER BY
                    CASE sf.status
                        WHEN 'overdue' THEN 1
                        WHEN 'pending' THEN 2
                        WHEN 'partial' THEN 3
                        WHEN 'paid' THEN 4
                        WHEN 'waived' THEN 5
                    END,
                    sf.due_date ASC";

    $feesStmt = $db->prepare($feesQuery);
    $feesStmt->execute([$studentId]);
    $fees = $feesStmt->fetchAll(PDO::FETCH_ASSOC);

    // Format fees
    $formattedFees = array_map(function($fee) {
        return [
            'id' => (int)$fee['id'],
            'category' => $fee['category_name'],
            'description' => $fee['category_description'],
            'amount_due' => (float)$fee['amount_due'],
            'amount_paid' => (float)$fee['amount_paid'],
            'balance' => (float)$fee['balance'],
            'due_date' => $fee['due_date'],
            'status' => $fee['status'],
            'session' => $fee['session'],
            'term' => $fee['term'],
            'frequency' => $fee['frequency'],
            'is_overdue' => $fee['status'] === 'overdue',
            'notes' => $fee['notes']
        ];
    }, $fees);

    // Calculate summary
    $totalDue = array_sum(array_column($formattedFees, 'amount_due'));
    $totalPaid = array_sum(array_column($formattedFees, 'amount_paid'));
    $totalBalance = array_sum(array_column($formattedFees, 'balance'));
    $overdueCount = count(array_filter($formattedFees, function($f) { return $f['is_overdue']; }));

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'data' => [
            'student' => [
                'id' => (int)$student['student_id'],
                'name' => $student['name'],
                'class' => $student['class'],
                'admission_no' => $student['admission_no'],
                'session' => $student['session'],
                'term' => $student['term']
            ],
            'fees' => $formattedFees,
            'summary' => [
                'total_due' => $totalDue,
                'total_paid' => $totalPaid,
                'total_balance' => $totalBalance,
                'overdue_count' => $overdueCount,
                'total_fees' => count($formattedFees)
            ]
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
