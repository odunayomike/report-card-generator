<?php
/**
 * Complete Onboarding Route
 * Marks the school's onboarding as completed
 */

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Check if user is authenticated as a school
if (!isset($_SESSION['user_type']) || $_SESSION['user_type'] !== 'school' || !isset($_SESSION['school_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$database = new Database();
$db = $database->getConnection();

try {
    $schoolId = $_SESSION['school_id'];

    // Update onboarding_completed status
    $query = "UPDATE schools
              SET onboarding_completed = TRUE,
                  onboarding_completed_at = NOW()
              WHERE id = ?";

    $stmt = $db->prepare($query);
    $stmt->execute([$schoolId]);

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Onboarding completed successfully'
    ]);

} catch (PDOException $e) {
    error_log("Complete onboarding error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to complete onboarding'
    ]);
}
