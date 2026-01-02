<?php
/**
 * Get all parents registered in the school
 * For school admin use - to see all available parents
 */

// Check authentication - must be school admin
if (!isset($_SESSION['school_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized - School login required']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$schoolId = $_SESSION['school_id'];

$database = new Database();
$db = $database->getConnection();

try {
    // Get all parents in the system
    // Show all parents regardless of whether they're linked to students yet
    $query = "SELECT
                p.id,
                p.email,
                p.name as full_name,
                p.phone,
                p.is_active,
                p.created_at,
                COALESCE(
                    (SELECT COUNT(DISTINCT ps2.student_id)
                     FROM parent_students ps2
                     INNER JOIN students s2 ON ps2.student_id = s2.id
                     WHERE ps2.parent_id = p.id AND s2.school_id = ?),
                    0
                ) as children_count
              FROM parents p
              ORDER BY p.name ASC";

    $stmt = $db->prepare($query);
    $stmt->execute([$schoolId]);
    $parents = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'parents' => $parents,
        'count' => count($parents)
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
