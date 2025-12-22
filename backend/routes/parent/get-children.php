<?php
/**
 * Get All Children for Logged-in Parent
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../../config/database.php';

// Start session
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Check authentication
if (!isset($_SESSION['parent_id']) || $_SESSION['user_type'] !== 'parent') {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();

    $query = "SELECT
                s.id,
                s.name,
                s.class,
                s.session,
                s.term,
                s.admission_no,
                s.gender,
                s.photo,
                s.height,
                s.weight,
                sc.id as school_id,
                sc.school_name,
                sc.address as school_address,
                sc.phone as school_phone,
                sc.email as school_email,
                sc.logo as school_logo,
                ps.relationship,
                ps.is_primary
              FROM parent_students ps
              INNER JOIN students s ON ps.student_id = s.id
              INNER JOIN schools sc ON s.school_id = sc.id
              WHERE ps.parent_id = ?
              ORDER BY ps.is_primary DESC, s.name ASC";

    $stmt = $db->prepare($query);
    $stmt->execute([$_SESSION['parent_id']]);
    $children = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Format response
    $formattedChildren = array_map(function($child) {
        return [
            'id' => (int)$child['id'],
            'name' => $child['name'],
            'class' => $child['class'],
            'session' => $child['session'],
            'term' => $child['term'],
            'admission_no' => $child['admission_no'],
            'gender' => $child['gender'],
            'photo' => $child['photo'],
            'height' => $child['height'],
            'weight' => $child['weight'],
            'relationship' => $child['relationship'],
            'is_primary' => (bool)$child['is_primary'],
            'school' => [
                'id' => (int)$child['school_id'],
                'name' => $child['school_name'],
                'address' => $child['school_address'],
                'phone' => $child['school_phone'],
                'email' => $child['school_email'],
                'logo' => $child['school_logo']
            ]
        ];
    }, $children);

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'data' => $formattedChildren,
        'count' => count($formattedChildren)
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error occurred',
        'error' => $e->getMessage()
    ]);
}
?>
