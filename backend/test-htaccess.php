<?php
/**
 * Test file to check if .htaccess rewriting is working
 * Access this via: https://schoolhub.tech/backend/htaccess-test
 * If you see this JSON response, .htaccess is working!
 */

header('Content-Type: application/json');
echo json_encode([
    'success' => true,
    'message' => '.htaccess rewrite is working!',
    'request_uri' => $_SERVER['REQUEST_URI'],
    'script_name' => $_SERVER['SCRIPT_NAME'],
    'php_self' => $_SERVER['PHP_SELF']
]);
