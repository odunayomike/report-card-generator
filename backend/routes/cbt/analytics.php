<?php
/**
 * CBT Analytics API
 * Provides statistics and insights for the CBT dashboard
 */

// Check authentication
if (!isset($_SESSION['user_type']) || !isset($_SESSION['school_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$userType = $_SESSION['user_type'];
$schoolId = $_SESSION['school_id'];
// Get the appropriate user ID based on user type
$userId = null;
if ($userType === 'teacher') {
    $userId = $_SESSION['teacher_id'] ?? null;
} else {
    $userId = $_SESSION['user_id'] ?? null;
}

$database = new Database();
$db = $database->getConnection();

try {
    // Determine if user is a teacher
    $isTeacher = ($userType === 'teacher');

    // Build base WHERE clause based on user type
    if ($isTeacher) {
        $whereClause = "WHERE e.school_id = ? AND e.created_by = ?";
        $params = [$schoolId, $userId];
    } else {
        $whereClause = "WHERE e.school_id = ?";
        $params = [$schoolId];
    }

    // 1. Overview Statistics
    $stats = [];

    // Total questions
    if ($isTeacher) {
        $query = "SELECT COUNT(*) as total FROM cbt_questions WHERE school_id = ? AND created_by = ?";
        $stmt = $db->prepare($query);
        $stmt->execute([$schoolId, $userId]);
    } else {
        $query = "SELECT COUNT(*) as total FROM cbt_questions WHERE school_id = ?";
        $stmt = $db->prepare($query);
        $stmt->execute([$schoolId]);
    }
    $stats['total_questions'] = $stmt->fetch(PDO::FETCH_ASSOC)['total'];

    // Total exams (draft + published)
    $query = "SELECT COUNT(*) as total FROM cbt_exams e $whereClause";
    $stmt = $db->prepare($query);
    $stmt->execute($params);
    $stats['total_exams'] = $stmt->fetch(PDO::FETCH_ASSOC)['total'];

    // Published exams
    $query = "SELECT COUNT(*) as total FROM cbt_exams e $whereClause AND e.is_published = 1";
    $stmt = $db->prepare($query);
    $stmt->execute($params);
    $stats['published_exams'] = $stmt->fetch(PDO::FETCH_ASSOC)['total'];

    // Draft exams
    $stats['draft_exams'] = $stats['total_exams'] - $stats['published_exams'];

    // Total student attempts
    $query = "SELECT COUNT(DISTINCT a.student_id) as total_students,
                     COUNT(*) as total_attempts,
                     COUNT(CASE WHEN a.status = 'submitted' THEN 1 END) as completed_attempts,
                     COUNT(CASE WHEN a.status = 'in_progress' THEN 1 END) as in_progress_attempts
              FROM cbt_student_attempts a
              JOIN cbt_exams e ON a.exam_id = e.id
              $whereClause";
    $stmt = $db->prepare($query);
    $stmt->execute($params);
    $attemptStats = $stmt->fetch(PDO::FETCH_ASSOC);
    $stats['total_students_participated'] = $attemptStats['total_students'];
    $stats['total_attempts'] = $attemptStats['total_attempts'];
    $stats['completed_attempts'] = $attemptStats['completed_attempts'];
    $stats['in_progress_attempts'] = $attemptStats['in_progress_attempts'];

    // Average score across all exams
    $query = "SELECT AVG(a.percentage) as avg_percentage
              FROM cbt_student_attempts a
              JOIN cbt_exams e ON a.exam_id = e.id
              $whereClause AND a.status = 'submitted'";
    $stmt = $db->prepare($query);
    $stmt->execute($params);
    $avgResult = $stmt->fetch(PDO::FETCH_ASSOC);
    $stats['average_score'] = $avgResult['avg_percentage'] ? round($avgResult['avg_percentage'], 2) : 0;

    // 2. Recent Activity (last 5 exams with attempts)
    $query = "SELECT e.id, e.exam_title, e.subject, e.class, e.session, e.term,
                     e.assessment_type, e.is_published,
                     COUNT(DISTINCT a.id) as total_attempts,
                     COUNT(DISTINCT CASE WHEN a.status = 'submitted' THEN a.id END) as completed,
                     AVG(CASE WHEN a.status = 'submitted' THEN a.percentage END) as avg_score
              FROM cbt_exams e
              LEFT JOIN cbt_student_attempts a ON e.id = a.exam_id
              $whereClause
              GROUP BY e.id
              ORDER BY e.created_at DESC
              LIMIT 5";
    $stmt = $db->prepare($query);
    $stmt->execute($params);
    $recentExams = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Format recent exams
    foreach ($recentExams as &$exam) {
        $exam['avg_score'] = $exam['avg_score'] ? round($exam['avg_score'], 2) : 0;
        $exam['completion_rate'] = $exam['total_attempts'] > 0
            ? round(($exam['completed'] / $exam['total_attempts']) * 100, 2)
            : 0;
    }

    // 3. Performance by Subject
    $query = "SELECT e.subject,
                     COUNT(DISTINCT e.id) as exam_count,
                     COUNT(DISTINCT a.id) as attempt_count,
                     AVG(CASE WHEN a.status = 'submitted' THEN a.percentage END) as avg_score,
                     MAX(CASE WHEN a.status = 'submitted' THEN a.percentage END) as max_score,
                     MIN(CASE WHEN a.status = 'submitted' THEN a.percentage END) as min_score
              FROM cbt_exams e
              LEFT JOIN cbt_student_attempts a ON e.id = a.exam_id
              $whereClause
              GROUP BY e.subject
              ORDER BY avg_score DESC";
    $stmt = $db->prepare($query);
    $stmt->execute($params);
    $subjectPerformance = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Format subject performance
    foreach ($subjectPerformance as &$subject) {
        $subject['avg_score'] = $subject['avg_score'] ? round($subject['avg_score'], 2) : 0;
        $subject['max_score'] = $subject['max_score'] ? round($subject['max_score'], 2) : 0;
        $subject['min_score'] = $subject['min_score'] ? round($subject['min_score'], 2) : 0;
    }

    // 4. Performance by Class
    $query = "SELECT e.class,
                     COUNT(DISTINCT e.id) as exam_count,
                     COUNT(DISTINCT a.id) as attempt_count,
                     AVG(CASE WHEN a.status = 'submitted' THEN a.percentage END) as avg_score
              FROM cbt_exams e
              LEFT JOIN cbt_student_attempts a ON e.id = a.exam_id
              $whereClause
              GROUP BY e.class
              ORDER BY e.class";
    $stmt = $db->prepare($query);
    $stmt->execute($params);
    $classPerformance = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Format class performance
    foreach ($classPerformance as &$class) {
        $class['avg_score'] = $class['avg_score'] ? round($class['avg_score'], 2) : 0;
    }

    // 5. Grade Distribution
    $query = "SELECT
                COUNT(CASE WHEN a.percentage >= 80 THEN 1 END) as grade_a,
                COUNT(CASE WHEN a.percentage >= 70 AND a.percentage < 80 THEN 1 END) as grade_b,
                COUNT(CASE WHEN a.percentage >= 60 AND a.percentage < 70 THEN 1 END) as grade_c,
                COUNT(CASE WHEN a.percentage >= 50 AND a.percentage < 60 THEN 1 END) as grade_d,
                COUNT(CASE WHEN a.percentage >= 40 AND a.percentage < 50 THEN 1 END) as grade_e,
                COUNT(CASE WHEN a.percentage < 40 THEN 1 END) as grade_f
              FROM cbt_student_attempts a
              JOIN cbt_exams e ON a.exam_id = e.id
              $whereClause AND a.status = 'submitted'";
    $stmt = $db->prepare($query);
    $stmt->execute($params);
    $gradeDistribution = $stmt->fetch(PDO::FETCH_ASSOC);

    // 6. Exam Activity Timeline (last 7 days)
    $query = "SELECT DATE(a.submitted_at) as date,
                     COUNT(*) as submissions
              FROM cbt_student_attempts a
              JOIN cbt_exams e ON a.exam_id = e.id
              $whereClause AND a.status = 'submitted'
              AND a.submitted_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
              GROUP BY DATE(a.submitted_at)
              ORDER BY date ASC";
    $stmt = $db->prepare($query);
    $stmt->execute($params);
    $activityTimeline = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 7. Top Performing Students (if school admin)
    $topStudents = [];
    if (!$isTeacher) {
        $query = "SELECT s.id, s.name, s.admission_no,
                         COUNT(DISTINCT a.id) as exams_taken,
                         AVG(a.percentage) as avg_score,
                         MAX(a.percentage) as best_score
                  FROM cbt_student_attempts a
                  JOIN students s ON a.student_id = s.id
                  JOIN cbt_exams e ON a.exam_id = e.id
                  WHERE e.school_id = ? AND a.status = 'submitted'
                  GROUP BY s.id
                  HAVING exams_taken >= 1
                  ORDER BY avg_score DESC
                  LIMIT 10";
        $stmt = $db->prepare($query);
        $stmt->execute([$schoolId]);
        $topStudents = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($topStudents as &$student) {
            $student['avg_score'] = round($student['avg_score'], 2);
            $student['best_score'] = round($student['best_score'], 2);
        }
    }

    // 8. Questions by difficulty (if available)
    $difficultyQuery = $isTeacher
        ? "SELECT difficulty, COUNT(*) as count FROM cbt_questions WHERE school_id = ? AND created_by = ? GROUP BY difficulty"
        : "SELECT difficulty, COUNT(*) as count FROM cbt_questions WHERE school_id = ? GROUP BY difficulty";
    $stmt = $db->prepare($difficultyQuery);
    $stmt->execute($isTeacher ? [$schoolId, $userId] : [$schoolId]);
    $questionsByDifficulty = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Return all analytics
    echo json_encode([
        'success' => true,
        'stats' => $stats,
        'recent_exams' => $recentExams,
        'subject_performance' => $subjectPerformance,
        'class_performance' => $classPerformance,
        'grade_distribution' => $gradeDistribution,
        'activity_timeline' => $activityTimeline,
        'top_students' => $topStudents,
        'questions_by_difficulty' => $questionsByDifficulty
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
