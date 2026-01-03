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
    // Get student from master table
    $query = "SELECT id, name, current_class, gender, admission_no
              FROM students
              WHERE school_id = :school_id
              AND admission_no = :admission_no
              LIMIT 1";

    $stmt = $db->prepare($query);
    $stmt->execute([
        ':school_id' => $school_id,
        ':admission_no' => $admission_no
    ]);

    $student = $stmt->fetch();

    if ($student) {
        // Get most recent report card for this student
        $reportQuery = "SELECT id, student_photo as photo, height, weight, club_society, fav_col
                        FROM report_cards
                        WHERE school_id = :school_id
                        AND student_admission_no = :admission_no
                        ORDER BY created_at DESC
                        LIMIT 1";

        $reportStmt = $db->prepare($reportQuery);
        $reportStmt->execute([
            ':school_id' => $school_id,
            ':admission_no' => $admission_no
        ]);
        $latestReport = $reportStmt->fetch();

        // Get subjects from the most recent report
        $formattedSubjects = [];
        if ($latestReport) {
            $subjectsQuery = "SELECT subject_name, ca, exam, total
                              FROM subjects
                              WHERE report_card_id = :report_card_id
                              ORDER BY id";

            $subjectsStmt = $db->prepare($subjectsQuery);
            $subjectsStmt->execute([':report_card_id' => $latestReport['id']]);
            $subjects = $subjectsStmt->fetchAll();

            foreach ($subjects as $subject) {
                $formattedSubjects[] = [
                    'name' => $subject['subject_name'],
                    'ca' => $subject['ca'],
                    'exam' => $subject['exam'],
                    'total' => $subject['total']
                ];
            }
        }

        http_response_code(200);
        echo json_encode([
            'success' => true,
            'exists' => true,
            'student' => [
                'name' => $student['name'],
                'class' => $student['current_class'],
                'gender' => $student['gender'],
                'admissionNo' => $student['admission_no'],
                'height' => $latestReport['height'] ?? null,
                'weight' => $latestReport['weight'] ?? null,
                'clubSociety' => $latestReport['club_society'] ?? null,
                'favCol' => $latestReport['fav_col'] ?? null,
                'photo' => $latestReport['photo'] ?? null,
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
