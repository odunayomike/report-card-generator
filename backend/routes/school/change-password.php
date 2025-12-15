<?php
/**
 * Change School Password
 * Requires current password for verification
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

    if (!isset($input['current_password']) || !isset($input['new_password'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Current password and new password are required'
        ]);
        exit();
    }

    $current_password = $input['current_password'];
    $new_password = $input['new_password'];

    // Validate new password strength
    if (strlen($new_password) < 6) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'New password must be at least 6 characters long'
        ]);
        exit();
    }

    // Fetch current password hash
    $query = "SELECT password FROM schools WHERE id = :school_id AND is_active = 1";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':school_id', $school_id);
    $stmt->execute();
    $school = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$school) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'School not found'
        ]);
        exit();
    }

    // Verify current password
    if (!password_verify($current_password, $school['password'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Current password is incorrect'
        ]);
        exit();
    }

    // Hash new password
    $new_password_hash = password_hash($new_password, PASSWORD_DEFAULT);

    // Update password
    $updateQuery = "UPDATE schools
                    SET password = :password,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = :school_id AND is_active = 1";

    $updateStmt = $db->prepare($updateQuery);
    $updateStmt->bindParam(':password', $new_password_hash);
    $updateStmt->bindParam(':school_id', $school_id);
    $updateStmt->execute();

    if ($updateStmt->rowCount() > 0) {
        echo json_encode([
            'success' => true,
            'message' => 'Password changed successfully'
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Failed to change password'
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
