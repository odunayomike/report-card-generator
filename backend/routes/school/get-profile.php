<?php
/**
 * Get School Profile
 * Returns complete school profile with all settings
 */

header('Content-Type: application/json');

// Initialize database connection
$database = new Database();
$db = $database->getConnection();

// Check if session is active
if (!isset($_SESSION['school_id'])) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'Unauthorized - Please login'
    ]);
    exit();
}

try {
    $school_id = $_SESSION['school_id'];

    // Fetch complete school profile
    $query = "SELECT
                id,
                school_name,
                email,
                phone,
                address,
                logo,
                motto,
                primary_color,
                secondary_color,
                grading_scale,
                academic_year_start,
                academic_year_end,
                term_structure,
                available_subjects,
                assessment_types,
                ca_max_marks,
                exam_max_marks,
                use_ca_breakdown,
                ca_components,
                report_template,
                show_logo_on_report,
                show_motto_on_report,
                header_text,
                footer_text,
                current_session,
                current_term,
                created_at
              FROM schools
              WHERE id = :school_id AND is_active = 1";

    $stmt = $db->prepare($query);
    $stmt->bindParam(':school_id', $school_id);
    $stmt->execute();

    $school = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$school) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'School profile not found'
        ]);
        exit();
    }

    // Parse JSON fields
    if ($school['grading_scale']) {
        $school['grading_scale'] = json_decode($school['grading_scale'], true);
    }
    if ($school['term_structure']) {
        $school['term_structure'] = json_decode($school['term_structure'], true);
    }
    if ($school['available_subjects']) {
        $school['available_subjects'] = json_decode($school['available_subjects'], true);
    }
    if ($school['assessment_types']) {
        $school['assessment_types'] = json_decode($school['assessment_types'], true);
    } else {
        // Provide default if not set
        $school['assessment_types'] = ['CA', 'Exam'];
    }
    if ($school['ca_components']) {
        $school['ca_components'] = json_decode($school['ca_components'], true);
    }

    // Convert boolean fields
    $school['use_ca_breakdown'] = (bool)$school['use_ca_breakdown'];

    // Get some stats for the profile
    $statsQuery = "SELECT
                    (SELECT COUNT(*) FROM students WHERE school_id = :school_id) as total_students,
                    (SELECT COUNT(DISTINCT class) FROM report_cards WHERE school_id = :school_id) as total_classes,
                    (SELECT COUNT(DISTINCT session) FROM report_cards WHERE school_id = :school_id) as total_sessions
                   ";

    $statsStmt = $db->prepare($statsQuery);
    $statsStmt->bindParam(':school_id', $school_id);
    $statsStmt->execute();
    $stats = $statsStmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'data' => $school,
        'stats' => $stats
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
