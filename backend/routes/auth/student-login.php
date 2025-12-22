<?php
/**
 * Student Login Route
 * Simple authentication using admission number
 */

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$admissionNo = trim($input['admission_no'] ?? '');

if (empty($admissionNo)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Admission number is required']);
    exit;
}

$database = new Database();
$db = $database->getConnection();

try {
    // Find student by admission number
    $query = "SELECT id, name, admission_no as admission_no, class, session, term, school_id
              FROM students
              WHERE admission_no = ?
              LIMIT 1";
    $stmt = $db->prepare($query);
    $stmt->execute([$admissionNo]);
    $student = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$student) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Invalid admission number']);
        exit;
    }

    // Create session
    $_SESSION['user_type'] = 'student';
    $_SESSION['student_id'] = $student['id'];
    $_SESSION['school_id'] = $student['school_id'];

    echo json_encode([
        'success' => true,
        'message' => 'Login successful',
        'student' => [
            'id' => $student['id'],
            'name' => $student['name'],
            'admission_no' => $student['admission_no'],
            'class' => $student['class'],
            'session' => $student['session'],
            'term' => $student['term']
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>
