<?php
/**
 * Get Analytics Route Handler
 * Returns dashboard analytics including top students, class performance, etc.
 */

$database = new Database();
$db = $database->getConnection();

$school_id = isset($_SESSION['school_id']) ? $_SESSION['school_id'] : null;

if (!$school_id) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit();
}

try {
    // Get top students per class (based on average scores)
    $topStudentsQuery = "
        SELECT
            s.id,
            s.name,
            s.class,
            s.admission_no,
            s.session,
            s.term,
            s.photo,
            AVG(sub.total) as average_score,
            COUNT(sub.id) as subject_count
        FROM students s
        LEFT JOIN subjects sub ON s.id = sub.student_id
        WHERE s.school_id = :school_id
        GROUP BY s.id, s.class
        HAVING subject_count > 0
        ORDER BY s.class, average_score DESC
    ";

    $stmt = $db->prepare($topStudentsQuery);
    $stmt->execute([':school_id' => $school_id]);
    $allStudents = $stmt->fetchAll();

    // Group by class and get top 3 per class
    $topStudentsByClass = [];
    $classCounts = [];

    foreach ($allStudents as $student) {
        $class = $student['class'];

        if (!isset($topStudentsByClass[$class])) {
            $topStudentsByClass[$class] = [];
        }

        if (count($topStudentsByClass[$class]) < 3) {
            $topStudentsByClass[$class][] = [
                'id' => $student['id'],
                'name' => $student['name'],
                'admissionNo' => $student['admission_no'],
                'session' => $student['session'],
                'term' => $student['term'],
                'photo' => $student['photo'],
                'averageScore' => round($student['average_score'], 2),
                'subjectCount' => $student['subject_count']
            ];
        }

        // Count students per class
        if (!isset($classCounts[$class])) {
            $classCounts[$class] = 0;
        }
        $classCounts[$class]++;
    }

    // Get overall top 5 students
    $topOverall = array_slice($allStudents, 0, 5);
    $topOverallFormatted = array_map(function($student) {
        return [
            'id' => $student['id'],
            'name' => $student['name'],
            'class' => $student['class'],
            'admissionNo' => $student['admission_no'],
            'session' => $student['session'],
            'term' => $student['term'],
            'photo' => $student['photo'],
            'averageScore' => round($student['average_score'], 2),
            'subjectCount' => $student['subject_count']
        ];
    }, $topOverall);

    // Get class performance averages
    $classPerformanceQuery = "
        SELECT
            s.class,
            AVG(sub.total) as average_score,
            COUNT(DISTINCT s.id) as student_count,
            COUNT(sub.id) as total_submissions
        FROM students s
        LEFT JOIN subjects sub ON s.id = sub.student_id
        WHERE s.school_id = :school_id
        GROUP BY s.class
        ORDER BY average_score DESC
    ";

    $stmt = $db->prepare($classPerformanceQuery);
    $stmt->execute([':school_id' => $school_id]);
    $classPerformance = $stmt->fetchAll();

    $classPerformanceFormatted = array_map(function($class) {
        return [
            'class' => $class['class'],
            'averageScore' => round($class['average_score'], 2),
            'studentCount' => $class['student_count'],
            'totalSubmissions' => $class['total_submissions']
        ];
    }, $classPerformance);

    // Get grade distribution
    $gradeDistributionQuery = "
        SELECT
            CASE
                WHEN sub.total >= 70 THEN 'A'
                WHEN sub.total >= 60 THEN 'B'
                WHEN sub.total >= 50 THEN 'C'
                WHEN sub.total >= 40 THEN 'D'
                ELSE 'F'
            END as grade,
            COUNT(*) as count
        FROM students s
        JOIN subjects sub ON s.id = sub.student_id
        WHERE s.school_id = :school_id
        GROUP BY grade
        ORDER BY grade
    ";

    $stmt = $db->prepare($gradeDistributionQuery);
    $stmt->execute([':school_id' => $school_id]);
    $gradeDistribution = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);

    // Get recent activity (last 10 report cards created)
    $recentActivityQuery = "
        SELECT
            s.id,
            s.name,
            s.class,
            s.session,
            s.term,
            s.created_at
        FROM students s
        WHERE s.school_id = :school_id
        ORDER BY s.created_at DESC
        LIMIT 10
    ";

    $stmt = $db->prepare($recentActivityQuery);
    $stmt->execute([':school_id' => $school_id]);
    $recentActivity = $stmt->fetchAll();

    $recentActivityFormatted = array_map(function($activity) {
        return [
            'id' => $activity['id'],
            'name' => $activity['name'],
            'class' => $activity['class'],
            'session' => $activity['session'],
            'term' => $activity['term'],
            'createdAt' => $activity['created_at']
        ];
    }, $recentActivity);

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'analytics' => [
            'topStudentsByClass' => $topStudentsByClass,
            'topOverall' => $topOverallFormatted,
            'classPerformance' => $classPerformanceFormatted,
            'gradeDistribution' => $gradeDistribution,
            'recentActivity' => $recentActivityFormatted,
            'classCounts' => $classCounts
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error loading analytics: ' . $e->getMessage()
    ]);
}
