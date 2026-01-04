<?php
/**
 * Get Default Subject List for a Class
 * Returns the predefined subject list that can be used as a template
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

$className = $_GET['class_name'] ?? '';

if (empty($className)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Class name is required']);
    exit;
}

try {
    // Load default subjects configuration
    $defaultSubjects = require __DIR__ . '/../../config/default-subjects.php';

    // Get subjects for the requested class
    $subjects = $defaultSubjects[$className] ?? [];

    if (empty($subjects)) {
        // Return empty array for classes without predefined subjects
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'data' => [
                'class_name' => $className,
                'subjects' => [],
                'message' => 'No default subjects defined for this class. You can add custom subjects.'
            ]
        ]);
        exit;
    }

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'data' => [
            'class_name' => $className,
            'subjects' => $subjects,
            'total' => count($subjects)
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred',
        'error' => $e->getMessage()
    ]);
}
