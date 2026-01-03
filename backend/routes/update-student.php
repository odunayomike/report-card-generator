<?php
/**
 * Update Student Information
 * Allows schools and teachers to update student profile details
 */

// Check authentication
if (!isset($_SESSION['user_type']) || !isset($_SESSION['school_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized - Please log in']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'PUT' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$userType = $_SESSION['user_type'];
$schoolId = $_SESSION['school_id'];

$database = new Database();
$db = $database->getConnection();

// Get posted data
$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid data provided']);
    exit;
}

// Validate required fields
if (empty($data['student_id'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Student ID is required']);
    exit;
}

$studentId = intval($data['student_id']);

try {
    // Verify student belongs to this school
    $verifyQuery = "SELECT id FROM students WHERE id = ? AND school_id = ?";
    $verifyStmt = $db->prepare($verifyQuery);
    $verifyStmt->execute([$studentId, $schoolId]);

    if (!$verifyStmt->fetch()) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Student not found or does not belong to your school']);
        exit;
    }

    // Build update query dynamically based on provided fields
    $updateFields = [];
    $updateValues = [];

    // Map frontend field names to database column names
    $fieldMap = [
        'name' => 'name',
        'class' => 'current_class',
        'gender' => 'gender',
        'guardian_email' => 'guardian_email'
    ];

    foreach ($fieldMap as $frontendField => $dbField) {
        if (isset($data[$frontendField])) {
            $updateFields[] = "$dbField = ?";
            $updateValues[] = $data[$frontendField];
        }
    }

    if (empty($updateFields)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'No fields to update']);
        exit;
    }

    // Add updated_at timestamp
    $updateFields[] = "updated_at = CURRENT_TIMESTAMP";

    // Add student ID at the end for WHERE clause
    $updateValues[] = $studentId;

    $query = "UPDATE students SET " . implode(', ', $updateFields) . " WHERE id = ?";
    $stmt = $db->prepare($query);
    $success = $stmt->execute($updateValues);

    if ($success) {
        // Fetch updated student data
        $fetchQuery = "SELECT id, name, admission_no, current_class, gender, guardian_email
                       FROM students WHERE id = ?";
        $fetchStmt = $db->prepare($fetchQuery);
        $fetchStmt->execute([$studentId]);
        $updatedStudent = $fetchStmt->fetch(PDO::FETCH_ASSOC);

        echo json_encode([
            'success' => true,
            'message' => 'Student information updated successfully',
            'student' => [
                'id' => (int)$updatedStudent['id'],
                'name' => $updatedStudent['name'],
                'admission_no' => $updatedStudent['admission_no'],
                'current_class' => $updatedStudent['current_class'],
                'gender' => $updatedStudent['gender'],
                'guardian_email' => $updatedStudent['guardian_email']
            ]
        ]);
    } else {
        throw new Exception('Failed to update student information');
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
