<?php
/**
 * Convert External Student to Regular Student
 * Converts a prospective external student to a regular enrolled student
 */

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Check if school admin is authenticated
if (!isset($_SESSION['user_type']) || $_SESSION['user_type'] !== 'school' || !isset($_SESSION['school_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized. School admin access required.']);
    exit;
}

require_once __DIR__ . '/../../config/database.php';

try {
    $schoolId = $_SESSION['school_id'];
    $input = json_decode(file_get_contents('php://input'), true);

    // Validate input
    if (!isset($input['external_student_id']) || !isset($input['admission_no'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'external_student_id and admission_no are required'
        ]);
        exit;
    }

    $externalStudentId = intval($input['external_student_id']);
    $admissionNo = trim($input['admission_no']);
    $currentClass = isset($input['current_class']) ? trim($input['current_class']) : null;
    $session = isset($input['session']) ? trim($input['session']) : date('Y') . '/' . (date('Y') + 1);
    $term = isset($input['term']) ? trim($input['term']) : 'First Term';

    $database = new Database();
    $db = $database->getConnection();

    // Get external student data
    $externalQuery = "SELECT * FROM external_students WHERE id = ? AND school_id = ?";
    $externalStmt = $db->prepare($externalQuery);
    $externalStmt->execute([$externalStudentId, $schoolId]);
    $externalStudent = $externalStmt->fetch(PDO::FETCH_ASSOC);

    if (!$externalStudent) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'External student not found or does not belong to your school'
        ]);
        exit;
    }

    // Check if already converted
    if ($externalStudent['status'] === 'converted') {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'This external student has already been converted',
            'student_id' => $externalStudent['converted_to_student_id']
        ]);
        exit;
    }

    // Check if admission number already exists
    $admissionCheckQuery = "SELECT id FROM students WHERE admission_no = ? AND school_id = ?";
    $admissionCheckStmt = $db->prepare($admissionCheckQuery);
    $admissionCheckStmt->execute([$admissionNo, $schoolId]);

    if ($admissionCheckStmt->fetch()) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Admission number already exists for another student'
        ]);
        exit;
    }

    // Use applying_for_class if current_class not provided
    if (!$currentClass) {
        $currentClass = $externalStudent['applying_for_class'];
    }

    // Begin transaction
    $db->beginTransaction();

    // Create regular student record
    $insertStudentQuery = "INSERT INTO students (
                              school_id, name, admission_no, current_class, session, term,
                              gender, email, phone, date_of_birth, address, previous_school,
                              created_at, updated_at
                           ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())";

    $insertStmt = $db->prepare($insertStudentQuery);
    $insertStmt->execute([
        $schoolId,
        $externalStudent['name'],
        $admissionNo,
        $currentClass,
        $session,
        $term,
        $externalStudent['gender'],
        $externalStudent['email'],
        $externalStudent['phone'],
        $externalStudent['date_of_birth'],
        $externalStudent['address'],
        $externalStudent['previous_school']
    ]);

    $newStudentId = $db->lastInsertId();

    // Create parent record if parent information exists
    if ($externalStudent['parent_name']) {
        // Check if parent already exists with this phone
        $parentCheckQuery = "SELECT id FROM parents WHERE phone = ? AND school_id = ?";
        $parentCheckStmt = $db->prepare($parentCheckQuery);
        $parentCheckStmt->execute([$externalStudent['parent_phone'], $schoolId]);
        $existingParent = $parentCheckStmt->fetch(PDO::FETCH_ASSOC);

        if ($existingParent) {
            $parentId = $existingParent['id'];
        } else {
            // Create new parent
            $insertParentQuery = "INSERT INTO parents (
                                     school_id, name, email, phone, relationship, is_active,
                                     created_at, updated_at
                                  ) VALUES (?, ?, ?, ?, ?, TRUE, NOW(), NOW())";
            $insertParentStmt = $db->prepare($insertParentQuery);
            $insertParentStmt->execute([
                $schoolId,
                $externalStudent['parent_name'],
                $externalStudent['parent_email'],
                $externalStudent['parent_phone'],
                $externalStudent['parent_relationship']
            ]);
            $parentId = $db->lastInsertId();

            // Generate default password for parent (same as external student)
            $defaultPassword = 'PAR' . substr($externalStudent['parent_phone'], -4);
            $passwordHash = password_hash($defaultPassword, PASSWORD_DEFAULT);

            $updateParentPwdQuery = "UPDATE parents SET password = ? WHERE id = ?";
            $updateParentPwdStmt = $db->prepare($updateParentPwdQuery);
            $updateParentPwdStmt->execute([$passwordHash, $parentId]);
        }

        // Link parent to student
        $linkParentQuery = "INSERT INTO parent_students (
                               parent_id, student_id, relationship, is_primary
                            ) VALUES (?, ?, ?, TRUE)";
        $linkParentStmt = $db->prepare($linkParentQuery);
        $linkParentStmt->execute([
            $parentId,
            $newStudentId,
            $externalStudent['parent_relationship']
        ]);
    }

    // Update external student record
    $updateExternalQuery = "UPDATE external_students
                            SET status = 'converted',
                                converted_to_student_id = ?
                            WHERE id = ?";
    $updateExternalStmt = $db->prepare($updateExternalQuery);
    $updateExternalStmt->execute([$newStudentId, $externalStudentId]);

    // Log activity
    $logQuery = "INSERT INTO external_student_activity_log
                 (external_student_id, school_id, activity_type, details, ip_address)
                 VALUES (?, ?, 'converted', ?, ?)";
    $logStmt = $db->prepare($logQuery);
    $logStmt->execute([
        $externalStudentId,
        $schoolId,
        "Converted to regular student with admission number: $admissionNo",
        $_SERVER['REMOTE_ADDR'] ?? null
    ]);

    // Commit transaction
    $db->commit();

    http_response_code(201);
    echo json_encode([
        'success' => true,
        'message' => 'External student successfully converted to regular student',
        'data' => [
            'student_id' => $newStudentId,
            'admission_no' => $admissionNo,
            'name' => $externalStudent['name'],
            'class' => $currentClass,
            'session' => $session,
            'term' => $term,
            'parent_created' => isset($parentId)
        ]
    ]);

} catch (PDOException $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}
?>
