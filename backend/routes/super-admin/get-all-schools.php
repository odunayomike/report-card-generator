<?php
// Get All Schools (Super Admin)

require_once __DIR__ . '/../../middleware/super-admin-check.php';
requireSuperAdmin();

require_once __DIR__ . '/../../config/database.php';

try {
    $db = new Database();
    $conn = $db->getConnection();

    // Get pagination parameters
    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 20;
    $offset = ($page - 1) * $limit;

    // Get filter parameters
    $status = isset($_GET['status']) ? $_GET['status'] : null;
    $search = isset($_GET['search']) ? trim($_GET['search']) : null;

    // Build query
    $whereClause = "WHERE 1=1";
    $params = [];

    if ($status && in_array($status, ['active', 'expired', 'trial'])) {
        $whereClause .= " AND s.subscription_status = :status";
        $params[':status'] = $status;
    }

    if ($search) {
        $whereClause .= " AND (s.school_name LIKE :search OR s.email LIKE :search OR s.phone LIKE :search)";
        $params[':search'] = "%$search%";
    }

    // Get total count
    $countStmt = $conn->prepare("SELECT COUNT(*) as total FROM schools s $whereClause");
    foreach ($params as $key => $value) {
        $countStmt->bindValue($key, $value);
    }
    $countStmt->execute();
    $totalSchools = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];

    // Get schools with aggregated data
    $stmt = $conn->prepare("
        SELECT
            s.id,
            s.school_name,
            s.email,
            s.phone,
            s.address,
            s.is_active,
            s.subscription_status,
            s.subscription_end_date,
            s.created_at,
            s.updated_at,
            COUNT(DISTINCT st.id) as total_students,
            COUNT(DISTINCT t.id) as total_teachers,
            COUNT(DISTINCT st.class) as total_classes
        FROM schools s
        LEFT JOIN students st ON s.id = st.school_id
        LEFT JOIN teachers t ON s.id = t.school_id
        $whereClause
        GROUP BY s.id
        ORDER BY s.created_at DESC
        LIMIT :limit OFFSET :offset
    ");

    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();

    $schools = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Log activity
    logSuperAdminActivity('view', 'school', "Viewed all schools list (page $page)");

    http_response_code(200);
    echo json_encode([
        'schools' => $schools,
        'pagination' => [
            'current_page' => $page,
            'per_page' => $limit,
            'total_items' => (int)$totalSchools,
            'total_pages' => ceil($totalSchools / $limit)
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
