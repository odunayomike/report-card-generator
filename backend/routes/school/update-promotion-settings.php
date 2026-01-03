<?php
/**
 * Update Promotion Settings
 * Allows schools to configure promotion threshold and enable/disable auto-promotion
 */

if (!isset($_SESSION['user_type']) || $_SESSION['user_type'] !== 'school' || !isset($_SESSION['school_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized - School admin access required']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST' && $_SERVER['REQUEST_METHOD'] !== 'PUT') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid data provided']);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();

    $updateFields = [];
    $updateValues = [];

    // Validate and add promotion threshold
    if (isset($data['promotion_threshold'])) {
        $threshold = floatval($data['promotion_threshold']);
        if ($threshold < 0 || $threshold > 100) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Promotion threshold must be between 0 and 100']);
            exit;
        }
        $updateFields[] = "promotion_threshold = ?";
        $updateValues[] = $threshold;
    }

    // Validate and add auto-promotion enabled
    if (isset($data['auto_promotion_enabled'])) {
        $updateFields[] = "auto_promotion_enabled = ?";
        $updateValues[] = $data['auto_promotion_enabled'] ? 1 : 0;
    }

    if (empty($updateFields)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'No fields to update']);
        exit;
    }

    // Add school ID for WHERE clause
    $updateValues[] = $_SESSION['school_id'];

    $query = "UPDATE schools SET " . implode(', ', $updateFields) . " WHERE id = ?";
    $stmt = $db->prepare($query);
    $success = $stmt->execute($updateValues);

    if ($success) {
        // Fetch updated settings
        $fetchQuery = "SELECT promotion_threshold, auto_promotion_enabled FROM schools WHERE id = ?";
        $fetchStmt = $db->prepare($fetchQuery);
        $fetchStmt->execute([$_SESSION['school_id']]);
        $updatedSettings = $fetchStmt->fetch(PDO::FETCH_ASSOC);

        echo json_encode([
            'success' => true,
            'message' => 'Promotion settings updated successfully',
            'settings' => [
                'promotion_threshold' => floatval($updatedSettings['promotion_threshold']),
                'auto_promotion_enabled' => (bool)$updatedSettings['auto_promotion_enabled']
            ]
        ]);
    } else {
        throw new Exception('Failed to update promotion settings');
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
