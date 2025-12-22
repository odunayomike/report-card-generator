<?php
/**
 * Teacher Check Session Route
 * Validates teacher session
 */

// Check if teacher is logged in
if (!isset($_SESSION['user_type']) || $_SESSION['user_type'] !== 'teacher' || !isset($_SESSION['teacher_id'])) {
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'authenticated' => false
    ]);
    exit;
}

$database = new Database();
$db = $database->getConnection();

// Fetch school settings including assessment configuration
$schoolQuery = "SELECT assessment_types, available_subjects, ca_max_marks, exam_max_marks
                FROM schools WHERE id = :school_id";
$schoolStmt = $db->prepare($schoolQuery);
$schoolStmt->execute([':school_id' => $_SESSION['school_id']]);
$schoolSettings = $schoolStmt->fetch();

// Parse assessment_types JSON
$assessmentTypes = ['CA', 'Exam']; // Default
if ($schoolSettings && !empty($schoolSettings['assessment_types'])) {
    $decoded = json_decode($schoolSettings['assessment_types'], true);
    if (is_array($decoded)) {
        $assessmentTypes = $decoded;
    }
}

// Parse available_subjects JSON
$availableSubjects = [];
if ($schoolSettings && !empty($schoolSettings['available_subjects'])) {
    $decoded = json_decode($schoolSettings['available_subjects'], true);
    if (is_array($decoded)) {
        $availableSubjects = $decoded;
    }
}

// Return session data with school settings
echo json_encode([
    'success' => true,
    'authenticated' => true,
    'user' => [
        'id' => $_SESSION['teacher_id'],
        'name' => $_SESSION['name'],
        'email' => $_SESSION['email'],
        'school_id' => $_SESSION['school_id'],
        'school_name' => $_SESSION['school_name'] ?? '',
        'user_type' => 'teacher'
    ],
    'school' => [
        'assessment_types' => $assessmentTypes,
        'available_subjects' => $availableSubjects,
        'ca_max_marks' => $schoolSettings['ca_max_marks'] ?? 40,
        'exam_max_marks' => $schoolSettings['exam_max_marks'] ?? 60
    ]
]);
?>
