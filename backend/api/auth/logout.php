<?php
/**
 * School Logout API Endpoint
 */

require_once '../../config/cors.php';

session_start();

// Destroy session
session_unset();
session_destroy();

http_response_code(200);
echo json_encode([
    'success' => true,
    'message' => 'Logout successful'
]);
?>
