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
    // Get unique class names from students table
    $query = "SELECT DISTINCT
                s.current_class as class_name,
                COUNT(DISTINCT s.id) as student_count
              FROM students s
              WHERE s.school_id = ?
                AND s.current_class IS NOT NULL
                AND s.current_class != ''
              GROUP BY s.current_class
              ORDER BY s.current_class ASC";

    $stmt = $db->prepare($query);
    $stmt->execute([$_SESSION['school_id']]);
    $classResults = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Get unique sessions from report_cards
    $sessionQuery = "SELECT DISTINCT session
                     FROM report_cards
                     WHERE school_id = ?
                       AND session IS NOT NULL
                       AND session != ''
                     ORDER BY session DESC";

    $sessionStmt = $db->prepare($sessionQuery);
    $sessionStmt->execute([$_SESSION['school_id']]);
    $sessions = $sessionStmt->fetchAll(PDO::FETCH_COLUMN);

    // Get current session from school settings
    $schoolQuery = "SELECT current_session, current_term FROM schools WHERE id = ?";
    $schoolStmt = $db->prepare($schoolQuery);
    $schoolStmt->execute([$_SESSION['school_id']]);
    $schoolData = $schoolStmt->fetch(PDO::FETCH_ASSOC);

    // Build response with class/session/term combinations
    $classes = [];
    foreach ($classResults as $classData) {
        // Add entry for current session/term from school settings
        if ($schoolData && $schoolData['current_session'] && $schoolData['current_term']) {
            $classes[] = [
                'class_name' => $classData['class_name'],
                'session' => $schoolData['current_session'],
                'term' => $schoolData['current_term'],
                'student_count' => $classData['student_count'],
                'id' => "{$classData['class_name']}-{$schoolData['current_session']}-{$schoolData['current_term']}"
            ];
        }

        // Add entries for historical sessions from report_cards
        foreach ($sessions as $session) {
            foreach (['First Term', 'Second Term', 'Third Term'] as $term) {
                $classes[] = [
                    'class_name' => $classData['class_name'],
                    'session' => $session,
                    'term' => $term,
                    'student_count' => $classData['student_count'],
                    'id' => "{$classData['class_name']}-{$session}-{$term}"
                ];
            }
        }
    }

    // Remove duplicates
    $uniqueClasses = [];
    $seen = [];
    foreach ($classes as $class) {
        $key = $class['id'];
        if (!isset($seen[$key])) {
            $uniqueClasses[] = $class;
            $seen[$key] = true;
        }
    }

    echo json_encode([
        'success' => true,
        'classes' => $uniqueClasses,
        'total' => count($uniqueClasses)
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>
