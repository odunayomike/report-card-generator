<?php
/**
 * Update School Settings
 * Updates grading scale, subjects, calendar, and report customization
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

    // Get JSON input
    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Invalid input data'
        ]);
        exit();
    }

    // Prepare update fields
    $updateFields = [];
    $params = [':school_id' => $school_id];

    // Handle grading_scale (JSON)
    if (isset($input['grading_scale'])) {
        $updateFields[] = "grading_scale = :grading_scale";
        $params[':grading_scale'] = json_encode($input['grading_scale']);
    }

    // Handle academic dates
    if (isset($input['academic_year_start'])) {
        $updateFields[] = "academic_year_start = :academic_year_start";
        $params[':academic_year_start'] = $input['academic_year_start'];
    }

    if (isset($input['academic_year_end'])) {
        $updateFields[] = "academic_year_end = :academic_year_end";
        $params[':academic_year_end'] = $input['academic_year_end'];
    }

    // Handle term_structure (JSON)
    if (isset($input['term_structure'])) {
        $updateFields[] = "term_structure = :term_structure";
        $params[':term_structure'] = json_encode($input['term_structure']);
    }

    // Handle available_subjects (JSON array)
    if (isset($input['available_subjects'])) {
        $updateFields[] = "available_subjects = :available_subjects";
        $params[':available_subjects'] = json_encode($input['available_subjects']);
    }

    // Handle report customization
    if (isset($input['report_template'])) {
        $updateFields[] = "report_template = :report_template";
        $params[':report_template'] = $input['report_template'];
    }

    if (isset($input['show_logo_on_report'])) {
        $updateFields[] = "show_logo_on_report = :show_logo_on_report";
        $params[':show_logo_on_report'] = $input['show_logo_on_report'] ? 1 : 0;
    }

    if (isset($input['show_motto_on_report'])) {
        $updateFields[] = "show_motto_on_report = :show_motto_on_report";
        $params[':show_motto_on_report'] = $input['show_motto_on_report'] ? 1 : 0;
    }

    if (isset($input['header_text'])) {
        $updateFields[] = "header_text = :header_text";
        $params[':header_text'] = $input['header_text'];
    }

    if (isset($input['footer_text'])) {
        $updateFields[] = "footer_text = :footer_text";
        $params[':footer_text'] = $input['footer_text'];
    }

    if (empty($updateFields)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'No settings to update'
        ]);
        exit();
    }

    // Update the settings
    $query = "UPDATE schools
              SET " . implode(', ', $updateFields) . ",
                  updated_at = CURRENT_TIMESTAMP
              WHERE id = :school_id AND is_active = 1";

    $stmt = $db->prepare($query);
    $stmt->execute($params);

    if ($stmt->rowCount() > 0) {
        // Fetch updated settings
        $fetchQuery = "SELECT
                        grading_scale,
                        academic_year_start,
                        academic_year_end,
                        term_structure,
                        available_subjects,
                        report_template,
                        show_logo_on_report,
                        show_motto_on_report,
                        header_text,
                        footer_text
                       FROM schools
                       WHERE id = :school_id";
        $fetchStmt = $db->prepare($fetchQuery);
        $fetchStmt->bindParam(':school_id', $school_id);
        $fetchStmt->execute();
        $updatedSettings = $fetchStmt->fetch(PDO::FETCH_ASSOC);

        // Parse JSON fields
        if ($updatedSettings['grading_scale']) {
            $updatedSettings['grading_scale'] = json_decode($updatedSettings['grading_scale'], true);
        }
        if ($updatedSettings['term_structure']) {
            $updatedSettings['term_structure'] = json_decode($updatedSettings['term_structure'], true);
        }
        if ($updatedSettings['available_subjects']) {
            $updatedSettings['available_subjects'] = json_decode($updatedSettings['available_subjects'], true);
        }

        echo json_encode([
            'success' => true,
            'message' => 'Settings updated successfully',
            'data' => $updatedSettings
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'No changes made or school not found'
        ]);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
