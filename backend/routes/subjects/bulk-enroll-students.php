<?php
/**
 * Bulk Enroll Students in Subjects
 * Allows enrollment of multiple students in their respective subjects at once
 */

// Check authentication - school admin only
if (!isset($_SESSION['school_id']) || $_SESSION['user_type'] !== 'school') {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized - School access required']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$enrollments = $input['enrollments'] ?? [];
$session = $input['session'] ?? '';
$className = $input['class_name'] ?? '';

if (empty($session)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Session is required']);
    exit;
}

if (!is_array($enrollments) || empty($enrollments)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Enrollments array is required and cannot be empty']);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();

    $schoolId = $_SESSION['school_id'];

    // Start transaction
    $db->beginTransaction();

    $enrolledStudents = 0;
    $totalSubjectsEnrolled = 0;
    $errors = [];

    foreach ($enrollments as $enrollment) {
        $studentId = isset($enrollment['student_id']) ? intval($enrollment['student_id']) : 0;
        $subjects = $enrollment['subjects'] ?? [];

        if (!$studentId || !is_array($subjects) || empty($subjects)) {
            $errors[] = "Invalid data for student ID: {$studentId}";
            continue;
        }

        // Verify student belongs to this school
        $verifyQuery = "SELECT id FROM students WHERE id = ? AND school_id = ?";
        $verifyStmt = $db->prepare($verifyQuery);
        $verifyStmt->execute([$studentId, $schoolId]);

        if (!$verifyStmt->fetch()) {
            $errors[] = "Student ID {$studentId} not found or doesn't belong to this school";
            continue;
        }

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

        $studentSubjectCount = 0;
        foreach ($subjects as $subject) {
            $subjectName = is_array($subject) ? ($subject['name'] ?? $subject['subject_name'] ?? '') : $subject;
            $subjectName = trim($subjectName);

            if (!empty($subjectName)) {
                $insertStmt->execute([$studentId, $subjectName, $schoolId, $session]);
                $studentSubjectCount++;
                $totalSubjectsEnrolled++;
            }
        }

        if ($studentSubjectCount > 0) {
            $enrolledStudents++;
        }
    }

    // Commit transaction
    $db->commit();

    $response = [
        'success' => true,
        'message' => "Successfully enrolled {$enrolledStudents} student(s) in a total of {$totalSubjectsEnrolled} subject(s)",
        'data' => [
            'session' => $session,
            'enrolled_students' => $enrolledStudents,
            'total_subjects_enrolled' => $totalSubjectsEnrolled
        ]
    ];

    if (!empty($errors)) {
        $response['warnings'] = $errors;
    }

    if (!empty($className)) {
        $response['data']['class_name'] = $className;
    }

    http_response_code(200);
    echo json_encode($response);

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
