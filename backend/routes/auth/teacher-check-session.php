<?php
/**
 * Teacher Check Session Route
 * Validates teacher session
 */

// Check if teacher is logged in
if (!isset($_SESSION['user_type']) || $_SESSION['user_type'] !== 'teacher' || !isset($_SESSION['teacher_id'])) {
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'authenticated' => false
    ]);
    exit;
}

// Return session data
echo json_encode([
    'success' => true,
    'authenticated' => true,
    'user' => [
        'id' => $_SESSION['teacher_id'],
        'name' => $_SESSION['name'],
        'email' => $_SESSION['email'],
        'school_id' => $_SESSION['school_id'],
        'school_name' => $_SESSION['school_name'] ?? '',
        'user_type' => 'teacher'
    ]
]);
?>
