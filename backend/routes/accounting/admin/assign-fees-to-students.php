<?php
/**
 * Assign Fees to Students
 * Automatically create student_fees records based on fee_structure
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

if (!isset($data['fee_structure_id']) || empty($data['fee_structure_id'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Fee structure ID is required']);
    exit;
}

$feeStructureId = intval($data['fee_structure_id']);

try {
    $database = new Database();
    $db = $database->getConnection();

    $schoolId = $_SESSION['school_id'];

    // Get fee structure details
    $feeQuery = "SELECT * FROM fee_structure WHERE id = ? AND school_id = ?";
    $feeStmt = $db->prepare($feeQuery);
    $feeStmt->execute([$feeStructureId, $schoolId]);
    $feeStructure = $feeStmt->fetch(PDO::FETCH_ASSOC);

    if (!$feeStructure) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Fee structure not found']);
        exit;
    }

    // Determine which students to assign fees to
    $studentsQuery = "SELECT id FROM students WHERE school_id = ?";
    $params = [$schoolId];

    if ($feeStructure['student_id']) {
        // Specific student
        $studentsQuery .= " AND id = ?";
        $params[] = $feeStructure['student_id'];
    } elseif ($feeStructure['class']) {
        // Specific class - handle both exact match and trimmed match
        $studentsQuery .= " AND (class = ? OR TRIM(class) = ?)";
        $params[] = $feeStructure['class'];
        $params[] = $feeStructure['class'];
    }
    // If both are null, it applies to all students

    $studentsStmt = $db->prepare($studentsQuery);
    $studentsStmt->execute($params);
    $students = $studentsStmt->fetchAll(PDO::FETCH_ASSOC);

    if (empty($students)) {
        echo json_encode([
            'success' => true,
            'message' => 'No students found matching the criteria',
            'assigned_count' => 0
        ]);
        exit;
    }

    // For each student, check if they already have this fee assigned
    $assignedCount = 0;
    $skippedCount = 0;

    foreach ($students as $student) {
        // Check if student already has this fee
        $checkQuery = "SELECT id FROM student_fees
                       WHERE student_id = ?
                       AND fee_structure_id = ?
                       AND session = ?
                       AND term = ?";
        $checkStmt = $db->prepare($checkQuery);
        $checkStmt->execute([
            $student['id'],
            $feeStructureId,
            $feeStructure['session'],
            $feeStructure['term'] ?: ''
        ]);

        if ($checkStmt->fetch()) {
            $skippedCount++;
            continue; // Skip if already assigned
        }

        // Calculate due date based on frequency
        $dueDate = null;
        if ($feeStructure['frequency'] === 'per-term') {
            // Due 3 months (90 days) from now
            $dueDate = date('Y-m-d', strtotime('+90 days'));
        } elseif ($feeStructure['frequency'] === 'per-session') {
            // Due 1 year (365 days) from now
            $dueDate = date('Y-m-d', strtotime('+365 days'));
        } elseif ($feeStructure['frequency'] === 'monthly') {
            // Due end of current month
            $dueDate = date('Y-m-t');
        } else {
            // One-time: due 30 days from now
            $dueDate = date('Y-m-d', strtotime('+30 days'));
        }

        // Determine status
        $status = 'pending';
        if ($dueDate && $dueDate < date('Y-m-d')) {
            $status = 'overdue';
        }

        // Create student_fee record
        $insertQuery = "INSERT INTO student_fees
                        (student_id, fee_structure_id, amount_due, amount_paid,
                         due_date, status, session, term)
                        VALUES (?, ?, ?, 0, ?, ?, ?, ?)";

        $insertStmt = $db->prepare($insertQuery);
        $insertStmt->execute([
            $student['id'],
            $feeStructureId,
            $feeStructure['amount'],
            $dueDate,
            $status,
            $feeStructure['session'],
            $feeStructure['term'] ?: ''
        ]);

        $assignedCount++;
    }

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => "Fees assigned to {$assignedCount} student(s)",
        'assigned_count' => $assignedCount,
        'skipped_count' => $skippedCount,
        'total_eligible' => count($students)
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
