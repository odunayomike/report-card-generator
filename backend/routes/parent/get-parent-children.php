<?php
/**
 * Get all children/students linked to a specific parent
 * For school admin use
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

if (!isset($_GET['parent_id'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Parent ID is required']);
    exit;
}

$parentId = intval($_GET['parent_id']);
$schoolId = $_SESSION['school_id'];

$database = new Database();
$db = $database->getConnection();

try {
    // First verify that the parent exists
    $verifyQuery = "SELECT id, name, email FROM parents WHERE id = ?";
    $verifyStmt = $db->prepare($verifyQuery);
    $verifyStmt->execute([$parentId]);
    $parent = $verifyStmt->fetch(PDO::FETCH_ASSOC);

    if (!$parent) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Parent not found']);
        exit;
    }

    // Get all children/students linked to this parent (only from this school)
    $query = "SELECT
                s.id,
                s.admission_no,
                s.name,
                s.current_class as class,
                s.gender,
                s.guardian_email,
                ps.relationship,
                ps.is_primary,
                ps.created_at as linked_at
              FROM parent_students ps
              INNER JOIN students s ON ps.student_id = s.id
              WHERE ps.parent_id = ? AND s.school_id = ?
              ORDER BY ps.is_primary DESC, s.name ASC";

    $stmt = $db->prepare($query);
    $stmt->execute([$parentId, $schoolId]);
    $children = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'parent' => [
            'id' => $parent['id'],
            'name' => $parent['name'],
            'email' => $parent['email']
        ],
        'children' => $children,
        'count' => count($children)
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
