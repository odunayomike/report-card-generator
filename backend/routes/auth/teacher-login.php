<?php
/**
 * Teacher Login Route
 * Handles teacher authentication
 */

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

$email = $input['email'] ?? '';
$password = $input['password'] ?? '';

// Validate input
if (empty($email) || empty($password)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Email and password are required']);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();

    // Get teacher by email
    $query = "SELECT t.*, s.school_name
              FROM teachers t
              INNER JOIN schools s ON t.school_id = s.id
              WHERE t.email = ? AND t.is_active = TRUE";

    $stmt = $db->prepare($query);
    $stmt->execute([$email]);
    $teacher = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$teacher) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Invalid email or password']);
        exit;
    }

    // Verify password
    if (!password_verify($password, $teacher['password'])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Invalid email or password']);
        exit;
    }

    // Set session variables
    $_SESSION['user_type'] = 'teacher';
    $_SESSION['teacher_id'] = $teacher['id'];
    $_SESSION['school_id'] = $teacher['school_id'];
    $_SESSION['name'] = $teacher['name'];
    $_SESSION['email'] = $teacher['email'];
    $_SESSION['school_name'] = $teacher['school_name'];

    // Return success
    echo json_encode([
        'success' => true,
        'message' => 'Login successful',
        'user' => [
            'id' => $teacher['id'],
            'name' => $teacher['name'],
            'email' => $teacher['email'],
            'school_id' => $teacher['school_id'],
            'school_name' => $teacher['school_name'],
            'user_type' => 'teacher'
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>
