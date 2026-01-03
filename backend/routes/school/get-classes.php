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
    // Get unique class/session/term combinations from report_cards
    $query = "SELECT DISTINCT
                rc.class as class_name,
                rc.session,
                rc.term,
                COUNT(DISTINCT rc.student_admission_no) as student_count
              FROM report_cards rc
              WHERE rc.school_id = ?
                AND rc.class IS NOT NULL
                AND rc.class != ''
                AND rc.session IS NOT NULL
                AND rc.session != ''
                AND rc.term IS NOT NULL
                AND rc.term != ''
              GROUP BY rc.class, rc.session, rc.term
              ORDER BY rc.session DESC, rc.term ASC, rc.class ASC";

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
