<?php
/**
 * Send School Announcement
 * Admin endpoint to send announcement to all parents
 */

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Check if school admin is authenticated
if (!isset($_SESSION['user_type']) || $_SESSION['user_type'] !== 'school' || !isset($_SESSION['school_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

try {
    $schoolId = $_SESSION['school_id'];
    $input = json_decode(file_get_contents('php://input'), true);

    $title = $input['title'] ?? null;
    $message = $input['message'] ?? null;
    $data = $input['data'] ?? null;
    $parentId = $input['parent_id'] ?? null; // Optional: specific parent

    // Validate input
    if (!$title || !$message) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'title and message are required']);
        exit;
    }

    $database = new Database();
    $db = $database->getConnection();

    // Load notification helper
    require_once __DIR__ . '/../../../utils/NotificationHelper.php';
    $notificationHelper = new NotificationHelper($db);

    // Check if sending to specific parent or all parents
    if ($parentId) {
        // Send to specific parent
        // First verify this parent belongs to this school
        $verifyQuery = "SELECT DISTINCT p.id
                        FROM parents p
                        INNER JOIN parent_students ps ON p.id = ps.parent_id
                        INNER JOIN students s ON ps.student_id = s.id
                        WHERE p.id = ? AND s.school_id = ?";
        $verifyStmt = $db->prepare($verifyQuery);
        $verifyStmt->execute([$parentId, $schoolId]);

        if (!$verifyStmt->fetch()) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Parent not found or does not belong to your school']);
            exit;
        }

        // Send notification to specific parent
        $result = $notificationHelper->createNotification(
            $parentId,
            $schoolId,
            null, // No specific student for announcements
            'announcement',
            $title,
            $message,
            $data
        );

        if ($result['success']) {
            echo json_encode([
                'success' => true,
                'message' => 'Announcement sent successfully',
                'sent_count' => 1,
                'failed_count' => 0
            ]);
        } else {
            throw new Exception('Failed to send announcement to parent');
        }
    } else {
        // Send announcement to all parents
        $result = $notificationHelper->sendSchoolAnnouncement($schoolId, $title, $message, $data);

        if ($result['success']) {
            echo json_encode([
                'success' => true,
                'message' => 'Announcement sent successfully',
                'sent_count' => $result['sent_count'],
                'failed_count' => $result['failed_count']
            ]);
        } else {
            throw new Exception('Failed to send announcement');
        }
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
