<?php
/**
 * CBT Student Exams Route
 * Handles student exam taking, submission, and results viewing
 * Students can view assigned exams, take exams, and see results
 */

// Set timezone to match local time (West Africa Time - Lagos)
date_default_timezone_set('Africa/Lagos');

// Check if student is authenticated
if (!isset($_SESSION['user_type']) || $_SESSION['user_type'] !== 'student' || !isset($_SESSION['student_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized - Student access required']);
    exit;
}

$database = new Database();
$db = $database->getConnection();

// Set MySQL timezone to match server timezone
try {
    $db->exec("SET time_zone = '+01:00'"); // West Africa Time (WAT) is UTC+1
} catch (Exception $e) {
    // If setting timezone fails, continue anyway
}

$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET':
            $action = $_GET['action'] ?? 'list'; // list, start, results

            switch ($action) {
                case 'list':
                    // Get all exams assigned to this student
                    $query = "SELECT e.*, ea.has_submitted,
                              NOW() as server_time,
                              CASE
                                  WHEN ea.has_submitted = 1 THEN 'completed'
                                  WHEN NOW() < e.start_datetime THEN 'upcoming'
                                  WHEN NOW() > e.end_datetime THEN 'expired'
                                  ELSE 'available'
                              END as status
                              FROM cbt_exam_assignments ea
                              JOIN cbt_exams e ON ea.exam_id = e.id
                              WHERE ea.student_id = ? AND e.is_published = 1
                              ORDER BY e.start_datetime DESC";
                    $stmt = $db->prepare($query);
                    $stmt->execute([$_SESSION['student_id']]);
                    $exams = $stmt->fetchAll(PDO::FETCH_ASSOC);

                    // Debug: log the times
                    foreach ($exams as &$exam) {
                        error_log("Exam: {$exam['exam_title']}, Server: {$exam['server_time']}, Start: {$exam['start_datetime']}, End: {$exam['end_datetime']}, Status: {$exam['status']}");
                    }

                    echo json_encode([
                        'success' => true,
                        'exams' => $exams,
                        'total' => count($exams)
                    ]);
                    break;

                case 'start':
                    // Start an exam - get questions
                    $examId = intval($_GET['exam_id'] ?? 0);

                    if (!$examId) {
                        http_response_code(400);
                        echo json_encode(['success' => false, 'message' => 'Exam ID is required']);
                        exit;
                    }

                    // Check if student is assigned to this exam
                    $assignQuery = "SELECT ea.*, e.*
                                    FROM cbt_exam_assignments ea
                                    JOIN cbt_exams e ON ea.exam_id = e.id
                                    WHERE ea.exam_id = ? AND ea.student_id = ? AND e.is_published = 1";
                    $assignStmt = $db->prepare($assignQuery);
                    $assignStmt->execute([$examId, $_SESSION['student_id']]);
                    $assignment = $assignStmt->fetch(PDO::FETCH_ASSOC);

                    if (!$assignment) {
                        http_response_code(403);
                        echo json_encode(['success' => false, 'message' => 'Exam not found or not assigned to you']);
                        exit;
                    }

                    // Check if already submitted
                    if ($assignment['has_submitted']) {
                        http_response_code(400);
                        echo json_encode(['success' => false, 'message' => 'You have already submitted this exam']);
                        exit;
                    }

                    // Check if exam has started
                    if ($assignment['start_datetime'] && strtotime($assignment['start_datetime']) > time()) {
                        http_response_code(400);
                        echo json_encode(['success' => false, 'message' => 'Exam has not started yet']);
                        exit;
                    }

                    // Check if exam has ended
                    if ($assignment['end_datetime'] && strtotime($assignment['end_datetime']) < time()) {
                        http_response_code(400);
                        echo json_encode(['success' => false, 'message' => 'Exam has ended']);
                        exit;
                    }

                    // Create or get existing attempt
                    $attemptQuery = "SELECT id FROM cbt_student_attempts
                                     WHERE exam_id = ? AND student_id = ? AND status = 'in_progress'
                                     ORDER BY id DESC LIMIT 1";
                    $attemptStmt = $db->prepare($attemptQuery);
                    $attemptStmt->execute([$examId, $_SESSION['student_id']]);
                    $attempt = $attemptStmt->fetch(PDO::FETCH_ASSOC);

                    if (!$attempt) {
                        // Create new attempt
                        $createAttemptQuery = "INSERT INTO cbt_student_attempts
                                              (exam_id, student_id, attempt_number, started_at, status)
                                              VALUES (?, ?, 1, NOW(), 'in_progress')";
                        $createAttemptStmt = $db->prepare($createAttemptQuery);
                        $createAttemptStmt->execute([$examId, $_SESSION['student_id']]);
                        $attemptId = $db->lastInsertId();
                    } else {
                        $attemptId = $attempt['id'];
                    }

                    // Get questions for this exam
                    $questionsQuery = "SELECT q.id, q.question_text, q.question_type, q.marks,
                                       qo.id as option_id, qo.option_text, qo.option_label
                                       FROM cbt_exam_questions eq
                                       JOIN cbt_questions q ON eq.question_id = q.id
                                       LEFT JOIN cbt_question_options qo ON q.id = qo.question_id
                                       WHERE eq.exam_id = ?
                                       ORDER BY " . ($assignment['shuffle_questions'] ? "RAND()" : "eq.question_order") . ", qo.option_label";
                    $questionsStmt = $db->prepare($questionsQuery);
                    $questionsStmt->execute([$examId]);
                    $results = $questionsStmt->fetchAll(PDO::FETCH_ASSOC);

                    // Format questions with options
                    $questions = [];
                    foreach ($results as $row) {
                        $qId = $row['id'];
                        if (!isset($questions[$qId])) {
                            $questions[$qId] = [
                                'id' => $row['id'],
                                'question_text' => $row['question_text'],
                                'question_type' => $row['question_type'],
                                'marks' => $row['marks'],
                                'options' => []
                            ];
                        }
                        if ($row['option_id']) {
                            $questions[$qId]['options'][] = [
                                'id' => $row['option_id'],
                                'text' => $row['option_text']
                            ];
                        }
                    }

                    // Shuffle options if enabled
                    if ($assignment['shuffle_options']) {
                        foreach ($questions as &$question) {
                            shuffle($question['options']);
                        }
                    }

                    // Get previously saved answers for this attempt
                    $answersQuery = "SELECT question_id, selected_option_id
                                     FROM cbt_student_responses
                                     WHERE attempt_id = ?";
                    $answersStmt = $db->prepare($answersQuery);
                    $answersStmt->execute([$attemptId]);
                    $savedAnswers = $answersStmt->fetchAll(PDO::FETCH_ASSOC);

                    $answerMap = [];
                    foreach ($savedAnswers as $ans) {
                        $answerMap[$ans['question_id']] = $ans['selected_option_id'];
                    }

                    echo json_encode([
                        'success' => true,
                        'attempt_id' => $attemptId,
                        'exam' => [
                            'id' => $examId,
                            'title' => $assignment['exam_title'],
                            'subject' => $assignment['subject'],
                            'instructions' => $assignment['instructions'],
                            'total_marks' => $assignment['total_marks'],
                            'duration_minutes' => $assignment['duration_minutes'],
                            'shuffle_questions' => $assignment['shuffle_questions'],
                            'shuffle_options' => $assignment['shuffle_options'],
                            'show_results_immediately' => $assignment['show_results_immediately'],
                            'started_at' => date('Y-m-d H:i:s') // Current time as start time
                        ],
                        'questions' => array_values($questions),
                        'saved_answers' => $answerMap
                    ]);
                    break;

                case 'results':
                    // Get exam results
                    $examId = intval($_GET['exam_id'] ?? 0);

                    if (!$examId) {
                        http_response_code(400);
                        echo json_encode(['success' => false, 'message' => 'Exam ID is required']);
                        exit;
                    }

                    // Get assignment with results
                    $query = "SELECT ea.*, e.exam_title, e.subject, e.total_marks, e.show_results_immediately
                              FROM cbt_exam_assignments ea
                              JOIN cbt_exams e ON ea.exam_id = e.id
                              WHERE ea.exam_id = ? AND ea.student_id = ?";
                    $stmt = $db->prepare($query);
                    $stmt->execute([$examId, $_SESSION['student_id']]);
                    $assignment = $stmt->fetch(PDO::FETCH_ASSOC);

                    if (!$assignment) {
                        http_response_code(404);
                        echo json_encode(['success' => false, 'message' => 'Results not found']);
                        exit;
                    }

                    if (!$assignment['has_submitted']) {
                        http_response_code(400);
                        echo json_encode(['success' => false, 'message' => 'Exam not yet submitted']);
                        exit;
                    }

                    // Get the latest attempt for this exam
                    $attemptQuery = "SELECT * FROM cbt_student_attempts
                                     WHERE exam_id = ? AND student_id = ? AND status = 'submitted'
                                     ORDER BY submitted_at DESC LIMIT 1";
                    $attemptStmt = $db->prepare($attemptQuery);
                    $attemptStmt->execute([$examId, $_SESSION['student_id']]);
                    $attempt = $attemptStmt->fetch(PDO::FETCH_ASSOC);

                    if (!$attempt) {
                        http_response_code(404);
                        echo json_encode(['success' => false, 'message' => 'No submitted attempt found']);
                        exit;
                    }

                    // Calculate stats from this attempt's answers
                    $statsQuery = "SELECT
                                   COUNT(*) as total_questions,
                                   SUM(is_correct) as correct_answers,
                                   SUM(marks_awarded) as total_score
                                   FROM cbt_student_responses
                                   WHERE attempt_id = ?";
                    $statsStmt = $db->prepare($statsQuery);
                    $statsStmt->execute([$attempt['id']]);
                    $stats = $statsStmt->fetch(PDO::FETCH_ASSOC);

                    $wrongAnswers = $stats['total_questions'] - $stats['correct_answers'];
                    $timeTakenMinutes = round($attempt['time_taken_seconds'] / 60, 1);

                    $results = [
                        'success' => true,
                        'exam_title' => $assignment['exam_title'],
                        'subject' => $assignment['subject'],
                        'total_score' => $stats['total_score'] ?? 0,
                        'total_marks' => $assignment['total_marks'],
                        'percentage' => $attempt['percentage'] ?? 0,
                        'correct_answers' => $stats['correct_answers'] ?? 0,
                        'wrong_answers' => $wrongAnswers,
                        'total_questions' => $stats['total_questions'] ?? 0,
                        'time_taken_minutes' => $timeTakenMinutes,
                        'submitted_at' => $attempt['submitted_at']
                    ];

                    // If show results immediately is enabled, include question-by-question breakdown
                    if ($assignment['show_results_immediately']) {
                        $detailsQuery = "SELECT sa.*, q.question_text, q.marks as max_marks,
                                         selected.option_text as selected_answer,
                                         correct.option_text as correct_answer
                                         FROM cbt_student_responses sa
                                         JOIN cbt_questions q ON sa.question_id = q.id
                                         LEFT JOIN cbt_question_options selected ON sa.selected_option_id = selected.id
                                         LEFT JOIN cbt_question_options correct ON q.id = correct.question_id AND correct.is_correct = 1
                                         WHERE sa.attempt_id = ?";
                        $detailsStmt = $db->prepare($detailsQuery);
                        $detailsStmt->execute([$attempt['id']]);
                        $details = $detailsStmt->fetchAll(PDO::FETCH_ASSOC);

                        // Format details with correct field names for frontend
                        $results['question_details'] = array_map(function($detail) {
                            return [
                                'question_text' => $detail['question_text'],
                                'is_correct' => $detail['is_correct'],
                                'selected_answer' => $detail['selected_answer'],
                                'correct_answer' => $detail['correct_answer'],
                                'marks_awarded' => $detail['marks_awarded'],
                                'marks' => $detail['max_marks']
                            ];
                        }, $details);
                    }

                    echo json_encode($results);
                    break;

                default:
                    http_response_code(400);
                    echo json_encode(['success' => false, 'message' => 'Invalid action']);
                    break;
            }
            break;

        case 'POST':
            $input = json_decode(file_get_contents('php://input'), true);
            $action = $input['action'] ?? '';

            switch ($action) {
                case 'save_answer':
                    // Save a single answer (for auto-save)
                    $attemptId = intval($input['attempt_id'] ?? 0);
                    $questionId = intval($input['question_id'] ?? 0);
                    $selectedOptionId = intval($input['selected_option_id'] ?? 0);

                    error_log("Save answer: attemptId=$attemptId, questionId=$questionId, optionId=$selectedOptionId, studentId={$_SESSION['student_id']}");

                    if (!$attemptId || !$questionId) {
                        http_response_code(400);
                        echo json_encode(['success' => false, 'message' => 'Attempt ID and Question ID are required']);
                        exit;
                    }

                    // Verify attempt belongs to this student and is in progress
                    $verifyQuery = "SELECT id, exam_id FROM cbt_student_attempts
                                    WHERE id = ? AND student_id = ? AND status = 'in_progress'";
                    $verifyStmt = $db->prepare($verifyQuery);
                    $verifyStmt->execute([$attemptId, $_SESSION['student_id']]);
                    $attemptData = $verifyStmt->fetch(PDO::FETCH_ASSOC);

                    if (!$attemptData) {
                        http_response_code(403);
                        error_log("Verification failed: attempt not found or already submitted");
                        echo json_encode(['success' => false, 'message' => 'Invalid attempt or already submitted']);
                        exit;
                    }

                    $examId = $attemptData['exam_id'];

                    // Get whether answer is correct and marks
                    if ($selectedOptionId > 0) {
                        $checkQuery = "SELECT qo.is_correct, q.marks
                                       FROM cbt_question_options qo
                                       JOIN cbt_questions q ON qo.question_id = q.id
                                       WHERE qo.id = ? AND q.id = ?";
                        $checkStmt = $db->prepare($checkQuery);
                        $checkStmt->execute([$selectedOptionId, $questionId]);
                        $option = $checkStmt->fetch(PDO::FETCH_ASSOC);

                        if (!$option) {
                            http_response_code(400);
                            error_log("Option not found: optionId=$selectedOptionId, questionId=$questionId");
                            echo json_encode(['success' => false, 'message' => 'Invalid option selected']);
                            exit;
                        }

                        $isCorrect = $option['is_correct'] ?? 0;
                        $marks = $option['marks'] ?? 0;
                        $marksObtained = $isCorrect ? $marks : 0;

                        // Check if response already exists
                        $existsQuery = "SELECT id FROM cbt_student_responses
                                        WHERE attempt_id = ? AND question_id = ?";
                        $existsStmt = $db->prepare($existsQuery);
                        $existsStmt->execute([$attemptId, $questionId]);
                        $existing = $existsStmt->fetch(PDO::FETCH_ASSOC);

                        if ($existing) {
                            // Update existing response
                            $updateQuery = "UPDATE cbt_student_responses
                                           SET selected_option_id = ?, is_correct = ?, marks_awarded = ?
                                           WHERE id = ?";
                            $updateStmt = $db->prepare($updateQuery);
                            $updateStmt->execute([$selectedOptionId, $isCorrect, $marksObtained, $existing['id']]);
                            error_log("Answer updated successfully");
                        } else {
                            // Insert new response
                            $insertQuery = "INSERT INTO cbt_student_responses
                                           (exam_id, student_id, attempt_id, question_id, selected_option_id, is_correct, marks_awarded, max_marks)
                                           VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
                            $insertStmt = $db->prepare($insertQuery);
                            $insertStmt->execute([
                                $examId, $_SESSION['student_id'], $attemptId, $questionId, $selectedOptionId, $isCorrect, $marksObtained, $marks
                            ]);
                            error_log("Answer inserted successfully");
                        }
                    }

                    echo json_encode(['success' => true, 'message' => 'Answer saved']);
                    break;

                case 'submit':
                    // Submit the exam
                    $attemptId = intval($input['attempt_id'] ?? 0);
                    $answers = $input['answers'] ?? []; // {question_id: option_id}

                    if (!$attemptId) {
                        http_response_code(400);
                        echo json_encode(['success' => false, 'message' => 'Attempt ID is required']);
                        exit;
                    }

                    // Verify attempt belongs to this student
                    $verifyQuery = "SELECT * FROM cbt_student_attempts
                                    WHERE id = ? AND student_id = ? AND status = 'in_progress'";
                    $verifyStmt = $db->prepare($verifyQuery);
                    $verifyStmt->execute([$attemptId, $_SESSION['student_id']]);
                    $attempt = $verifyStmt->fetch(PDO::FETCH_ASSOC);

                    if (!$attempt) {
                        http_response_code(403);
                        echo json_encode(['success' => false, 'message' => 'Invalid attempt or already submitted']);
                        exit;
                    }

                    $examId = $attempt['exam_id'];

                    $db->beginTransaction();

                    // Save all answers if not already saved
                    foreach ($answers as $questionId => $optionId) {
                        // Get whether answer is correct and marks
                        $checkQuery = "SELECT qo.is_correct, q.marks
                                       FROM cbt_question_options qo
                                       JOIN cbt_questions q ON qo.question_id = q.id
                                       WHERE qo.id = ? AND q.id = ?";
                        $checkStmt = $db->prepare($checkQuery);
                        $checkStmt->execute([$optionId, $questionId]);
                        $option = $checkStmt->fetch(PDO::FETCH_ASSOC);

                        $isCorrect = $option['is_correct'] ?? 0;
                        $marks = $option['marks'] ?? 0;
                        $marksObtained = $isCorrect ? $marks : 0;

                        // Check if response already exists
                        $existsQuery = "SELECT id FROM cbt_student_responses
                                        WHERE attempt_id = ? AND question_id = ?";
                        $existsStmt = $db->prepare($existsQuery);
                        $existsStmt->execute([$attemptId, $questionId]);
                        $existing = $existsStmt->fetch(PDO::FETCH_ASSOC);

                        if ($existing) {
                            // Update existing response
                            $updateQuery = "UPDATE cbt_student_responses
                                           SET selected_option_id = ?, is_correct = ?, marks_awarded = ?
                                           WHERE id = ?";
                            $updateStmt = $db->prepare($updateQuery);
                            $updateStmt->execute([$optionId, $isCorrect, $marksObtained, $existing['id']]);
                        } else {
                            // Insert new response
                            $insertQuery = "INSERT INTO cbt_student_responses
                                           (exam_id, student_id, attempt_id, question_id, selected_option_id, is_correct, marks_awarded, max_marks)
                                           VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
                            $insertStmt = $db->prepare($insertQuery);
                            $insertStmt->execute([
                                $examId, $_SESSION['student_id'], $attemptId, $questionId, $optionId, $isCorrect, $marksObtained, $marks
                            ]);
                        }
                    }

                    // Calculate total score and time taken
                    $scoreQuery = "SELECT SUM(marks_awarded) as total_score
                                   FROM cbt_student_responses
                                   WHERE attempt_id = ?";
                    $scoreStmt = $db->prepare($scoreQuery);
                    $scoreStmt->execute([$attemptId]);
                    $result = $scoreStmt->fetch(PDO::FETCH_ASSOC);
                    $totalScore = $result['total_score'] ?? 0;

                    // Get total marks
                    $marksQuery = "SELECT total_marks FROM cbt_exams WHERE id = ?";
                    $marksStmt = $db->prepare($marksQuery);
                    $marksStmt->execute([$examId]);
                    $exam = $marksStmt->fetch(PDO::FETCH_ASSOC);
                    $totalMarks = $exam['total_marks'] ?? 0;
                    $percentage = $totalMarks > 0 ? round(($totalScore / $totalMarks) * 100, 2) : 0;

                    // Calculate time taken
                    $timeTaken = time() - strtotime($attempt['started_at']);

                    // Update attempt as submitted
                    $updateAttemptQuery = "UPDATE cbt_student_attempts
                                          SET status = 'submitted',
                                              submitted_at = NOW(),
                                              time_taken_seconds = ?,
                                              total_score = ?,
                                              percentage = ?
                                          WHERE id = ?";
                    $updateAttemptStmt = $db->prepare($updateAttemptQuery);
                    $updateAttemptStmt->execute([$timeTaken, $totalScore, $percentage, $attemptId]);

                    // Mark assignment as submitted
                    $updateAssignmentQuery = "UPDATE cbt_exam_assignments
                                             SET has_submitted = 1
                                             WHERE exam_id = ? AND student_id = ?";
                    $updateAssignmentStmt = $db->prepare($updateAssignmentQuery);
                    $updateAssignmentStmt->execute([$examId, $_SESSION['student_id']]);

                    $db->commit();

                    echo json_encode([
                        'success' => true,
                        'message' => 'Exam submitted successfully',
                        'score' => $totalScore,
                        'total_marks' => $totalMarks,
                        'percentage' => $percentage
                    ]);
                    break;

                default:
                    http_response_code(400);
                    echo json_encode(['success' => false, 'message' => 'Invalid action']);
                    break;
            }
            break;

        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'Method not allowed']);
            break;
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>
