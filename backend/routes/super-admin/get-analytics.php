<?php
// Get Super Admin Dashboard Analytics

require_once __DIR__ . '/../../middleware/super-admin-check.php';
requireSuperAdmin();

require_once __DIR__ . '/../../config/database.php';

try {
    $db = new Database();
    $conn = $db->getConnection();

    // Get total schools count
    $schoolsStmt = $conn->query("
        SELECT
            COUNT(*) as total_schools,
            SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_schools,
            SUM(CASE WHEN subscription_status = 'active' THEN 1 ELSE 0 END) as subscribed_schools,
            SUM(CASE WHEN subscription_status = 'trial' THEN 1 ELSE 0 END) as trial_schools,
            SUM(CASE WHEN subscription_status = 'expired' THEN 1 ELSE 0 END) as expired_schools
        FROM schools
    ");
    $schoolStats = $schoolsStmt->fetch(PDO::FETCH_ASSOC);

    // Get total students count
    $studentsStmt = $conn->query("SELECT COUNT(*) as total_students FROM students");
    $studentStats = $studentsStmt->fetch(PDO::FETCH_ASSOC);

    // Get total teachers count
    $teachersStmt = $conn->query("SELECT COUNT(*) as total_teachers FROM teachers");
    $teacherStats = $teachersStmt->fetch(PDO::FETCH_ASSOC);

    // Get revenue statistics (from subscription payments)
    $revenueStmt = $conn->query("
        SELECT
            SUM(CASE WHEN status = 'success' THEN amount ELSE 0 END) as total_revenue,
            SUM(CASE WHEN status = 'success' AND MONTH(paid_at) = MONTH(CURRENT_DATE) AND YEAR(paid_at) = YEAR(CURRENT_DATE) THEN amount ELSE 0 END) as monthly_revenue,
            COUNT(CASE WHEN status = 'success' THEN 1 END) as successful_payments,
            COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_payments
        FROM subscription_payments
    ");
    $revenueStats = $revenueStmt->fetch(PDO::FETCH_ASSOC);

    // Get recent school registrations (last 30 days)
    $recentSchoolsStmt = $conn->query("
        SELECT COUNT(*) as count
        FROM schools
        WHERE created_at >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)
    ");
    $recentSchools = $recentSchoolsStmt->fetch(PDO::FETCH_ASSOC);

    // Get schools by subscription status breakdown
    $subscriptionBreakdownStmt = $conn->query("
        SELECT
            subscription_status,
            COUNT(*) as count
        FROM schools
        GROUP BY subscription_status
    ");
    $subscriptionBreakdown = $subscriptionBreakdownStmt->fetchAll(PDO::FETCH_ASSOC);

    // Get top schools by student count
    $topSchoolsStmt = $conn->query("
        SELECT
            s.id,
            s.school_name,
            s.email,
            s.subscription_status,
            COUNT(DISTINCT st.id) as student_count,
            COUNT(DISTINCT t.id) as teacher_count
        FROM schools s
        LEFT JOIN students st ON s.id = st.school_id
        LEFT JOIN teachers t ON s.id = t.school_id
        GROUP BY s.id
        ORDER BY student_count DESC
        LIMIT 10
    ");
    $topSchools = $topSchoolsStmt->fetchAll(PDO::FETCH_ASSOC);

    // Get monthly growth statistics (schools registered per month, last 6 months)
    $growthStmt = $conn->query("
        SELECT
            DATE_FORMAT(created_at, '%Y-%m') as month,
            COUNT(*) as schools_registered
        FROM schools
        WHERE created_at >= DATE_SUB(CURRENT_DATE, INTERVAL 6 MONTH)
        GROUP BY month
        ORDER BY month DESC
    ");
    $growthStats = $growthStmt->fetchAll(PDO::FETCH_ASSOC);

    // Get schools expiring soon (within 7 days)
    $expiringSoonStmt = $conn->query("
        SELECT
            id,
            school_name,
            email,
            subscription_end_date,
            DATEDIFF(subscription_end_date, CURRENT_DATE) as days_remaining
        FROM schools
        WHERE subscription_status = 'active'
        AND subscription_end_date IS NOT NULL
        AND subscription_end_date BETWEEN CURRENT_DATE AND DATE_ADD(CURRENT_DATE, INTERVAL 7 DAY)
        ORDER BY subscription_end_date ASC
    ");
    $expiringSoon = $expiringSoonStmt->fetchAll(PDO::FETCH_ASSOC);

    // Log activity
    logSuperAdminActivity('view', 'system', 'Viewed super admin dashboard analytics');

    http_response_code(200);
    echo json_encode([
        'school_statistics' => $schoolStats,
        'student_statistics' => $studentStats,
        'teacher_statistics' => $teacherStats,
        'revenue_statistics' => $revenueStats,
        'recent_schools_30_days' => $recentSchools,
        'subscription_breakdown' => $subscriptionBreakdown,
        'top_schools' => $topSchools,
        'growth_statistics' => $growthStats,
        'schools_expiring_soon' => $expiringSoon
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
