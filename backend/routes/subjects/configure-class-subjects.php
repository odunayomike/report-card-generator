<?php
/**
 * Configure Subjects for a Class
 * Allows schools to set up or modify the subject list for a specific class
 */

// Check authentication - only school admins
if (!isset($_SESSION['school_id']) || $_SESSION['user_type'] !== 'school') {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized - School access required']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$className = $input['class_name'] ?? '';
$subjects = $input['subjects'] ?? [];

if (empty($className)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Class name is required']);
    exit;
}

if (!is_array($subjects) || empty($subjects)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Subjects array is required and cannot be empty']);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();

    $schoolId = $_SESSION['school_id'];

    // Start transaction
    $db->beginTransaction();

    // Delete existing subjects for this class
    $deleteQuery = "DELETE FROM class_subjects WHERE school_id = ? AND class_name = ?";
    $deleteStmt = $db->prepare($deleteQuery);
    $deleteStmt->execute([$schoolId, $className]);

    // Insert new subjects
    $insertQuery = "INSERT INTO class_subjects (school_id, class_name, subject_name, is_core)
                    VALUES (?, ?, ?, ?)";
    $insertStmt = $db->prepare($insertQuery);

    $addedCount = 0;
    $subjectNames = [];

    foreach ($subjects as $subject) {
        // Handle both object and string formats
        if (is_array($subject)) {
            $subjectName = $subject['name'] ?? ($subject['subject_name'] ?? '');
            // Convert to integer: true/1 -> 1, false/0 -> 0
            $isCore = isset($subject['is_core']) ? (int)(bool)$subject['is_core'] : 1;
        } else {
            $subjectName = $subject;
            $isCore = 1;
        }

        $subjectName = trim($subjectName);

        if (!empty($subjectName)) {
            $insertStmt->execute([$schoolId, $className, $subjectName, $isCore]);
            $addedCount++;
            $subjectNames[] = $subjectName;
        }
    }

    // Commit transaction
    $db->commit();

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => "Successfully configured {$addedCount} subject(s) for {$className}",
        'data' => [
            'class_name' => $className,
            'subjects_count' => $addedCount,
            'subjects' => $subjectNames
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
} catch (Exception $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred',
        'error' => $e->getMessage()
    ]);
}
