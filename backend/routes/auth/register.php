<?php
/**
 * Register Route Handler
 */

$database = new Database();
$db = $database->getConnection();

// Get posted data
$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid data provided']);
    exit();
}

// Validate required fields
$required_fields = ['school_name', 'email', 'password'];
foreach ($required_fields as $field) {
    if (!isset($data[$field]) || empty(trim($data[$field]))) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => ucfirst(str_replace('_', ' ', $field)) . ' is required']);
        exit();
    }
}

// Validate email format
if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid email format']);
    exit();
}

// Validate password strength
if (strlen($data['password']) < 6) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Password must be at least 6 characters long']);
    exit();
}

try {
    // Check if email already exists
    $query = "SELECT id FROM schools WHERE email = :email";
    $stmt = $db->prepare($query);
    $stmt->execute([':email' => $data['email']]);

    if ($stmt->fetch()) {
        http_response_code(409);
        echo json_encode(['success' => false, 'message' => 'Email already registered']);
        exit();
    }

    // Hash password
    $hashed_password = password_hash($data['password'], PASSWORD_DEFAULT);

    // Insert school
    $query = "INSERT INTO schools (school_name, email, password, phone, address, logo)
              VALUES (:school_name, :email, :password, :phone, :address, :logo)";

    $stmt = $db->prepare($query);
    $stmt->execute([
        ':school_name' => trim($data['school_name']),
        ':email' => trim($data['email']),
        ':password' => $hashed_password,
        ':phone' => $data['phone'] ?? null,
        ':address' => $data['address'] ?? null,
        ':logo' => $data['logo'] ?? null
    ]);

    $school_id = $db->lastInsertId();

    // Start session and set school data
    session_start();
    $_SESSION['school_id'] = $school_id;
    $_SESSION['school_name'] = $data['school_name'];
    $_SESSION['email'] = $data['email'];

    http_response_code(201);
    echo json_encode([
        'success' => true,
        'message' => 'School registered successfully',
        'school' => [
            'id' => $school_id,
            'school_name' => $data['school_name'],
            'email' => $data['email']
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error registering school: ' . $e->getMessage()
    ]);
}
?>
