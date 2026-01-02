<?php
/**
 * Add Parent-Student Relationship (School Admin Only)
 * Creates parent account if doesn't exist and links to student
 */

// CORS is already handled by backend/config/cors.php loaded in index.php

// Check if school is authenticated
if (!isset($_SESSION['school_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

// Get JSON input
$json = file_get_contents('php://input');
$data = json_decode($json, true);

// Validate input
$required = ['student_id', 'parent_email', 'parent_name'];
foreach ($required as $field) {
    if (!isset($data[$field]) || empty(trim($data[$field]))) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => ucfirst(str_replace('_', ' ', $field)) . ' is required']);
        exit;
    }
}

$studentId = intval($data['student_id']);
$parentEmail = trim(strtolower($data['parent_email']));
$parentName = trim($data['parent_name']);
$parentPhone = isset($data['parent_phone']) ? trim($data['parent_phone']) : null;
$parentPassword = isset($data['parent_password']) ? trim($data['parent_password']) : null;
$relationship = isset($data['relationship']) ? $data['relationship'] : 'guardian';
$isPrimary = isset($data['is_primary']) ? (bool)$data['is_primary'] : false;

// Validate email
if (!filter_var($parentEmail, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid email format']);
    exit;
}

// Validate relationship
$validRelationships = ['father', 'mother', 'guardian', 'other'];
if (!in_array($relationship, $validRelationships)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid relationship type']);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();

    // Start transaction
    $db->beginTransaction();

    // Verify that student belongs to this school
    $verifyQuery = "SELECT id, name FROM students WHERE id = ? AND school_id = ?";
    $verifyStmt = $db->prepare($verifyQuery);
    $verifyStmt->execute([$studentId, $_SESSION['school_id']]);
    $student = $verifyStmt->fetch(PDO::FETCH_ASSOC);

    if (!$student) {
        $db->rollBack();
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Student not found or does not belong to your school']);
        exit;
    }

    // Check if parent exists
    $parentQuery = "SELECT id FROM parents WHERE email = ?";
    $parentStmt = $db->prepare($parentQuery);
    $parentStmt->execute([$parentEmail]);
    $parent = $parentStmt->fetch(PDO::FETCH_ASSOC);

    $parentId = null;

    // Use provided password or default
    $defaultPassword = $parentPassword ?: 'Welcome123';
    $isNewParent = false;

    if (!$parent) {
        // Create new parent account with provided or default password
        $hashedPassword = password_hash($defaultPassword, PASSWORD_DEFAULT);
        $insertParentQuery = "INSERT INTO parents (email, name, phone, password)
                              VALUES (?, ?, ?, ?)";
        $insertParentStmt = $db->prepare($insertParentQuery);
        $insertParentStmt->execute([$parentEmail, $parentName, $parentPhone, $hashedPassword]);
        $parentId = $db->lastInsertId();
        $isNewParent = true;
    } else {
        // Parent exists, use existing ID
        $parentId = $parent['id'];
    }

    // Check if relationship already exists BEFORE updating parent info
    $checkRelationQuery = "SELECT id FROM parent_students
                           WHERE parent_id = ? AND student_id = ?";
    $checkRelationStmt = $db->prepare($checkRelationQuery);
    $checkRelationStmt->execute([$parentId, $studentId]);

    if ($checkRelationStmt->fetch()) {
        $db->rollBack();
        http_response_code(409);
        echo json_encode(['success' => false, 'message' => 'This parent is already linked to this student']);
        exit;
    }

    // Update parent name and phone if parent already exists and not a new parent
    if (!$isNewParent) {
        $updateParentQuery = "UPDATE parents
                              SET name = ?, phone = COALESCE(?, phone)
                              WHERE id = ?";
        $updateParentStmt = $db->prepare($updateParentQuery);
        $updateParentStmt->execute([$parentName, $parentPhone, $parentId]);
    }

    // If this is primary, unset other primary relationships for this student
    if ($isPrimary) {
        $unsetPrimaryQuery = "UPDATE parent_students
                              SET is_primary = FALSE
                              WHERE student_id = ?";
        $unsetPrimaryStmt = $db->prepare($unsetPrimaryQuery);
        $unsetPrimaryStmt->execute([$studentId]);
    }

    // Create parent-student relationship
    $insertRelationQuery = "INSERT INTO parent_students
                            (parent_id, student_id, relationship, is_primary, added_by_school_id)
                            VALUES (?, ?, ?, ?, ?)";
    $insertRelationStmt = $db->prepare($insertRelationQuery);
    $insertRelationStmt->execute([$parentId, $studentId, $relationship, $isPrimary, $_SESSION['school_id']]);

    // Update student's parent_email field (denormalized for quick lookup)
    if ($isPrimary) {
        $updateStudentQuery = "UPDATE students SET parent_email = ? WHERE id = ?";
        $updateStudentStmt = $db->prepare($updateStudentQuery);
        $updateStudentStmt->execute([$parentEmail, $studentId]);
    }

    // Commit transaction
    $db->commit();

    http_response_code(201);
    echo json_encode([
        'success' => true,
        'message' => 'Parent linked to student successfully',
        'data' => [
            'parent_id' => (int)$parentId,
            'student_id' => (int)$studentId,
            'student_name' => $student['name'],
            'parent_email' => $parentEmail,
            'relationship' => $relationship,
            'is_primary' => $isPrimary,
            'is_new_parent' => $isNewParent,
            'default_password' => $isNewParent ? $defaultPassword : null
        ]
    ]);

} catch (PDOException $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }

    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error occurred',
        'error' => $e->getMessage()
    ]);
}
?>
