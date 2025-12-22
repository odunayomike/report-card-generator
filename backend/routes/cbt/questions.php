<?php
/**
 * CBT Questions Management Route
 * Handles CRUD operations for question bank
 * Teachers can create, edit, list, and delete questions
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
            // Get all questions created by this teacher or list questions for an exam
            $examId = $_GET['exam_id'] ?? null;
            $subject = $_GET['subject'] ?? null;
            $questionType = $_GET['question_type'] ?? null;

            if ($examId) {
                // Get questions for a specific exam
                $query = "SELECT q.*, qo.option_text, qo.is_correct, qo.id as option_id, qo.option_label
                          FROM cbt_exam_questions eq
                          JOIN cbt_questions q ON eq.question_id = q.id
                          LEFT JOIN cbt_question_options qo ON q.id = qo.question_id
                          WHERE eq.exam_id = ?
                          ORDER BY eq.question_order, qo.option_label";
                $stmt = $db->prepare($query);
                $stmt->execute([$examId]);
            } else {
                // Get all questions from this teacher's question bank
                // School admins can see all questions, teachers only see their own
                if ($isTeacher) {
                    $query = "SELECT q.*, qo.id as option_id, qo.option_label, qo.option_text, qo.is_correct
                              FROM cbt_questions q
                              LEFT JOIN cbt_question_options qo ON q.id = qo.question_id
                              WHERE q.school_id = ? AND q.created_by = ?";
                    $params = [$schoolId, $userId];
                } else {
                    $query = "SELECT q.*, qo.id as option_id, qo.option_label, qo.option_text, qo.is_correct
                              FROM cbt_questions q
                              LEFT JOIN cbt_question_options qo ON q.id = qo.question_id
                              WHERE q.school_id = ?";
                    $params = [$schoolId];
                }

                if ($subject) {
                    $query .= " AND q.subject = ?";
                    $params[] = $subject;
                }

                if ($questionType) {
                    $query .= " AND q.question_type = ?";
                    $params[] = $questionType;
                }

                $query .= " ORDER BY q.created_at DESC, qo.option_label";
                $stmt = $db->prepare($query);
                $stmt->execute($params);
            }

            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Format questions with their options
            $questions = [];
            foreach ($results as $row) {
                $qId = $row['id'];
                if (!isset($questions[$qId])) {
                    $questions[$qId] = [
                        'id' => $row['id'],
                        'question_text' => $row['question_text'],
                        'question_type' => $row['question_type'],
                        'subject' => $row['subject'],
                        'class' => $row['class'],
                        'topic' => $row['topic'],
                        'difficulty' => $row['difficulty'],
                        'marks' => $row['marks'],
                        'created_at' => $row['created_at'],
                        'options' => []
                    ];
                }
                if ($row['option_id']) {
                    $questions[$qId]['options'][] = [
                        'id' => $row['option_id'],
                        'label' => $row['option_label'],
                        'text' => $row['option_text'],
                        'is_correct' => (bool)$row['is_correct']
                    ];
                }
            }
            $questions = array_values($questions);

            echo json_encode([
                'success' => true,
                'questions' => $questions,
                'total' => count($questions)
            ]);
            break;

        case 'POST':
            // Create new question(s) - supports both single and batch uploads
            $input = json_decode(file_get_contents('php://input'), true);

            // Check if this is a batch upload (array of questions) or single question
            $isBatch = isset($input['questions']) && is_array($input['questions']);
            $questionsToProcess = $isBatch ? $input['questions'] : [$input];

            // Validation helper function
            $validateQuestion = function($question) {
                $questionText = trim($question['question_text'] ?? '');
                $questionType = $question['question_type'] ?? '';
                $subject = trim($question['subject'] ?? '');
                $className = trim($question['class'] ?? '');
                $options = $question['options'] ?? [];

                if (empty($questionText) || empty($questionType) || empty($subject)) {
                    return ['valid' => false, 'message' => 'Question text, type, and subject are required'];
                }

                if (empty($className)) {
                    return ['valid' => false, 'message' => 'Class is required'];
                }

                if (!in_array($questionType, ['multiple_choice', 'true_false'])) {
                    return ['valid' => false, 'message' => 'Invalid question type'];
                }

                // For multiple choice, require at least 2 options with exactly one correct
                if ($questionType === 'multiple_choice') {
                    if (count($options) < 2) {
                        return ['valid' => false, 'message' => 'Multiple choice questions require at least 2 options'];
                    }

                    $correctCount = 0;
                    foreach ($options as $opt) {
                        if ($opt['is_correct'] ?? false) {
                            $correctCount++;
                        }
                    }

                    if ($correctCount !== 1) {
                        return ['valid' => false, 'message' => 'Exactly one option must be marked as correct'];
                    }
                }

                // For true/false, validate options
                if ($questionType === 'true_false') {
                    if (count($options) !== 2) {
                        return ['valid' => false, 'message' => 'True/False questions must have exactly 2 options'];
                    }
                }

                return ['valid' => true];
            };

            // Validate all questions first
            foreach ($questionsToProcess as $index => $question) {
                $validation = $validateQuestion($question);
                if (!$validation['valid']) {
                    http_response_code(400);
                    echo json_encode([
                        'success' => false,
                        'message' => $isBatch ? "Question #" . ($index + 1) . ": " . $validation['message'] : $validation['message']
                    ]);
                    exit;
                }
            }

            // Get created_by user
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

            // Begin transaction for all questions
            $db->beginTransaction();

            $questionIds = [];
            $successCount = 0;

            try {
                // Prepare statements
                $questionQuery = "INSERT INTO cbt_questions
                          (school_id, subject, class, question_text, question_type, topic, difficulty, marks, created_by)
                          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
                $questionStmt = $db->prepare($questionQuery);

                $optionQuery = "INSERT INTO cbt_question_options
                                (question_id, option_label, option_text, is_correct)
                                VALUES (?, ?, ?, ?)";
                $optionStmt = $db->prepare($optionQuery);

                // Option labels: A, B, C, D, E, etc.
                $labels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

                // Process each question
                foreach ($questionsToProcess as $question) {
                    $questionText = trim($question['question_text']);
                    $questionType = $question['question_type'];
                    $subject = trim($question['subject']);
                    $className = trim($question['class']);
                    $topic = trim($question['topic'] ?? '');
                    $difficulty = $question['difficulty'] ?? 'medium';
                    $marks = intval($question['marks'] ?? 1);
                    $options = $question['options'] ?? [];

                    // Insert question
                    $questionStmt->execute([
                        $schoolId,
                        $subject,
                        $className,
                        $questionText,
                        $questionType,
                        $topic,
                        $difficulty,
                        $marks,
                        $createdBy
                    ]);

                    $questionId = $db->lastInsertId();
                    $questionIds[] = $questionId;

                    // Insert options
                    if (!empty($options)) {
                        foreach ($options as $index => $option) {
                            $optionStmt->execute([
                                $questionId,
                                $labels[$index] ?? chr(65 + $index), // A, B, C, D...
                                trim($option['text']),
                                ($option['is_correct'] ?? false) ? 1 : 0
                            ]);
                        }
                    }

                    $successCount++;
                }

                $db->commit();

                if ($isBatch) {
                    echo json_encode([
                        'success' => true,
                        'message' => "Successfully created {$successCount} question(s)",
                        'question_ids' => $questionIds,
                        'count' => $successCount
                    ]);
                } else {
                    echo json_encode([
                        'success' => true,
                        'message' => 'Question created successfully',
                        'question_id' => $questionIds[0]
                    ]);
                }

            } catch (Exception $e) {
                $db->rollBack();
                throw $e;
            }
            break;

        case 'PUT':
            // Update an existing question
            $input = json_decode(file_get_contents('php://input'), true);

            $questionId = intval($input['id'] ?? 0);
            $questionText = trim($input['question_text'] ?? '');
            $topic = trim($input['topic'] ?? '');
            $difficulty = $input['difficulty'] ?? 'medium';
            $marks = intval($input['marks'] ?? 1);
            $options = $input['options'] ?? [];

            if (!$questionId) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Question ID is required']);
                exit;
            }

            // Verify ownership (school admins can edit all questions in their school)
            if ($isTeacher) {
                $checkQuery = "SELECT id FROM cbt_questions WHERE id = ? AND school_id = ? AND created_by = ?";
                $checkStmt = $db->prepare($checkQuery);
                $checkStmt->execute([$questionId, $schoolId, $userId]);
            } else {
                $checkQuery = "SELECT id FROM cbt_questions WHERE id = ? AND school_id = ?";
                $checkStmt = $db->prepare($checkQuery);
                $checkStmt->execute([$questionId, $schoolId]);
            }

            if (!$checkStmt->fetch()) {
                http_response_code(403);
                echo json_encode(['success' => false, 'message' => 'Question not found or access denied']);
                exit;
            }

            $db->beginTransaction();

            // Update question
            $query = "UPDATE cbt_questions
                      SET question_text = ?, topic = ?, difficulty = ?, marks = ?, updated_at = NOW()
                      WHERE id = ?";
            $stmt = $db->prepare($query);
            $stmt->execute([$questionText, $topic, $difficulty, $marks, $questionId]);

            // Delete existing options and re-insert
            $deleteOptQuery = "DELETE FROM cbt_question_options WHERE question_id = ?";
            $deleteOptStmt = $db->prepare($deleteOptQuery);
            $deleteOptStmt->execute([$questionId]);

            // Insert updated options
            if (!empty($options)) {
                $optionQuery = "INSERT INTO cbt_question_options
                                (question_id, option_label, option_text, is_correct)
                                VALUES (?, ?, ?, ?)";
                $optionStmt = $db->prepare($optionQuery);

                // Option labels: A, B, C, D, E, etc.
                $labels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

                foreach ($options as $index => $option) {
                    $optionStmt->execute([
                        $questionId,
                        $labels[$index] ?? chr(65 + $index), // A, B, C, D...
                        trim($option['text']),
                        ($option['is_correct'] ?? false) ? 1 : 0
                    ]);
                }
            }

            $db->commit();

            echo json_encode([
                'success' => true,
                'message' => 'Question updated successfully'
            ]);
            break;

        case 'DELETE':
            // Check if this is a bulk delete or single delete
            $input = json_decode(file_get_contents('php://input'), true);
            $isBulkDelete = isset($input['ids']) && is_array($input['ids']);

            if ($isBulkDelete) {
                // Bulk delete multiple questions
                $questionIds = array_map('intval', $input['ids']);

                if (empty($questionIds)) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'message' => 'No question IDs provided']);
                    exit;
                }

                // Verify ownership for all questions
                $placeholders = str_repeat('?,', count($questionIds) - 1) . '?';

                if ($isTeacher) {
                    $checkQuery = "SELECT id FROM cbt_questions WHERE id IN ($placeholders) AND school_id = ? AND created_by = ?";
                    $checkParams = array_merge($questionIds, [$schoolId, $userId]);
                } else {
                    $checkQuery = "SELECT id FROM cbt_questions WHERE id IN ($placeholders) AND school_id = ?";
                    $checkParams = array_merge($questionIds, [$schoolId]);
                }

                $checkStmt = $db->prepare($checkQuery);
                $checkStmt->execute($checkParams);
                $authorizedIds = $checkStmt->fetchAll(PDO::FETCH_COLUMN);

                if (count($authorizedIds) !== count($questionIds)) {
                    http_response_code(403);
                    echo json_encode(['success' => false, 'message' => 'Some questions not found or access denied']);
                    exit;
                }

                // Check if any questions are used in published exams
                $usageQuery = "SELECT COUNT(*) as usage_count
                               FROM cbt_exam_questions eq
                               JOIN cbt_exams e ON eq.exam_id = e.id
                               WHERE eq.question_id IN ($placeholders) AND e.is_published = 1";
                $usageStmt = $db->prepare($usageQuery);
                $usageStmt->execute($questionIds);
                $usage = $usageStmt->fetch(PDO::FETCH_ASSOC);

                if ($usage['usage_count'] > 0) {
                    http_response_code(400);
                    echo json_encode([
                        'success' => false,
                        'message' => 'Cannot delete questions that are used in published exams'
                    ]);
                    exit;
                }

                // Delete questions (options will be deleted by CASCADE)
                $deleteQuery = "DELETE FROM cbt_questions WHERE id IN ($placeholders)";
                $deleteStmt = $db->prepare($deleteQuery);
                $deleteStmt->execute($questionIds);

                echo json_encode([
                    'success' => true,
                    'message' => count($questionIds) . ' question(s) deleted successfully'
                ]);
            } else {
                // Single delete - use query parameter
                $questionId = intval($_GET['id'] ?? 0);

                if (!$questionId) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'message' => 'Question ID is required']);
                    exit;
                }

                // Verify ownership (school admins can edit all questions in their school)
                if ($isTeacher) {
                    $checkQuery = "SELECT id FROM cbt_questions WHERE id = ? AND school_id = ? AND created_by = ?";
                    $checkStmt = $db->prepare($checkQuery);
                    $checkStmt->execute([$questionId, $schoolId, $userId]);
                } else {
                    $checkQuery = "SELECT id FROM cbt_questions WHERE id = ? AND school_id = ?";
                    $checkStmt = $db->prepare($checkQuery);
                    $checkStmt->execute([$questionId, $schoolId]);
                }

                if (!$checkStmt->fetch()) {
                    http_response_code(403);
                    echo json_encode(['success' => false, 'message' => 'Question not found or access denied']);
                    exit;
                }

                // Check if question is used in any published exams
                $usageQuery = "SELECT COUNT(*) as usage_count
                               FROM cbt_exam_questions eq
                               JOIN cbt_exams e ON eq.exam_id = e.id
                               WHERE eq.question_id = ? AND e.is_published = 1";
                $usageStmt = $db->prepare($usageQuery);
                $usageStmt->execute([$questionId]);
                $usage = $usageStmt->fetch(PDO::FETCH_ASSOC);

                if ($usage['usage_count'] > 0) {
                    http_response_code(400);
                    echo json_encode([
                        'success' => false,
                        'message' => 'Cannot delete question that is used in published exams'
                    ]);
                    exit;
                }

                // Delete question (options will be deleted by CASCADE)
                $query = "DELETE FROM cbt_questions WHERE id = ?";
                $stmt = $db->prepare($query);
                $stmt->execute([$questionId]);

                echo json_encode([
                    'success' => true,
                    'message' => 'Question deleted successfully'
                ]);
            }
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
