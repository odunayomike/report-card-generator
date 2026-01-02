<?php
/**
 * Mark Daily Attendance Route
 * Allows teachers to mark student attendance for a specific date
 */

// Check if teacher is authenticated
if (!isset($_SESSION['user_type']) || $_SESSION['user_type'] !== 'teacher' || !isset($_SESSION['teacher_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized - Teacher access required']);
    exit;
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

$date = $input['date'] ?? '';
$attendanceRecords = $input['attendance'] ?? []; // Array of {student_id, status}

// Validate input
if (empty($date)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Date is required']);
    exit;
}

if (!is_array($attendanceRecords) || empty($attendanceRecords)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Attendance records are required']);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();

    // Begin transaction
    $db->beginTransaction();

    $insertQuery = "INSERT INTO daily_attendance (student_id, date, status, marked_by_teacher_id)
                    VALUES (?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE
                    status = VALUES(status),
                    marked_by_teacher_id = VALUES(marked_by_teacher_id),
                    updated_at = CURRENT_TIMESTAMP";

    $stmt = $db->prepare($insertQuery);

    $successCount = 0;
    $absentStudents = []; // Track absent students for notifications

    foreach ($attendanceRecords as $record) {
        $studentId = intval($record['student_id'] ?? 0);
        $status = strtolower($record['status'] ?? '');

        // Validate status
        if (!in_array($status, ['present', 'absent'])) {
            continue;
        }

        // Verify student belongs to teacher's school and get student details
        $verifyQuery = "SELECT id, name, school_id FROM students WHERE id = ? AND school_id = ?";
        $verifyStmt = $db->prepare($verifyQuery);
        $verifyStmt->execute([$studentId, $_SESSION['school_id']]);
        $studentData = $verifyStmt->fetch(PDO::FETCH_ASSOC);

        if (!$studentData) {
            continue; // Skip unauthorized students
        }

        // Mark attendance
        $stmt->execute([$studentId, $date, $status, $_SESSION['teacher_id']]);
        $successCount++;

        // Track absent students for notification
        if ($status === 'absent') {
            $absentStudents[] = [
                'student_id' => $studentData['id'],
                'student_name' => $studentData['name'],
                'school_id' => $studentData['school_id']
            ];
        }
    }

    // Commit transaction
    $db->commit();

    // Send notifications to parents of absent students
    if (!empty($absentStudents)) {
        try {
            require_once __DIR__ . '/../../utils/NotificationHelper.php';
            $notificationHelper = new NotificationHelper($db);

            // Format date for notification
            $formattedDate = date('F j, Y', strtotime($date));

            foreach ($absentStudents as $student) {
                // Get parent IDs for this student
                $parentQuery = "SELECT parent_id FROM parent_students WHERE student_id = ?";
                $parentStmt = $db->prepare($parentQuery);
                $parentStmt->execute([$student['student_id']]);
                $parentIds = $parentStmt->fetchAll(PDO::FETCH_COLUMN);

                // Send notification to each parent
                foreach ($parentIds as $parentId) {
                    $notificationHelper->notifyStudentAbsent(
                        $parentId,
                        $student['school_id'],
                        $student['student_id'],
                        $student['student_name'],
                        $formattedDate
                    );
                }
            }
        } catch (Exception $e) {
            // Log error but don't fail the request
            error_log('Failed to send absence notification: ' . $e->getMessage());
        }
    }

    echo json_encode([
        'success' => true,
        'message' => "Attendance marked successfully for $successCount student(s)",
        'count' => $successCount
    ]);

} catch (PDOException $e) {
    if (isset($db)) {
        $db->rollBack();
    }
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
} catch (Exception $e) {
    if (isset($db)) {
        $db->rollBack();
    }
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>
