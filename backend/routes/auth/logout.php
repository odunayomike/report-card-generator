<?php
/**
 * Logout Route Handler
 */

session_destroy();

http_response_code(200);
echo json_encode([
    'success' => true,
    'message' => 'Logged out successfully'
]);
