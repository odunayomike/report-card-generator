<?php
/**
 * Get Full Student Details
 * Returns comprehensive student information including:
 * - Basic info
 * - All report cards
 * - Fee payments
 * - Attendance records
 * - Parent information
 */

// Check authentication (school or teacher)
if (!isset($_SESSION['user_type']) || !isset($_SESSION['school_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$admission_no = isset($_GET['admission_no']) ? trim($_GET['admission_no']) : '';

if (empty($admission_no)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Admission number is required']);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();
    $schoolId = $_SESSION['school_id'];

    // Get basic student info from master students table
    $studentQuery = "SELECT id, name, gender, admission_no, current_class, guardian_email, created_at
                     FROM students
                     WHERE school_id = ? AND admission_no = ?
                     LIMIT 1";
    $studentStmt = $db->prepare($studentQuery);
    $studentStmt->execute([$schoolId, $admission_no]);
    $student = $studentStmt->fetch(PDO::FETCH_ASSOC);

    if (!$student) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Student not found']);
        exit;
    }

    $studentId = $student['id'];

    // Get all report cards for this student
    $reportsQuery = "SELECT id, student_name as name, class, session, term, student_gender as gender,
                     student_admission_no as admission_no, height, weight, club_society, fav_col,
                     student_photo as photo, created_at
                     FROM report_cards
                     WHERE school_id = ? AND student_admission_no = ?
                     ORDER BY created_at DESC";
    $reportsStmt = $db->prepare($reportsQuery);
    $reportsStmt->execute([$schoolId, $admission_no]);
    $reports = $reportsStmt->fetchAll(PDO::FETCH_ASSOC);

    // Get most recent report for current info
    $latestReport = $reports[0] ?? null;

    // Get fee information (exclude archived fee structures)
    $feesQuery = "SELECT sf.id, sf.amount_due, sf.amount_paid,
                  (sf.amount_due - sf.amount_paid) as balance,
                  sf.due_date, sf.status, sf.session, sf.term,
                  fs.amount as original_amount, fs.frequency,
                  fc.name as category_name, fc.description as category_description
                  FROM student_fees sf
                  INNER JOIN fee_structure fs ON sf.fee_structure_id = fs.id
                  INNER JOIN fee_categories fc ON fs.fee_category_id = fc.id
                  WHERE sf.student_id = ?
                  AND fs.is_active = TRUE
                  ORDER BY sf.due_date DESC, sf.created_at DESC";
    $feesStmt = $db->prepare($feesQuery);
    $feesStmt->execute([$studentId]);
    $fees = $feesStmt->fetchAll(PDO::FETCH_ASSOC);

    // Calculate fee summary
    $totalDue = 0;
    $totalPaid = 0;
    $totalBalance = 0;
    $overdueCount = 0;

    foreach ($fees as $fee) {
        $totalDue += floatval($fee['amount_due']);
        $totalPaid += floatval($fee['amount_paid']);
        $totalBalance += floatval($fee['balance']);
        if ($fee['status'] === 'overdue') {
            $overdueCount++;
        }
    }

    // Get payment history
    $paymentsQuery = "SELECT fp.id, fp.amount, fp.payment_method, fp.payment_date,
                      fp.transaction_reference, fp.receipt_no,
                      fp.verification_status as payment_status,
                      fp.verified_at, fp.created_at,
                      sf.session, sf.term,
                      fc.name as category_name
                      FROM fee_payments fp
                      INNER JOIN student_fees sf ON fp.student_fee_id = sf.id
                      INNER JOIN fee_structure fs ON sf.fee_structure_id = fs.id
                      INNER JOIN fee_categories fc ON fs.fee_category_id = fc.id
                      WHERE sf.student_id = ?
                      ORDER BY fp.payment_date DESC, fp.created_at DESC";
    $paymentsStmt = $db->prepare($paymentsQuery);
    $paymentsStmt->execute([$studentId]);
    $payments = $paymentsStmt->fetchAll(PDO::FETCH_ASSOC);

    // Get attendance records
    $attendanceQuery = "SELECT da.date, da.status, da.created_at
                        FROM daily_attendance da
                        WHERE da.student_id = ?
                        ORDER BY da.date DESC
                        LIMIT 100";
    $attendanceStmt = $db->prepare($attendanceQuery);
    $attendanceStmt->execute([$studentId]);
    $attendance = $attendanceStmt->fetchAll(PDO::FETCH_ASSOC);

    // Calculate attendance summary
    $totalDays = count($attendance);
    $presentDays = 0;
    $absentDays = 0;
    $lateDays = 0;

    foreach ($attendance as $record) {
        switch ($record['status']) {
            case 'present':
                $presentDays++;
                break;
            case 'absent':
                $absentDays++;
                break;
            case 'late':
                $lateDays++;
                break;
        }
    }

    $attendanceRate = $totalDays > 0 ? round(($presentDays / $totalDays) * 100, 2) : 0;

    // Get parent information
    $parentsQuery = "SELECT p.id, p.name, p.email, p.phone, ps.relationship, ps.created_at
                     FROM parents p
                     INNER JOIN parent_students ps ON p.id = ps.parent_id
                     WHERE ps.student_id = ?
                     ORDER BY ps.created_at ASC";
    $parentsStmt = $db->prepare($parentsQuery);
    $parentsStmt->execute([$studentId]);
    $parents = $parentsStmt->fetchAll(PDO::FETCH_ASSOC);

    // Get CBT exam results (if table exists)
    $examResults = [];
    $totalExams = 0;
    $avgPercentage = 0;

    try {
        // Get submitted exam attempts
        $examResultsQuery = "SELECT sa.id, sa.total_score as score, sa.percentage,
                             sa.time_taken_seconds, sa.started_at, sa.submitted_at,
                             sa.status,
                             e.exam_title, e.subject, e.duration_minutes,
                             e.total_questions
                             FROM cbt_student_attempts sa
                             INNER JOIN cbt_exams e ON sa.exam_id = e.id
                             WHERE sa.student_id = ? AND sa.status = 'submitted'
                             ORDER BY sa.submitted_at DESC
                             LIMIT 20";
        $examResultsStmt = $db->prepare($examResultsQuery);
        $examResultsStmt->execute([$studentId]);
        $examResults = $examResultsStmt->fetchAll(PDO::FETCH_ASSOC);

        // Calculate exam performance summary (only submitted exams)
        $totalExams = count($examResults);
        if ($totalExams > 0) {
            $sum = 0;
            foreach ($examResults as $result) {
                $sum += floatval($result['percentage']);
            }
            $avgPercentage = round($sum / $totalExams, 2);
        }

        // Also get pending exams (assigned but not started or in progress)
        $pendingExamsQuery = "SELECT DISTINCT e.id, e.exam_title, e.subject, e.duration_minutes,
                              e.total_questions, e.start_datetime, e.end_datetime,
                              'pending' as status
                              FROM cbt_exam_assignments ea
                              INNER JOIN cbt_exams e ON ea.exam_id = e.id
                              LEFT JOIN cbt_student_attempts sa ON ea.exam_id = sa.exam_id
                                   AND ea.student_id = sa.student_id
                                   AND sa.status = 'submitted'
                              WHERE ea.student_id = ? AND sa.id IS NULL
                              ORDER BY e.start_datetime DESC
                              LIMIT 10";
        $pendingExamsStmt = $db->prepare($pendingExamsQuery);
        $pendingExamsStmt->execute([$studentId]);
        $pendingExams = $pendingExamsStmt->fetchAll(PDO::FETCH_ASSOC);

        // Combine submitted and pending exams
        $allExams = array_merge($examResults, $pendingExams);

    } catch (PDOException $e) {
        // Table doesn't exist or query failed - continue with empty exam results
        $examResults = [];
        $totalExams = 0;
        $avgPercentage = 0;
        $pendingExams = [];
        $allExams = [];
    }

    // Response
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'data' => [
            'student' => [
                'id' => $student['id'],
                'name' => $student['name'],
                'admission_no' => $student['admission_no'],
                'gender' => $student['gender'],
                'current_class' => $student['current_class'],
                'current_session' => $latestReport['session'] ?? null,
                'current_term' => $latestReport['term'] ?? null,
                'height' => $latestReport['height'] ?? null,
                'weight' => $latestReport['weight'] ?? null,
                'club_society' => $latestReport['club_society'] ?? null,
                'fav_col' => $latestReport['fav_col'] ?? null,
                'photo' => $latestReport['photo'] ?? null
            ],
            'reports' => $reports,
            'fees' => [
                'summary' => [
                    'total_due' => $totalDue,
                    'total_paid' => $totalPaid,
                    'total_balance' => $totalBalance,
                    'overdue_count' => $overdueCount,
                    'total_fees' => count($fees)
                ],
                'details' => $fees
            ],
            'payments' => [
                'total_payments' => count($payments),
                'details' => $payments
            ],
            'attendance' => [
                'summary' => [
                    'total_days' => $totalDays,
                    'present_days' => $presentDays,
                    'absent_days' => $absentDays,
                    'late_days' => $lateDays,
                    'attendance_rate' => $attendanceRate
                ],
                'records' => $attendance
            ],
            'parents' => $parents,
            'exam_results' => [
                'summary' => [
                    'total_exams' => $totalExams,
                    'pending_exams' => count($pendingExams ?? []),
                    'total_all_exams' => count($allExams ?? []),
                    'average_percentage' => $avgPercentage
                ],
                'details' => $allExams ?? []
            ]
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error occurred',
        'error' => $e->getMessage()
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred',
        'error' => $e->getMessage()
    ]);
}
