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
    $query = "SELECT id, name, class, gender, admission_no, height, weight, club_society, fav_col, photo
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
        // Get subjects from the most recent report
        $subjectsQuery = "SELECT subject_name, ca, exam, total
                          FROM subjects
                          WHERE student_id = :student_id
                          ORDER BY id";

        $subjectsStmt = $db->prepare($subjectsQuery);
        $subjectsStmt->execute([':student_id' => $student['id']]);
        $subjects = $subjectsStmt->fetchAll();

        // Format subjects for frontend
        $formattedSubjects = [];
        foreach ($subjects as $subject) {
            $formattedSubjects[] = [
                'name' => $subject['subject_name'],
                'ca' => $subject['ca'],
                'exam' => $subject['exam'],
                'total' => $subject['total']
            ];
        }

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
                'photo' => $student['photo'],
                'subjects' => $formattedSubjects
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
