<?php
/**
 * Update School Logo
 * Handles logo upload as base64
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

    if (!isset($input['logo'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Logo data is required'
        ]);
        exit();
    }

    $logo = $input['logo'];

    // Validate base64 image
    if (!empty($logo) && !preg_match('/^data:image\/(png|jpeg|jpg|gif);base64,/', $logo)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Invalid image format. Please use PNG, JPEG, or GIF'
        ]);
        exit();
    }

    // Update logo in database
    $query = "UPDATE schools
              SET logo = :logo,
                  updated_at = CURRENT_TIMESTAMP
              WHERE id = :school_id AND is_active = 1";

    $stmt = $db->prepare($query);
    $stmt->bindParam(':logo', $logo, PDO::PARAM_STR);
    $stmt->bindParam(':school_id', $school_id);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        echo json_encode([
            'success' => true,
            'message' => 'Logo updated successfully',
            'logo' => $logo
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Failed to update logo'
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
