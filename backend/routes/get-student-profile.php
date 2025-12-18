<?php
/**
 * Get Student Profile Route Handler
 * Gets all report cards for a student by admission number
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
    // Get all reports for this student
    $query = "SELECT id, name, class, session, term, gender, admission_no,
              height, weight, club_society, fav_col, photo, created_at
              FROM students
              WHERE school_id = :school_id
              AND admission_no = :admission_no
              ORDER BY created_at DESC";

    $stmt = $db->prepare($query);
    $stmt->execute([
        ':school_id' => $school_id,
        ':admission_no' => $admission_no
    ]);

    $reports = $stmt->fetchAll();

    if ($reports && count($reports) > 0) {
        // Get the most recent student info
        $studentInfo = [
            'name' => $reports[0]['name'],
            'gender' => $reports[0]['gender'],
            'admissionNo' => $reports[0]['admission_no'],
            'height' => $reports[0]['height'],
            'weight' => $reports[0]['weight'],
            'clubSociety' => $reports[0]['club_society'],
            'favCol' => $reports[0]['fav_col'],
            'photo' => $reports[0]['photo']
        ];

        // Format all reports
        $allReports = [];
        foreach ($reports as $report) {
            $allReports[] = [
                'id' => $report['id'],
                'class' => $report['class'],
                'session' => $report['session'],
                'term' => $report['term'],
                'createdAt' => $report['created_at']
            ];
        }

        http_response_code(200);
        echo json_encode([
            'success' => true,
            'studentInfo' => $studentInfo,
            'reports' => $allReports,
            'totalReports' => count($reports)
        ]);
    } else {
        // No reports found - return empty profile with just admission number
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'studentInfo' => [
                'name' => 'Unknown',
                'gender' => 'Unknown',
                'admissionNo' => $admission_no,
                'height' => '',
                'weight' => '',
                'clubSociety' => '',
                'favCol' => '',
                'photo' => null
            ],
            'reports' => [],
            'totalReports' => 0,
            'message' => 'No reports found for this student'
        ]);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error loading student profile: ' . $e->getMessage()
    ]);
}
