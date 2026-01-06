<?php
/**
 * Get Configured Subjects for a Class
 * Returns the actual subjects configured by the school for this class
 */

// Check authentication
if (!isset($_SESSION['school_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$className = trim($_GET['class_name'] ?? '');

if (empty($className)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Class name is required']);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();

    $schoolId = $_SESSION['school_id'];

    // Get configured subjects for this class
    $query = "SELECT id, subject_name, is_core, created_at, updated_at
              FROM class_subjects
              WHERE school_id = ? AND class_name = ?
              ORDER BY is_core DESC, subject_name ASC";

    $stmt = $db->prepare($query);
    $stmt->execute([$schoolId, $className]);
    $subjects = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // If no configured subjects exist, return default subjects
    if (empty($subjects)) {
        // Load default subjects configuration
        $defaultSubjectsConfig = require __DIR__ . '/../../config/default-subjects.php';
        $defaultSubjects = $defaultSubjectsConfig[$className] ?? [];

        http_response_code(200);
        echo json_encode([
            'success' => true,
            'data' => [
                'class_name' => $className,
                'subjects' => $defaultSubjects,
                'total' => count($defaultSubjects),
                'is_default' => true
            ]
        ]);
        exit;
    }

    // Format response for configured subjects
    $formattedSubjects = array_map(function($subject) {
        return [
            'id' => (int)$subject['id'],
            'name' => $subject['subject_name'],
            'is_core' => (bool)$subject['is_core'],
            'created_at' => $subject['created_at'],
            'updated_at' => $subject['updated_at']
        ];
    }, $subjects);

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'data' => [
            'class_name' => $className,
            'subjects' => $formattedSubjects,
            'total' => count($formattedSubjects),
            'is_default' => false
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error occurred',
        'error' => $e->getMessage()
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred',
        'error' => $e->getMessage()
    ]);
}
