<?php
// Get All Students Across All Schools (Super Admin)

require_once __DIR__ . '/../../middleware/super-admin-check.php';
requireSuperAdmin();

require_once __DIR__ . '/../../config/database.php';

try {
    $db = new Database();
    $conn = $db->getConnection();

    // Get pagination parameters
    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;
    $offset = ($page - 1) * $limit;

    // Get filter parameters
    $school_id = isset($_GET['school_id']) ? (int)$_GET['school_id'] : null;
    $search = isset($_GET['search']) ? trim($_GET['search']) : null;
    $class = isset($_GET['class']) ? trim($_GET['class']) : null;
    $session = isset($_GET['session']) ? trim($_GET['session']) : null;
    $term = isset($_GET['term']) ? trim($_GET['term']) : null;

    // Build query
    $whereClause = "WHERE 1=1";
    $params = [];

    if ($school_id) {
        $whereClause .= " AND st.school_id = :school_id";
        $params[':school_id'] = $school_id;
    }

    if ($search) {
        $whereClause .= " AND (st.name LIKE :search OR st.admission_no LIKE :search OR s.school_name LIKE :search)";
        $params[':search'] = "%$search%";
    }

    if ($class) {
        $whereClause .= " AND st.class = :class";
        $params[':class'] = $class;
    }

    if ($session) {
        $whereClause .= " AND st.session = :session";
        $params[':session'] = $session;
    }

    if ($term) {
        $whereClause .= " AND st.term = :term";
        $params[':term'] = $term;
    }

    // Get total count
    $countStmt = $conn->prepare("
        SELECT COUNT(*) as total
        FROM students st
        JOIN schools s ON st.school_id = s.id
        $whereClause
    ");
    foreach ($params as $key => $value) {
        $countStmt->bindValue($key, $value);
    }
    $countStmt->execute();
    $totalStudents = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];

    // Get students with school information
    $stmt = $conn->prepare("
        SELECT
            st.id,
            st.name,
            st.class,
            st.session,
            st.term,
            st.admission_no,
            st.gender,
            st.created_at,
            st.updated_at,
            s.id as school_id,
            s.school_name,
            s.email as school_email,
            s.subscription_status,
            COUNT(DISTINCT sub.id) as total_subjects
        FROM students st
        JOIN schools s ON st.school_id = s.id
        LEFT JOIN subjects sub ON st.id = sub.student_id
        $whereClause
        GROUP BY st.id
        ORDER BY st.created_at DESC
        LIMIT :limit OFFSET :offset
    ");

    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();

    $students = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Log activity
    $filterDesc = $school_id ? "for school_id $school_id" : "across all schools";
    logSuperAdminActivity('view', 'student', "Viewed all students $filterDesc (page $page)");

    http_response_code(200);
    echo json_encode([
        'students' => $students,
        'pagination' => [
            'current_page' => $page,
            'per_page' => $limit,
            'total_items' => (int)$totalStudents,
            'total_pages' => ceil($totalStudents / $limit)
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
