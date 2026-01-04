<?php
/**
 * Update School Current Session and Term
 * Allows schools to update their current academic session/term
 */

// Check authentication
if (!isset($_SESSION['user_type']) || $_SESSION['user_type'] !== 'school' || !isset($_SESSION['school_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized - School access required']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

$currentSession = trim($input['current_session'] ?? '');
$currentTerm = trim($input['current_term'] ?? '');

// Validate input
if (empty($currentSession)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Current session is required']);
    exit;
}

if (empty($currentTerm)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Current term is required']);
    exit;
}

// Validate term format
$validTerms = ['First Term', 'Second Term', 'Third Term'];
if (!in_array($currentTerm, $validTerms)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid term. Must be First Term, Second Term, or Third Term']);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();

    $query = "UPDATE schools
              SET current_session = ?,
                  current_term = ?
              WHERE id = ?";

    $stmt = $db->prepare($query);
    $success = $stmt->execute([
        $currentSession,
        $currentTerm,
        $_SESSION['school_id']
    ]);

    if ($success) {
        echo json_encode([
            'success' => true,
            'message' => 'Current session and term updated successfully',
            'data' => [
                'current_session' => $currentSession,
                'current_term' => $currentTerm
            ]
        ]);
    } else {
        throw new Exception('Failed to update session');
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
