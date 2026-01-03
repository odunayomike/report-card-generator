<?php
/**
 * Get Promotion History
 * Returns promotion history for all students or a specific student
 */

if (!isset($_SESSION['user_type']) || !isset($_SESSION['school_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();

    $admissionNo = isset($_GET['admission_no']) ? trim($_GET['admission_no']) : null;

    if ($admissionNo) {
        // Get promotion history for specific student
        $query = "SELECT sp.*,  s.name as student_name
                 FROM student_promotions sp
                 INNER JOIN students s ON sp.student_id = s.id
                 WHERE sp.school_id = ? AND sp.student_admission_no = ?
                 ORDER BY sp.promoted_at DESC";
        $stmt = $db->prepare($query);
        $stmt->execute([$_SESSION['school_id'], $admissionNo]);
    } else {
        // Get recent promotion history for all students
        $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 50;
        $query = "SELECT sp.*, s.name as student_name
                 FROM student_promotions sp
                 INNER JOIN students s ON sp.student_id = s.id
                 WHERE sp.school_id = ?
                 ORDER BY sp.promoted_at DESC
                 LIMIT " . $limit;
        $stmt = $db->prepare($query);
        $stmt->execute([$_SESSION['school_id']]);
    }

    $promotions = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Get summary statistics
    $statsQuery = "SELECT
                      COUNT(*) as total_promotions,
                      SUM(CASE WHEN promotion_status = 'promoted' THEN 1 ELSE 0 END) as promoted_count,
                      SUM(CASE WHEN promotion_status = 'retained' THEN 1 ELSE 0 END) as retained_count,
                      SUM(CASE WHEN promotion_status = 'completed' THEN 1 ELSE 0 END) as completed_count
                   FROM student_promotions
                   WHERE school_id = ?";
    $statsStmt = $db->prepare($statsQuery);
    $statsStmt->execute([$_SESSION['school_id']]);
    $stats = $statsStmt->fetch(PDO::FETCH_ASSOC);

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'promotions' => $promotions,
        'stats' => [
            'total_promotions' => (int)$stats['total_promotions'],
            'promoted_count' => (int)$stats['promoted_count'],
            'retained_count' => (int)$stats['retained_count'],
            'completed_count' => (int)$stats['completed_count']
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
