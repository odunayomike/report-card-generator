<?php
/**
 * Get Promotion Settings
 * Returns school's promotion configuration
 */

if (!isset($_SESSION['user_type']) || $_SESSION['user_type'] !== 'school' || !isset($_SESSION['school_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized - School admin access required']);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();

    // Get school's promotion settings
    $query = "SELECT promotion_threshold, auto_promotion_enabled FROM schools WHERE id = ?";
    $stmt = $db->prepare($query);
    $stmt->execute([$_SESSION['school_id']]);
    $settings = $stmt->fetch(PDO::FETCH_ASSOC);

    // Get class hierarchy
    $classQuery = "SELECT * FROM class_hierarchy ORDER BY class_level ASC";
    $classStmt = $db->query($classQuery);
    $classHierarchy = $classStmt->fetchAll(PDO::FETCH_ASSOC);

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'settings' => [
            'promotion_threshold' => floatval($settings['promotion_threshold']),
            'auto_promotion_enabled' => (bool)$settings['auto_promotion_enabled']
        ],
        'class_hierarchy' => $classHierarchy
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
