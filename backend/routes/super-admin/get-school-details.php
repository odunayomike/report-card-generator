<?php
// Get School Details (Super Admin)

require_once __DIR__ . '/../../middleware/super-admin-check.php';
requireSuperAdmin();

require_once __DIR__ . '/../../config/database.php';

if (!isset($_GET['school_id'])) {
    http_response_code(400);
    echo json_encode(['error' => 'School ID is required']);
    exit;
}

$school_id = (int)$_GET['school_id'];

try {
    $db = new Database();
    $conn = $db->getConnection();

    // Get school details
    $stmt = $conn->prepare("
        SELECT
            s.*,
            COUNT(DISTINCT st.id) as total_students,
            COUNT(DISTINCT t.id) as total_teachers,
            COUNT(DISTINCT st.class) as total_classes
        FROM schools s
        LEFT JOIN students st ON s.id = st.school_id
        LEFT JOIN teachers t ON s.id = t.school_id
        WHERE s.id = :school_id
        GROUP BY s.id
    ");
    $stmt->bindParam(':school_id', $school_id);
    $stmt->execute();

    $school = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$school) {
        http_response_code(404);
        echo json_encode(['error' => 'School not found']);
        exit;
    }

    // Get subscription history
    $historyStmt = $conn->prepare("
        SELECT
            sh.*,
            sp.plan_name,
            sp.amount,
            sp.duration_days
        FROM subscription_history sh
        LEFT JOIN subscription_plans sp ON sh.plan_id = sp.id
        WHERE sh.school_id = :school_id
        ORDER BY sh.created_at DESC
        LIMIT 10
    ");
    $historyStmt->bindParam(':school_id', $school_id);
    $historyStmt->execute();
    $subscription_history = $historyStmt->fetchAll(PDO::FETCH_ASSOC);

    // Get recent students
    $studentsStmt = $conn->prepare("
        SELECT id, name, class, session, term, admission_no, created_at
        FROM students
        WHERE school_id = :school_id
        ORDER BY created_at DESC
        LIMIT 10
    ");
    $studentsStmt->bindParam(':school_id', $school_id);
    $studentsStmt->execute();
    $recent_students = $studentsStmt->fetchAll(PDO::FETCH_ASSOC);

    // Get recent teachers
    $teachersStmt = $conn->prepare("
        SELECT id, name, email, phone, is_active, created_at
        FROM teachers
        WHERE school_id = :school_id
        ORDER BY created_at DESC
        LIMIT 10
    ");
    $teachersStmt->bindParam(':school_id', $school_id);
    $teachersStmt->execute();
    $recent_teachers = $teachersStmt->fetchAll(PDO::FETCH_ASSOC);

    // Log activity
    logSuperAdminActivity('view', 'school', "Viewed details for school: {$school['school_name']}", $school_id, $school_id);

    http_response_code(200);
    echo json_encode([
        'school' => $school,
        'subscription_history' => $subscription_history,
        'recent_students' => $recent_students,
        'recent_teachers' => $recent_teachers
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
