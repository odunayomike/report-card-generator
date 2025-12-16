<?php
/**
 * Get Report Route Handler
 * Supports both school and teacher access
 */

// Check authentication (either school or teacher)
if (!isset($_SESSION['user_type']) || !isset($_SESSION['school_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized. Please login.']);
    exit;
}

$userType = $_SESSION['user_type'];
$schoolId = $_SESSION['school_id'];

$database = new Database();
$db = $database->getConnection();

// Get student ID from query parameter
$student_id = isset($_GET['id']) ? intval($_GET['id']) : 0;

if ($student_id <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid student ID']);
    exit();
}

try {
    // Get student data with school information
    $query = "SELECT s.*, sc.school_name, sc.address as school_address, sc.phone as school_phone, sc.email as school_email, sc.logo as school_logo
              FROM students s
              LEFT JOIN schools sc ON s.school_id = sc.id
              WHERE s.id = :id AND s.school_id = :school_id";
    $stmt = $db->prepare($query);
    $stmt->execute([
        ':id' => $student_id,
        ':school_id' => $schoolId
    ]);
    $student = $stmt->fetch();

    if (!$student) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Student not found']);
        exit();
    }

    // If teacher, verify they are assigned to this student's class
    if ($userType === 'teacher') {
        $verifyQuery = "SELECT id FROM teacher_classes
                        WHERE teacher_id = ? AND class_name = ? AND session = ? AND term = ?";
        $verifyStmt = $db->prepare($verifyQuery);
        $verifyStmt->execute([
            $_SESSION['teacher_id'],
            $student['class'],
            $student['session'],
            $student['term']
        ]);

        if (!$verifyStmt->fetch()) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'You are not assigned to this student\'s class']);
            exit;
        }
    }

    // Get attendance data
    $query = "SELECT * FROM attendance WHERE student_id = :id";
    $stmt = $db->prepare($query);
    $stmt->execute([':id' => $student_id]);
    $attendance = $stmt->fetch();

    // Get subjects
    $query = "SELECT * FROM subjects WHERE student_id = :id";
    $stmt = $db->prepare($query);
    $stmt->execute([':id' => $student_id]);
    $subjects = $stmt->fetchAll();

    // Get affective domain
    $query = "SELECT * FROM affective_domain WHERE student_id = :id";
    $stmt = $db->prepare($query);
    $stmt->execute([':id' => $student_id]);
    $affective_rows = $stmt->fetchAll();

    $affective = [];
    foreach ($affective_rows as $row) {
        $affective[$row['trait_name']] = $row['rating'];
    }

    // Get psychomotor domain
    $query = "SELECT * FROM psychomotor_domain WHERE student_id = :id";
    $stmt = $db->prepare($query);
    $stmt->execute([':id' => $student_id]);
    $psychomotor_rows = $stmt->fetchAll();

    $psychomotor = [];
    foreach ($psychomotor_rows as $row) {
        $psychomotor[$row['skill_name']] = $row['rating'];
    }

    // Get remarks
    $query = "SELECT * FROM remarks WHERE student_id = :id";
    $stmt = $db->prepare($query);
    $stmt->execute([':id' => $student_id]);
    $remarks = $stmt->fetch();

    // Format subjects for frontend
    $formatted_subjects = [];
    foreach ($subjects as $subject) {
        $formatted_subjects[] = [
            'name' => $subject['subject_name'],
            'ca' => $subject['ca'],
            'exam' => $subject['exam'],
            'total' => $subject['total']
        ];
    }

    // Build response
    $response = [
        'success' => true,
        'data' => [
            'id' => $student['id'],
            'name' => $student['name'],
            'class' => $student['class'],
            'session' => $student['session'],
            'admissionNo' => $student['admission_no'],
            'term' => $student['term'],
            'gender' => $student['gender'],
            'height' => $student['height'],
            'weight' => $student['weight'],
            'clubSociety' => $student['club_society'],
            'favCol' => $student['fav_col'],
            'photo' => $student['photo'],
            'noOfTimesSchoolOpened' => $attendance['no_of_times_school_opened'] ?? '',
            'noOfTimesPresent' => $attendance['no_of_times_present'] ?? '',
            'noOfTimesAbsent' => $attendance['no_of_times_absent'] ?? '',
            'subjects' => $formatted_subjects,
            'affectiveDomain' => $affective,
            'psychomotorDomain' => $psychomotor,
            'teacherName' => $remarks['teacher_name'] ?? '',
            'teacherRemark' => $remarks['teacher_remark'] ?? '',
            'principalName' => $remarks['principal_name'] ?? '',
            'principalRemark' => $remarks['principal_remark'] ?? '',
            'nextTermBegins' => $remarks['next_term_begins'] ?? '',
            'schoolName' => $student['school_name'] ?? 'BAILEY\'S BOWEN COLLEGE',
            'schoolAddress' => $student['school_address'] ?? 'No 14 Davis Cole Crescent, Pineville Estate, Sunrise, Lagos State.',
            'schoolPhone' => $student['school_phone'] ?? '08115414915, 07034552256',
            'schoolEmail' => $student['school_email'] ?? 'baileysbowencollege@gmail.com',
            'schoolLogo' => $student['school_logo'] ?? ''
        ]
    ];

    http_response_code(200);
    echo json_encode($response);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error retrieving report card: ' . $e->getMessage()
    ]);
}
?>
