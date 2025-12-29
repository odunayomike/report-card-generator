<?php
/**
 * Get Daily Attendance Route
 * Returns attendance records for a specific date and class
 * Supports both school and teacher access
 */

// Check authentication (either school or teacher)
if (!isset($_SESSION['user_type']) || !isset($_SESSION['school_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized. Please login.']);
    exit;
}

$userType = $_SESSION['user_type'];

// Get query parameters
$date = $_GET['date'] ?? '';
$className = $_GET['class'] ?? '';
$session = $_GET['session'] ?? '';
$term = $_GET['term'] ?? '';

// Validate input
if (empty($date)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Date is required']);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();

    // Build query based on user type and filters
    if ($userType === 'teacher') {
        // Teachers can only see their assigned classes (term-independent)
        if (!empty($className)) {
            // Verify teacher is assigned to this class
            $checkQuery = "SELECT id FROM teacher_classes
                           WHERE teacher_id = ?
                           AND TRIM(LOWER(class_name)) = LOWER(?)
                           AND TRIM(LOWER(session)) = LOWER(?)";
            $checkStmt = $db->prepare($checkQuery);
            $checkStmt->execute([$_SESSION['teacher_id'], trim($className), trim($session)]);

            if (!$checkStmt->fetch()) {
                http_response_code(403);
                echo json_encode(['success' => false, 'message' => 'You are not assigned to this class']);
                exit;
            }

            // Get attendance for specific class
            $query = "SELECT da.id, da.student_id, da.date, da.status, da.created_at,
                      s.name as student_name, s.admission_no, s.class, s.session, s.term,
                      t.name as teacher_name
                      FROM daily_attendance da
                      INNER JOIN students s ON da.student_id = s.id
                      LEFT JOIN teachers t ON da.marked_by_teacher_id = t.id
                      WHERE da.date = ? AND s.class = ? AND s.session = ? AND s.term = ?
                      AND s.school_id = ?
                      ORDER BY s.name ASC";

            $stmt = $db->prepare($query);
            $stmt->execute([$date, $className, $session, $term, $_SESSION['school_id']]);
        } else {
            // Get attendance for all classes teacher is assigned to (term-independent)
            $query = "SELECT da.id, da.student_id, da.date, da.status, da.created_at,
                      s.name as student_name, s.admission_no, s.class, s.session, s.term,
                      t.name as teacher_name
                      FROM daily_attendance da
                      INNER JOIN students s ON da.student_id = s.id
                      INNER JOIN teacher_classes tc ON TRIM(LOWER(s.class)) = TRIM(LOWER(tc.class_name))
                          AND TRIM(LOWER(s.session)) = TRIM(LOWER(tc.session))
                      LEFT JOIN teachers t ON da.marked_by_teacher_id = t.id
                      WHERE da.date = ? AND tc.teacher_id = ? AND s.school_id = ?
                      ORDER BY s.class ASC, s.name ASC";

            $stmt = $db->prepare($query);
            $stmt->execute([$date, $_SESSION['teacher_id'], $_SESSION['school_id']]);
        }
    } else {
        // Schools can see all attendance
        if (!empty($className)) {
            // Get attendance for specific class
            $query = "SELECT da.id, da.student_id, da.date, da.status, da.created_at,
                      s.name as student_name, s.admission_no, s.class, s.session, s.term,
                      t.name as teacher_name
                      FROM daily_attendance da
                      INNER JOIN students s ON da.student_id = s.id
                      LEFT JOIN teachers t ON da.marked_by_teacher_id = t.id
                      WHERE da.date = ? AND s.class = ? AND s.session = ? AND s.term = ?
                      AND s.school_id = ?
                      ORDER BY s.name ASC";

            $stmt = $db->prepare($query);
            $stmt->execute([$date, $className, $session, $term, $_SESSION['school_id']]);
        } else {
            // Get attendance for all students in the school
            $query = "SELECT da.id, da.student_id, da.date, da.status, da.created_at,
                      s.name as student_name, s.admission_no, s.class, s.session, s.term,
                      t.name as teacher_name
                      FROM daily_attendance da
                      INNER JOIN students s ON da.student_id = s.id
                      LEFT JOIN teachers t ON da.marked_by_teacher_id = t.id
                      WHERE da.date = ? AND s.school_id = ?
                      ORDER BY s.class ASC, s.name ASC";

            $stmt = $db->prepare($query);
            $stmt->execute([$date, $_SESSION['school_id']]);
        }
    }

    $records = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'date' => $date,
        'data' => $records
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>
