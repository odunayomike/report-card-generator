<?php
/**
 * Get All Classes for School
 * Returns unique class/session/term combinations from students
 */

// Check if school admin is authenticated
if (!isset($_SESSION['user_type']) || $_SESSION['user_type'] !== 'school' || !isset($_SESSION['school_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized - School admin access required']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$database = new Database();
$db = $database->getConnection();

try {
    // Get unique class/session/term combinations from students
    $query = "SELECT DISTINCT
                s.class as class_name,
                s.session,
                s.term,
                COUNT(s.id) as student_count
              FROM students s
              WHERE s.school_id = ?
                AND s.class IS NOT NULL
                AND s.class != ''
                AND s.session IS NOT NULL
                AND s.session != ''
                AND s.term IS NOT NULL
                AND s.term != ''
              GROUP BY s.class, s.session, s.term
              ORDER BY s.session DESC, s.term ASC, s.class ASC";

    $stmt = $db->prepare($query);
    $stmt->execute([$_SESSION['school_id']]);
    $classes = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Add IDs to classes
    foreach ($classes as $index => &$class) {
        $class['id'] = "{$class['class_name']}-{$class['session']}-{$class['term']}";
    }

    echo json_encode([
        'success' => true,
        'classes' => $classes,
        'total' => count($classes)
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>
