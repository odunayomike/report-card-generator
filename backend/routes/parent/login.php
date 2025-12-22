<?php
/**
 * Parent Login API (Email-only authentication)
 * For mobile application use
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
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

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Get JSON input
$json = file_get_contents('php://input');
$data = json_decode($json, true);

// Validate input
if (!isset($data['email']) || empty(trim($data['email']))) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Email is required']);
    exit;
}

$email = trim(strtolower($data['email']));

// Validate email format
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid email format']);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();

    // Check if parent exists
    $query = "SELECT p.*,
              COUNT(DISTINCT ps.student_id) as children_count
              FROM parents p
              LEFT JOIN parent_students ps ON p.id = ps.parent_id
              WHERE p.email = ? AND p.is_active = TRUE
              GROUP BY p.id";

    $stmt = $db->prepare($query);
    $stmt->execute([$email]);
    $parent = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$parent) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'No account found with this email address. Please contact your child\'s school to register.'
        ]);
        exit;
    }

    // Get list of children for this parent
    $childrenQuery = "SELECT
                        s.id,
                        s.name,
                        s.class,
                        s.admission_no,
                        s.gender,
                        s.photo,
                        sc.school_name,
                        sc.id as school_id,
                        ps.relationship,
                        ps.is_primary
                      FROM parent_students ps
                      INNER JOIN students s ON ps.student_id = s.id
                      INNER JOIN schools sc ON s.school_id = sc.id
                      WHERE ps.parent_id = ?
                      ORDER BY ps.is_primary DESC, s.name ASC";

    $childrenStmt = $db->prepare($childrenQuery);
    $childrenStmt->execute([$parent['id']]);
    $children = $childrenStmt->fetchAll(PDO::FETCH_ASSOC);

    // Store parent session
    $_SESSION['parent_id'] = $parent['id'];
    $_SESSION['parent_email'] = $parent['email'];
    $_SESSION['parent_name'] = $parent['name'];
    $_SESSION['user_type'] = 'parent';

    // Prepare response (exclude sensitive data)
    $response = [
        'success' => true,
        'message' => 'Login successful',
        'data' => [
            'parent' => [
                'id' => (int)$parent['id'],
                'name' => $parent['name'],
                'email' => $parent['email'],
                'phone' => $parent['phone'],
                'children_count' => (int)$parent['children_count']
            ],
            'children' => array_map(function($child) {
                return [
                    'id' => (int)$child['id'],
                    'name' => $child['name'],
                    'class' => $child['class'],
                    'admission_no' => $child['admission_no'],
                    'gender' => $child['gender'],
                    'photo' => $child['photo'],
                    'school_name' => $child['school_name'],
                    'school_id' => (int)$child['school_id'],
                    'relationship' => $child['relationship'],
                    'is_primary' => (bool)$child['is_primary']
                ];
            }, $children),
            'session_token' => session_id()
        ]
    ];

    http_response_code(200);
    echo json_encode($response);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error occurred',
        'error' => $e->getMessage()
    ]);
}
?>
