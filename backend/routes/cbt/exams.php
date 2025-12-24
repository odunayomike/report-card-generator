<?php
/**
 * CBT Exams Management Route
 * Handles creation, editing, publishing, and assignment of exams
 * Teachers can create exams, add questions, assign to students
 */

// Check if teacher or school admin is authenticated
$isTeacher = isset($_SESSION['user_type']) && $_SESSION['user_type'] === 'teacher' && isset($_SESSION['teacher_id']);
$isSchool = isset($_SESSION['user_type']) && $_SESSION['user_type'] === 'school' && isset($_SESSION['school_id']);

if (!$isTeacher && !$isSchool) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized - Teacher or School access required']);
    exit;
}

// Set user context
$userId = $isTeacher ? $_SESSION['teacher_id'] : null;
$schoolId = $isTeacher ? $_SESSION['school_id'] : $_SESSION['school_id'];

$database = new Database();
$db = $database->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET':
            // Get exams created by this teacher
            $examId = $_GET['id'] ?? null;
            $status = $_GET['status'] ?? null; // draft, published, completed

            if ($examId) {
                // Get specific exam with questions and assignments
                // School admins can see all exams, teachers only see their own
                if ($isTeacher) {
                    $query = "SELECT e.*,
                              COUNT(DISTINCT eq.question_id) as question_count,
                              COUNT(DISTINCT ea.student_id) as assigned_students,
                              COUNT(DISTINCT CASE WHEN ea.has_submitted = 1 THEN ea.student_id END) as completed_count
                              FROM cbt_exams e
                              LEFT JOIN cbt_exam_questions eq ON e.id = eq.exam_id
                              LEFT JOIN cbt_exam_assignments ea ON e.id = ea.exam_id
                              WHERE e.id = ? AND e.school_id = ? AND e.created_by = ?
                              GROUP BY e.id";
                    $stmt = $db->prepare($query);
                    $stmt->execute([$examId, $schoolId, $userId]);
                } else {
                    $query = "SELECT e.*,
                              COUNT(DISTINCT eq.question_id) as question_count,
                              COUNT(DISTINCT ea.student_id) as assigned_students,
                              COUNT(DISTINCT CASE WHEN ea.has_submitted = 1 THEN ea.student_id END) as completed_count
                              FROM cbt_exams e
                              LEFT JOIN cbt_exam_questions eq ON e.id = eq.exam_id
                              LEFT JOIN cbt_exam_assignments ea ON e.id = ea.exam_id
                              WHERE e.id = ? AND e.school_id = ?
                              GROUP BY e.id";
                    $stmt = $db->prepare($query);
                    $stmt->execute([$examId, $schoolId]);
                }
                $exam = $stmt->fetch(PDO::FETCH_ASSOC);

                if (!$exam) {
                    http_response_code(404);
                    echo json_encode(['success' => false, 'message' => 'Exam not found']);
                    exit;
                }

                // Get assigned students
                $studentsQuery = "SELECT ea.*, s.name, s.admission_no
                                  FROM cbt_exam_assignments ea
                                  JOIN students s ON ea.student_id = s.id
                                  WHERE ea.exam_id = ?";
                $studentsStmt = $db->prepare($studentsQuery);
                $studentsStmt->execute([$examId]);
                $exam['assigned_students_list'] = $studentsStmt->fetchAll(PDO::FETCH_ASSOC);

                echo json_encode([
                    'success' => true,
                    'exam' => $exam
                ]);
            } else {
                // Get all exams
                // School admins can see all exams, teachers only see their own
                if ($isTeacher) {
                    $query = "SELECT e.*,
                              COUNT(DISTINCT eq.question_id) as question_count,
                              COUNT(DISTINCT ea.student_id) as assigned_students,
                              COUNT(DISTINCT CASE WHEN ea.has_submitted = 1 THEN ea.student_id END) as completed_count
                              FROM cbt_exams e
                              LEFT JOIN cbt_exam_questions eq ON e.id = eq.exam_id
                              LEFT JOIN cbt_exam_assignments ea ON e.id = ea.exam_id
                              WHERE e.school_id = ? AND e.created_by = ?";
                    $params = [$schoolId, $userId];
                } else {
                    $query = "SELECT e.*,
                              COUNT(DISTINCT eq.question_id) as question_count,
                              COUNT(DISTINCT ea.student_id) as assigned_students,
                              COUNT(DISTINCT CASE WHEN ea.has_submitted = 1 THEN ea.student_id END) as completed_count
                              FROM cbt_exams e
                              LEFT JOIN cbt_exam_questions eq ON e.id = eq.exam_id
                              LEFT JOIN cbt_exam_assignments ea ON e.id = ea.exam_id
                              WHERE e.school_id = ?";
                    $params = [$schoolId];
                }

                if ($status === 'draft') {
                    $query .= " AND e.is_published = 0";
                } elseif ($status === 'published') {
                    $query .= " AND e.is_published = 1";
                }

                $query .= " GROUP BY e.id ORDER BY e.created_at DESC";
                $stmt = $db->prepare($query);
                $stmt->execute($params);
                $exams = $stmt->fetchAll(PDO::FETCH_ASSOC);

                echo json_encode([
                    'success' => true,
                    'exams' => $exams,
                    'total' => count($exams)
                ]);
            }
            break;

        case 'POST':
            // Create a new exam
            $input = json_decode(file_get_contents('php://input'), true);

            $examTitle = trim($input['exam_title'] ?? '');
            $subject = trim($input['subject'] ?? '');
            $className = trim($input['class_name'] ?? '');
            $session = trim($input['session'] ?? '');
            $term = trim($input['term'] ?? '');
            $assessmentType = $input['assessment_type'] ?? '';
            $durationMinutes = intval($input['duration_minutes'] ?? 30);
            $totalScore = floatval($input['total_score'] ?? 10);
            $instructions = trim($input['instructions'] ?? '');
            $shuffleQuestions = intval($input['shuffle_questions'] ?? 1);
            $shuffleOptions = intval($input['shuffle_options'] ?? 1);
            $showResults = intval($input['show_results'] ?? 0);
            $startDatetime = $input['start_datetime'] ?? null;
            $endDatetime = $input['end_datetime'] ?? null;
            $questions = $input['questions'] ?? []; // Array of question IDs

            // Validate required fields
            if (empty($examTitle) || empty($subject) || empty($className) || empty($session) || empty($term) || empty($assessmentType)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'All exam details are required']);
                exit;
            }

            // Validate assessment type is not empty (accept any custom type)
            if (empty(trim($assessmentType))) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Assessment type cannot be empty']);
                exit;
            }

            $db->beginTransaction();

            // Set default dates if not provided
            if (empty($startDatetime)) {
                // Set to 5 minutes ago to make immediately available
                $startDatetime = date('Y-m-d H:i:s', strtotime('-5 minutes'));
            }
            if (empty($endDatetime)) {
                // Default: exam available for 7 days
                $endDatetime = date('Y-m-d H:i:s', strtotime('+7 days'));
            }

            // Calculate total questions
            $totalQuestions = count($questions);
            if ($totalQuestions === 0) {
                $totalQuestions = 1; // Default minimum
            }

            // For school admins, we need a valid teacher_id for created_by
            $createdBy = $userId;
            if (!$createdBy && $isSchool) {
                // Get the first teacher from this school
                $teacherQuery = "SELECT id FROM teachers WHERE school_id = ? LIMIT 1";
                $teacherStmt = $db->prepare($teacherQuery);
                $teacherStmt->execute([$schoolId]);
                $teacher = $teacherStmt->fetch(PDO::FETCH_ASSOC);

                if ($teacher) {
                    $createdBy = $teacher['id'];
                } else {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'message' => 'No teachers found. Please add a teacher first.']);
                    exit;
                }
            }

            // Insert exam - use total_score from user input
            $query = "INSERT INTO cbt_exams
                      (school_id, subject, class, session, term, exam_title, assessment_type,
                       total_questions, total_marks, total_score, duration_minutes, instructions, created_by,
                       shuffle_questions, shuffle_options, show_results_immediately,
                       start_datetime, end_datetime)
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            $stmt = $db->prepare($query);
            $stmt->execute([
                $schoolId,
                $subject,
                $className,
                $session,
                $term,
                $examTitle,
                $assessmentType,
                $totalQuestions,
                $totalScore, // total_marks field - use total_score
                $totalScore, // total_score field
                $durationMinutes,
                $instructions,
                $createdBy,
                $shuffleQuestions,
                $shuffleOptions,
                $showResults,
                $startDatetime,
                $endDatetime
            ]);

            $examId = $db->lastInsertId();

            // Add questions to exam if provided
            if (!empty($questions)) {
                // Calculate marks per question based on total_score
                $perQuestionMarks = $totalScore / count($questions);

                $questionQuery = "INSERT INTO cbt_exam_questions (exam_id, question_id, question_order, marks)
                                  VALUES (?, ?, ?, ?)";
                $questionStmt = $db->prepare($questionQuery);

                foreach ($questions as $index => $questionId) {
                    $questionStmt->execute([$examId, $questionId, $index + 1, $perQuestionMarks]);
                }
            }

            $db->commit();

            echo json_encode([
                'success' => true,
                'message' => 'Exam created successfully',
                'exam_id' => $examId
            ]);
            break;

        case 'PUT':
            // Update an existing exam
            $input = json_decode(file_get_contents('php://input'), true);

            $examId = intval($input['id'] ?? 0);
            $action = $input['action'] ?? 'update'; // update, publish, add_questions, assign_students

            if (!$examId) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Exam ID is required']);
                exit;
            }

            // Verify ownership (school admins can edit all exams in their school)
            if ($isTeacher) {
                $checkQuery = "SELECT * FROM cbt_exams WHERE id = ? AND school_id = ? AND created_by = ?";
                $checkStmt = $db->prepare($checkQuery);
                $checkStmt->execute([$examId, $schoolId, $userId]);
            } else {
                $checkQuery = "SELECT * FROM cbt_exams WHERE id = ? AND school_id = ?";
                $checkStmt = $db->prepare($checkQuery);
                $checkStmt->execute([$examId, $schoolId]);
            }
            $exam = $checkStmt->fetch(PDO::FETCH_ASSOC);

            if (!$exam) {
                http_response_code(403);
                echo json_encode(['success' => false, 'message' => 'Exam not found or access denied']);
                exit;
            }

            switch ($action) {
                case 'update':
                    // Update exam details
                    $examTitle = trim($input['exam_title'] ?? $exam['exam_title']);
                    $instructions = trim($input['instructions'] ?? $exam['instructions']);
                    $durationMinutes = intval($input['duration_minutes'] ?? $exam['duration_minutes']);
                    $totalScore = floatval($input['total_score'] ?? $exam['total_score']);
                    $shuffleQuestions = intval($input['shuffle_questions'] ?? $exam['shuffle_questions']);
                    $shuffleOptions = intval($input['shuffle_options'] ?? $exam['shuffle_options']);
                    $showResults = intval($input['show_results_immediately'] ?? $exam['show_results_immediately']);
                    $startDatetime = $input['start_datetime'] ?? $exam['start_datetime'];
                    $endDatetime = $input['end_datetime'] ?? $exam['end_datetime'];

                    $query = "UPDATE cbt_exams
                              SET exam_title = ?, instructions = ?, duration_minutes = ?, total_score = ?, total_marks = ?,
                                  shuffle_questions = ?, shuffle_options = ?, show_results_immediately = ?,
                                  start_datetime = ?, end_datetime = ?, updated_at = NOW()
                              WHERE id = ?";
                    $stmt = $db->prepare($query);
                    $stmt->execute([
                        $examTitle, $instructions, $durationMinutes, $totalScore, $totalScore,
                        $shuffleQuestions, $shuffleOptions, $showResults,
                        $startDatetime, $endDatetime, $examId
                    ]);

                    echo json_encode(['success' => true, 'message' => 'Exam updated successfully']);
                    break;

                case 'add_questions':
                    // Add/replace questions in exam
                    $questions = $input['questions'] ?? [];

                    if (empty($questions)) {
                        http_response_code(400);
                        echo json_encode(['success' => false, 'message' => 'Questions array is required']);
                        exit;
                    }

                    $db->beginTransaction();

                    // Get exam's total_score to distribute across questions
                    $examScoreQuery = "SELECT total_score FROM cbt_exams WHERE id = ?";
                    $examScoreStmt = $db->prepare($examScoreQuery);
                    $examScoreStmt->execute([$examId]);
                    $examScore = $examScoreStmt->fetchColumn();

                    // Remove existing questions
                    $deleteQuery = "DELETE FROM cbt_exam_questions WHERE exam_id = ?";
                    $deleteStmt = $db->prepare($deleteQuery);
                    $deleteStmt->execute([$examId]);

                    // Calculate marks per question based on exam's total_score
                    // Use floor to round down, then add remainder to last question
                    $questionCount = count($questions);
                    $perQuestionMarks = floor(($examScore / $questionCount) * 100) / 100; // Round down to 2 decimals
                    $remainder = $examScore - ($perQuestionMarks * $questionCount);

                    // Add new questions with distributed marks
                    $questionQuery = "INSERT INTO cbt_exam_questions (exam_id, question_id, question_order, marks)
                                      VALUES (?, ?, ?, ?)";
                    $questionStmt = $db->prepare($questionQuery);

                    foreach ($questions as $index => $questionId) {
                        // Add remainder to last question to ensure total equals exactly total_score
                        $marks = ($index === $questionCount - 1)
                            ? $perQuestionMarks + $remainder
                            : $perQuestionMarks;
                        $questionStmt->execute([$examId, $questionId, $index + 1, $marks]);
                    }

                    // Update total_marks to match total_score (honor user's setting)
                    $updateMarksQuery = "UPDATE cbt_exams SET total_marks = total_score WHERE id = ?";
                    $updateMarksStmt = $db->prepare($updateMarksQuery);
                    $updateMarksStmt->execute([$examId]);

                    $db->commit();

                    echo json_encode([
                        'success' => true,
                        'message' => 'Questions added successfully',
                        'total_marks' => $examScore,
                        'marks_per_question' => $perQuestionMarks
                    ]);
                    break;

                case 'assign_students':
                    // Assign exam to students
                    $studentIds = $input['student_ids'] ?? [];

                    if (empty($studentIds)) {
                        http_response_code(400);
                        echo json_encode(['success' => false, 'message' => 'Student IDs are required']);
                        exit;
                    }

                    $db->beginTransaction();

                    $assignQuery = "INSERT IGNORE INTO cbt_exam_assignments (exam_id, student_id)
                                    VALUES (?, ?)";
                    $assignStmt = $db->prepare($assignQuery);

                    $assigned = 0;
                    foreach ($studentIds as $studentId) {
                        $assignStmt->execute([$examId, $studentId]);
                        $assigned += $assignStmt->rowCount();
                    }

                    $db->commit();

                    echo json_encode([
                        'success' => true,
                        'message' => "Exam assigned to {$assigned} students",
                        'assigned_count' => $assigned
                    ]);
                    break;

                case 'publish':
                    // Publish the exam
                    // Check if exam has questions
                    $countQuery = "SELECT COUNT(*) as question_count FROM cbt_exam_questions WHERE exam_id = ?";
                    $countStmt = $db->prepare($countQuery);
                    $countStmt->execute([$examId]);
                    $count = $countStmt->fetch(PDO::FETCH_ASSOC);

                    if ($count['question_count'] == 0) {
                        http_response_code(400);
                        echo json_encode(['success' => false, 'message' => 'Cannot publish exam without questions']);
                        exit;
                    }

                    // Check if exam has assigned students
                    $assignQuery = "SELECT COUNT(*) as student_count FROM cbt_exam_assignments WHERE exam_id = ?";
                    $assignStmt = $db->prepare($assignQuery);
                    $assignStmt->execute([$examId]);
                    $assignCount = $assignStmt->fetch(PDO::FETCH_ASSOC);

                    if ($assignCount['student_count'] == 0) {
                        http_response_code(400);
                        echo json_encode(['success' => false, 'message' => 'Cannot publish exam without assigned students']);
                        exit;
                    }

                    $query = "UPDATE cbt_exams SET is_published = 1, published_at = NOW() WHERE id = ?";
                    $stmt = $db->prepare($query);
                    $stmt->execute([$examId]);

                    echo json_encode(['success' => true, 'message' => 'Exam published successfully']);
                    break;

                default:
                    http_response_code(400);
                    echo json_encode(['success' => false, 'message' => 'Invalid action']);
                    break;
            }
            break;

        case 'DELETE':
            // Delete an exam
            $examId = intval($_GET['id'] ?? 0);

            if (!$examId) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Exam ID is required']);
                exit;
            }

            // Verify ownership (school admins can delete all exams in their school)
            if ($isTeacher) {
                $checkQuery = "SELECT is_published FROM cbt_exams WHERE id = ? AND school_id = ? AND created_by = ?";
                $checkStmt = $db->prepare($checkQuery);
                $checkStmt->execute([$examId, $schoolId, $userId]);
            } else {
                $checkQuery = "SELECT is_published FROM cbt_exams WHERE id = ? AND school_id = ?";
                $checkStmt = $db->prepare($checkQuery);
                $checkStmt->execute([$examId, $schoolId]);
            }
            $exam = $checkStmt->fetch(PDO::FETCH_ASSOC);

            if (!$exam) {
                http_response_code(403);
                echo json_encode(['success' => false, 'message' => 'Exam not found or access denied']);
                exit;
            }

            if ($exam['is_published']) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Cannot delete published exams']);
                exit;
            }

            // Delete exam (related records will be deleted by CASCADE)
            $query = "DELETE FROM cbt_exams WHERE id = ?";
            $stmt = $db->prepare($query);
            $stmt->execute([$examId]);

            echo json_encode(['success' => true, 'message' => 'Exam deleted successfully']);
            break;

        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'Method not allowed']);
            break;
    }

} catch (PDOException $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
} catch (Exception $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>
