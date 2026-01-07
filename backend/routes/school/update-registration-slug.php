<?php
/**
 * Update School Registration Slug
 * Allows schools to customize their public registration link
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
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

require_once __DIR__ . '/../../config/database.php';

try {
    $schoolId = $_SESSION['school_id'];
    $input = json_decode(file_get_contents('php://input'), true);

    if (!isset($input['slug']) || empty(trim($input['slug']))) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Slug is required']);
        exit;
    }

    $slug = trim($input['slug']);

    // Validate slug format (alphanumeric, hyphens, underscores only)
    if (!preg_match('/^[a-z0-9\-_]+$/i', $slug)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Slug can only contain letters, numbers, hyphens, and underscores'
        ]);
        exit;
    }

    // Minimum length
    if (strlen($slug) < 3) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Slug must be at least 3 characters long']);
        exit;
    }

    // Maximum length
    if (strlen($slug) > 100) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Slug must not exceed 100 characters']);
        exit;
    }

    $database = new Database();
    $db = $database->getConnection();

    // Check if slug is already taken by another school
    $checkQuery = "SELECT id FROM schools WHERE registration_slug = ? AND id != ?";
    $checkStmt = $db->prepare($checkQuery);
    $checkStmt->execute([$slug, $schoolId]);

    if ($checkStmt->rowCount() > 0) {
        http_response_code(409);
        echo json_encode([
            'success' => false,
            'message' => 'This slug is already taken. Please choose a different one.'
        ]);
        exit;
    }

    // Update the slug
    $updateQuery = "UPDATE schools SET registration_slug = ? WHERE id = ?";
    $updateStmt = $db->prepare($updateQuery);
    $updateStmt->execute([$slug, $schoolId]);

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Registration link updated successfully',
        'data' => [
            'slug' => $slug
        ]
    ]);

} catch (PDOException $e) {
    error_log("Update registration slug error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to update registration link'
    ]);
}
