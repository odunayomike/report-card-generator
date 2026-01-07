<?php
/**
 * Get Public School Information
 * Returns basic school info for public registration page
 * No authentication required
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

require_once __DIR__ . '/../../config/database.php';

try {
    // Get school_id or slug from query parameters
    $schoolId = isset($_GET['school_id']) ? intval($_GET['school_id']) : null;
    $schoolSlug = isset($_GET['slug']) ? trim($_GET['slug']) : null;

    if (!$schoolId && !$schoolSlug) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'School ID or slug is required'
        ]);
        exit;
    }

    $database = new Database();
    $db = $database->getConnection();

    // Fetch school info based on slug or ID
    if ($schoolSlug) {
        $query = "SELECT id, school_name, logo, address, phone, email, registration_slug
                  FROM schools
                  WHERE registration_slug = ?";
        $stmt = $db->prepare($query);
        $stmt->execute([$schoolSlug]);
    } else {
        $query = "SELECT id, school_name, logo, address, phone, email, registration_slug
                  FROM schools
                  WHERE id = ?";
        $stmt = $db->prepare($query);
        $stmt->execute([$schoolId]);
    }

    $school = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$school) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'School not found'
        ]);
        exit;
    }

    // Return only public information
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'data' => [
            'id' => (int)$school['id'],
            'name' => $school['school_name'],
            'logo' => $school['logo'],
            'address' => $school['address'],
            'phone' => $school['phone'],
            'email' => $school['email'],
            'slug' => $school['registration_slug']
        ]
    ]);

} catch (PDOException $e) {
    error_log("Get public school info error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to fetch school information'
    ]);
}
