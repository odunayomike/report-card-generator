<?php
/**
 * Assign CBT Exam to External Student(s)
 * School admin can assign entrance exams to external students
 */

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Check if school admin is authenticated
if (!isset($_SESSION['user_type']) || $_SESSION['user_type'] !== 'school' || !isset($_SESSION['school_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized. School admin access required.']);
    exit;
}

require_once __DIR__ . '/../../config/database.php';

try {
    $schoolId = $_SESSION['school_id'];
    $input = json_decode(file_get_contents('php://input'), true);

    // Validate input
    if (!isset($input['exam_id']) || !isset($input['external_student_ids'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'exam_id and external_student_ids are required'
        ]);
        exit;
    }

    $examId = intval($input['exam_id']);
    $externalStudentIds = $input['external_student_ids'];

    if (!is_array($externalStudentIds) || empty($externalStudentIds)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'external_student_ids must be a non-empty array'
        ]);
        exit;
    }

    $database = new Database();
    $db = $database->getConnection();

    // Verify exam exists and belongs to this school
    $examQuery = "SELECT id, exam_title, class_name FROM cbt_exams WHERE id = ? AND school_id = ?";
    $examStmt = $db->prepare($examQuery);
    $examStmt->execute([$examId, $schoolId]);
    $exam = $examStmt->fetch(PDO::FETCH_ASSOC);

    if (!$exam) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Exam not found or does not belong to your school'
        ]);
        exit;
    }

    // Begin transaction
    $db->beginTransaction();

    $assignedCount = 0;
    $skippedCount = 0;
    $errors = [];

    foreach ($externalStudentIds as $externalStudentId) {
        $externalStudentId = intval($externalStudentId);

        // Verify external student exists and belongs to this school
        $studentQuery = "SELECT id, name, status FROM external_students WHERE id = ? AND school_id = ?";
        $studentStmt = $db->prepare($studentQuery);
        $studentStmt->execute([$externalStudentId, $schoolId]);
        $student = $studentStmt->fetch(PDO::FETCH_ASSOC);

        if (!$student) {
            $errors[] = "External student ID $externalStudentId not found or does not belong to your school";
            $skippedCount++;
            continue;
        }

        // Check if already assigned
        $checkQuery = "SELECT id FROM cbt_exam_assignments
                       WHERE exam_id = ? AND external_student_id = ?";
        $checkStmt = $db->prepare($checkQuery);
        $checkStmt->execute([$examId, $externalStudentId]);

        if ($checkStmt->fetch()) {
            $errors[] = "{$student['name']} is already assigned to this exam";
            $skippedCount++;
            continue;
        }

        // Assign exam
        $assignQuery = "INSERT INTO cbt_exam_assignments
                        (exam_id, student_id, external_student_id, school_id, assigned_at)
                        VALUES (?, NULL, ?, ?, NOW())";
        $assignStmt = $db->prepare($assignQuery);
        $assignStmt->execute([$examId, $externalStudentId, $schoolId]);

        // Update external student status
        if ($student['status'] === 'pending') {
            $updateStatusQuery = "UPDATE external_students SET status = 'exam_assigned' WHERE id = ?";
            $updateStmt = $db->prepare($updateStatusQuery);
            $updateStmt->execute([$externalStudentId]);
        }

        // Update total exams assigned count
        $updateCountQuery = "UPDATE external_students
                             SET total_exams_assigned = total_exams_assigned + 1
                             WHERE id = ?";
        $updateCountStmt = $db->prepare($updateCountQuery);
        $updateCountStmt->execute([$externalStudentId]);

        // Log activity
        $logQuery = "INSERT INTO external_student_activity_log
                     (external_student_id, school_id, activity_type, details, ip_address)
                     VALUES (?, ?, 'exam_assigned', ?, ?)";
        $logStmt = $db->prepare($logQuery);
        $logStmt->execute([
            $externalStudentId,
            $schoolId,
            "Assigned to exam: {$exam['exam_title']}",
            $_SERVER['REMOTE_ADDR'] ?? null
        ]);

        $assignedCount++;
    }

    // Commit transaction
    $db->commit();

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => "Successfully assigned exam to $assignedCount external student(s)",
        'data' => [
            'exam' => [
                'id' => $examId,
                'title' => $exam['exam_title'],
                'class' => $exam['class_name']
            ],
            'assigned_count' => $assignedCount,
            'skipped_count' => $skippedCount,
            'total_processed' => count($externalStudentIds)
        ],
        'errors' => $errors
    ]);

} catch (PDOException $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}
?>
