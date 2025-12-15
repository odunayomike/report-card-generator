<?php
/**
 * Update School Profile
 * Updates basic school information
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

    // Allowed fields to update
    $allowedFields = ['school_name', 'email', 'phone', 'address', 'motto', 'primary_color', 'secondary_color'];

    foreach ($allowedFields as $field) {
        if (isset($input[$field])) {
            $updateFields[] = "$field = :$field";
            $params[":$field"] = $input[$field];
        }
    }

    if (empty($updateFields)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'No fields to update'
        ]);
        exit();
    }

    // Check if email already exists for another school
    if (isset($input['email'])) {
        $emailCheckQuery = "SELECT id FROM schools WHERE email = :email AND id != :school_id";
        $emailCheckStmt = $db->prepare($emailCheckQuery);
        $emailCheckStmt->bindParam(':email', $input['email']);
        $emailCheckStmt->bindParam(':school_id', $school_id);
        $emailCheckStmt->execute();

        if ($emailCheckStmt->fetch()) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Email already in use by another school'
            ]);
            exit();
        }
    }

    // Update the school profile
    $query = "UPDATE schools
              SET " . implode(', ', $updateFields) . ",
                  updated_at = CURRENT_TIMESTAMP
              WHERE id = :school_id AND is_active = 1";

    $stmt = $db->prepare($query);
    $stmt->execute($params);

    if ($stmt->rowCount() > 0) {
        // Fetch updated profile
        $fetchQuery = "SELECT id, school_name, email, phone, address, motto, primary_color, secondary_color, logo
                       FROM schools
                       WHERE id = :school_id";
        $fetchStmt = $db->prepare($fetchQuery);
        $fetchStmt->bindParam(':school_id', $school_id);
        $fetchStmt->execute();
        $updatedSchool = $fetchStmt->fetch(PDO::FETCH_ASSOC);

        // Update session data
        $_SESSION['school_name'] = $updatedSchool['school_name'];
        $_SESSION['email'] = $updatedSchool['email'];

        echo json_encode([
            'success' => true,
            'message' => 'Profile updated successfully',
            'data' => $updatedSchool
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
