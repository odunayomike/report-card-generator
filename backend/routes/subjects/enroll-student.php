<?php
/**
 * Enroll Student in Subjects
 * Allows enrollment of a single student in multiple subjects
 */

// Check authentication - school or teacher
if (!isset($_SESSION['school_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$studentId = isset($input['student_id']) ? intval($input['student_id']) : 0;
$subjects = $input['subjects'] ?? [];
$session = $input['session'] ?? '';

if (!$studentId) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Student ID is required']);
    exit;
}

if (empty($session)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Session is required']);
    exit;
}

if (!is_array($subjects) || empty($subjects)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Subjects array is required and cannot be empty']);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();

    $schoolId = $_SESSION['school_id'];

    // Verify student belongs to this school
    $verifyQuery = "SELECT id, name, admission_no FROM students
                    WHERE id = ? AND school_id = ?";
    $verifyStmt = $db->prepare($verifyQuery);
    $verifyStmt->execute([$studentId, $schoolId]);
    $student = $verifyStmt->fetch(PDO::FETCH_ASSOC);

    if (!$student) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Student not found']);
        exit;
    }

    // Start transaction
    $db->beginTransaction();

    // Delete existing enrollments for this student and session
    $deleteQuery = "DELETE FROM student_subject_enrollment
                    WHERE student_id = ? AND session = ?";
    $deleteStmt = $db->prepare($deleteQuery);
    $deleteStmt->execute([$studentId, $session]);

    // Insert new enrollments
    $insertQuery = "INSERT INTO student_subject_enrollment
                    (student_id, subject_name, school_id, session)
                    VALUES (?, ?, ?, ?)";
    $insertStmt = $db->prepare($insertQuery);

    $enrolledCount = 0;
    $enrolledSubjects = [];

    foreach ($subjects as $subject) {
        $subjectName = is_array($subject) ? ($subject['name'] ?? $subject['subject_name'] ?? '') : $subject;
        $subjectName = trim($subjectName);

        if (!empty($subjectName)) {
            $insertStmt->execute([$studentId, $subjectName, $schoolId, $session]);
            $enrolledCount++;
            $enrolledSubjects[] = $subjectName;
        }
    }

    // Commit transaction
    $db->commit();

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => "Successfully enrolled {$student['name']} in {$enrolledCount} subject(s) for {$session}",
        'data' => [
            'student' => [
                'id' => (int)$student['id'],
                'name' => $student['name'],
                'admission_no' => $student['admission_no']
            ],
            'session' => $session,
            'enrolled_count' => $enrolledCount,
            'subjects' => $enrolledSubjects
        ]
    ]);

} catch (PDOException $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error occurred',
        'error' => $e->getMessage()
    ]);
} catch (Exception $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred',
        'error' => $e->getMessage()
    ]);
}
