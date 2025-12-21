<?php
/**
 * Super Admin Session Check Route
 * Session is already started in index.php
 */

if (!isset($_SESSION['user_type']) || $_SESSION['user_type'] !== 'super_admin') {
    http_response_code(401);
    echo json_encode(['authenticated' => false]);
    exit;
}

$database = new Database();
$db = $database->getConnection();

try {

    // Verify super admin still exists and is active
    $stmt = $db->prepare("
        SELECT id, name, email, phone, is_active
        FROM super_admins
        WHERE id = :id
    ");
    $stmt->bindParam(':id', $_SESSION['super_admin_id']);
    $stmt->execute();

    $superAdmin = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$superAdmin || !$superAdmin['is_active']) {
        session_destroy();
        http_response_code(401);
        echo json_encode(['authenticated' => false, 'message' => 'Account no longer active']);
        exit;
    }

    http_response_code(200);
    echo json_encode([
        'authenticated' => true,
        'user' => [
            'id' => $superAdmin['id'],
            'name' => $superAdmin['name'],
            'email' => $superAdmin['email'],
            'phone' => $superAdmin['phone'],
            'user_type' => 'super_admin'
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
