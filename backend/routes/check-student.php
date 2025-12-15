<?php
/**
 * Check Student Route Handler
 * Checks if a student exists by admission number and returns their basic info
 */

$database = new Database();
$db = $database->getConnection();

// Get admission number from query parameter
$admission_no = isset($_GET['admission_no']) ? trim($_GET['admission_no']) : '';
$school_id = isset($_SESSION['school_id']) ? $_SESSION['school_id'] : null;

if (empty($admission_no)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Admission number is required']);
    exit();
}

if (!$school_id) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit();
}

try {
    // Get the most recent student record with this admission number
    $query = "SELECT name, class, gender, admission_no, height, weight, club_society, fav_col, photo
              FROM students
              WHERE school_id = :school_id
              AND admission_no = :admission_no
              ORDER BY created_at DESC
              LIMIT 1";

    $stmt = $db->prepare($query);
    $stmt->execute([
        ':school_id' => $school_id,
        ':admission_no' => $admission_no
    ]);

    $student = $stmt->fetch();

    if ($student) {
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'exists' => true,
            'student' => [
                'name' => $student['name'],
                'class' => $student['class'],
                'gender' => $student['gender'],
                'admissionNo' => $student['admission_no'],
                'height' => $student['height'],
                'weight' => $student['weight'],
                'clubSociety' => $student['club_society'],
                'favCol' => $student['fav_col'],
                'photo' => $student['photo']
            ]
        ]);
    } else {
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'exists' => false
        ]);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error checking student: ' . $e->getMessage()
    ]);
}
