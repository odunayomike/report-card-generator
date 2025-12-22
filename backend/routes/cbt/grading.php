<?php
/**
 * CBT Auto-Grading Functions
 * Handles automatic grading of exam attempts
 * Calculates scores, updates attempts, and triggers report card integration
 */

/**
 * Grade an exam attempt
 * @param PDO $db Database connection
 * @param int $attemptId Attempt ID to grade
 * @return array Result with success status and grading details
 */
function gradeExamAttempt($db, $attemptId) {
    try {
        $db->beginTransaction();

        // Get attempt details
        $attemptQuery = "SELECT a.*, e.total_marks, e.exam_id, e.assessment_type, e.subject,
                         e.class_name, e.session, e.term, e.auto_update_report_card
                         FROM cbt_student_attempts a
                         JOIN cbt_exams e ON a.exam_id = e.id
                         WHERE a.id = ?";
        $attemptStmt = $db->prepare($attemptQuery);
        $attemptStmt->execute([$attemptId]);
        $attempt = $attemptStmt->fetch(PDO::FETCH_ASSOC);

        if (!$attempt) {
            throw new Exception('Attempt not found');
        }

        if ($attempt['is_submitted']) {
            throw new Exception('Attempt already graded');
        }

        // Get all responses with correct answers
        $responsesQuery = "SELECT r.question_id, r.selected_option_id, q.marks,
                           qo.is_correct
                           FROM cbt_student_responses r
                           JOIN cbt_questions q ON r.question_id = q.id
                           LEFT JOIN cbt_question_options qo ON r.selected_option_id = qo.id
                           WHERE r.attempt_id = ?";
        $responsesStmt = $db->prepare($responsesQuery);
        $responsesStmt->execute([$attemptId]);
        $responses = $responsesStmt->fetchAll(PDO::FETCH_ASSOC);

        // Calculate score
        $totalScore = 0;
        $correctAnswers = 0;
        $wrongAnswers = 0;

        foreach ($responses as $response) {
            if ($response['is_correct']) {
                $totalScore += $response['marks'];
                $correctAnswers++;

                // Mark response as correct
                $updateRespQuery = "UPDATE cbt_student_responses
                                    SET is_correct = 1, marks_awarded = ?
                                    WHERE attempt_id = ? AND question_id = ?";
                $updateRespStmt = $db->prepare($updateRespQuery);
                $updateRespStmt->execute([$response['marks'], $attemptId, $response['question_id']]);
            } else {
                $wrongAnswers++;

                // Mark response as incorrect
                $updateRespQuery = "UPDATE cbt_student_responses
                                    SET is_correct = 0, marks_awarded = 0
                                    WHERE attempt_id = ? AND question_id = ?";
                $updateRespStmt = $db->prepare($updateRespQuery);
                $updateRespStmt->execute([$attemptId, $response['question_id']]);
            }
        }

        // Calculate percentage
        $percentage = ($attempt['total_marks'] > 0) ? round(($totalScore / $attempt['total_marks']) * 100, 2) : 0;

        // Calculate time taken
        $startTime = strtotime($attempt['started_at']);
        $endTime = time();
        $timeTakenMinutes = round(($endTime - $startTime) / 60, 2);

        // Update attempt with results
        $updateAttemptQuery = "UPDATE cbt_student_attempts
                               SET is_submitted = 1,
                                   submitted_at = NOW(),
                                   total_score = ?,
                                   percentage = ?,
                                   correct_answers = ?,
                                   wrong_answers = ?,
                                   time_taken_minutes = ?
                               WHERE id = ?";
        $updateAttemptStmt = $db->prepare($updateAttemptQuery);
        $updateAttemptStmt->execute([
            $totalScore,
            $percentage,
            $correctAnswers,
            $wrongAnswers,
            $timeTakenMinutes,
            $attemptId
        ]);

        // Update exam assignment
        $updateAssignmentQuery = "UPDATE cbt_exam_assignments
                                  SET has_submitted = 1
                                  WHERE exam_id = ? AND student_id = ?";
        $updateAssignmentStmt = $db->prepare($updateAssignmentQuery);
        $updateAssignmentStmt->execute([$attempt['exam_id'], $attempt['student_id']]);

        // Log activity
        $logQuery = "INSERT INTO cbt_activity_log
                     (school_id, user_id, user_type, activity_type, entity_type, entity_id, description, metadata)
                     VALUES (?, ?, 'student', 'exam_submitted', 'attempt', ?, ?, ?)";
        $logStmt = $db->prepare($logQuery);
        $logStmt->execute([
            $attempt['school_id'],
            $attempt['student_id'],
            $attemptId,
            "Exam submitted with score {$totalScore}/{$attempt['total_marks']} ({$percentage}%)",
            json_encode(['score' => $totalScore, 'percentage' => $percentage])
        ]);

        // Update report card if enabled
        if ($attempt['auto_update_report_card']) {
            $reportCardResult = updateReportCardFromCBT($db, $attemptId);
            if (!$reportCardResult['success']) {
                // Log the error but don't fail the grading
                error_log("Report card update failed for attempt {$attemptId}: " . $reportCardResult['message']);
            }
        }

        $db->commit();

        return [
            'success' => true,
            'total_score' => $totalScore,
            'total_marks' => $attempt['total_marks'],
            'percentage' => $percentage,
            'correct_answers' => $correctAnswers,
            'wrong_answers' => $wrongAnswers,
            'report_card_updated' => $attempt['auto_update_report_card']
        ];

    } catch (PDOException $e) {
        if ($db->inTransaction()) {
            $db->rollBack();
        }
        return [
            'success' => false,
            'message' => 'Database error: ' . $e->getMessage()
        ];
    } catch (Exception $e) {
        if ($db->inTransaction()) {
            $db->rollBack();
        }
        return [
            'success' => false,
            'message' => $e->getMessage()
        ];
    }
}

/**
 * Recalculate assessment totals, percentage, and grade
 * This replaces the database trigger functionality
 * @param PDO $db Database connection
 * @param int $assessmentId Assessment record ID
 * @return bool Success status
 */
function recalculateAssessmentTotals($db, $assessmentId) {
    try {
        // Get current assessment data
        $query = "SELECT * FROM student_assessments WHERE id = ?";
        $stmt = $db->prepare($query);
        $stmt->execute([$assessmentId]);
        $assessment = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$assessment) {
            return false;
        }

        // Use new ca_score field (replaces ca_test_1, ca_test_2, ca_test_3, participation)
        $totalCa = floatval($assessment['ca_score'] ?? 0);

        // Calculate total score (CA + Exam)
        $examScore = floatval($assessment['exam_score'] ?? 0);
        $totalScore = $totalCa + $examScore;

        // Calculate percentage based on total possible marks (default: CA=40, Exam=60)
        $caMax = floatval($assessment['ca_max'] ?? 40);
        $examMax = floatval($assessment['exam_max'] ?? 60);
        $totalPossible = $caMax + $examMax;

        $percentage = ($totalPossible > 0) ? round(($totalScore / $totalPossible) * 100, 2) : 0;

        // Determine grade
        $grade = 'F';
        if ($percentage >= 80) {
            $grade = 'A';
        } elseif ($percentage >= 70) {
            $grade = 'B';
        } elseif ($percentage >= 60) {
            $grade = 'C';
        } elseif ($percentage >= 50) {
            $grade = 'D';
        } elseif ($percentage >= 40) {
            $grade = 'E';
        }

        // Check if complete (both CA and Exam have scores)
        $isComplete = ($totalCa > 0 && $examScore > 0) ? 1 : 0;

        // Update the record
        $updateQuery = "UPDATE student_assessments
                        SET total_ca = ?,
                            total_score = ?,
                            percentage = ?,
                            grade = ?,
                            is_complete = ?
                        WHERE id = ?";
        $updateStmt = $db->prepare($updateQuery);
        $updateStmt->execute([$totalCa, $totalScore, $percentage, $grade, $isComplete, $assessmentId]);

        return true;
    } catch (PDOException $e) {
        error_log("Recalculate totals error: " . $e->getMessage());
        return false;
    }
}

/**
 * Update student's report card with CBT score
 * @param PDO $db Database connection
 * @param int $attemptId Attempt ID
 * @return array Result with success status
 */
function updateReportCardFromCBT($db, $attemptId) {
    try {
        // Get attempt details with exam info
        $query = "SELECT a.*, e.assessment_type, e.subject, e.class, e.session, e.term
                  FROM cbt_student_attempts a
                  JOIN cbt_exams e ON a.exam_id = e.id
                  WHERE a.id = ?";
        $stmt = $db->prepare($query);
        $stmt->execute([$attemptId]);
        $attempt = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$attempt) {
            throw new Exception('Attempt not found');
        }

        // Find or create subject record in the subjects table (the active report card system)
        $subjectQuery = "SELECT * FROM subjects
                         WHERE student_id = ? AND subject_name = ?";
        $subjectStmt = $db->prepare($subjectQuery);
        $subjectStmt->execute([
            $attempt['student_id'],
            $attempt['subject']
        ]);
        $subjectRecord = $subjectStmt->fetch(PDO::FETCH_ASSOC);

        if (!$subjectRecord) {
            // Create new subject record
            $createQuery = "INSERT INTO subjects (student_id, subject_name, ca, exam, total, grade, remark)
                            VALUES (?, ?, 0, 0, 0, 'F', '')";
            $createStmt = $db->prepare($createQuery);
            $createStmt->execute([
                $attempt['student_id'],
                $attempt['subject']
            ]);
            $subjectId = $db->lastInsertId();

            // Fetch the newly created record
            $subjectRecord = [
                'id' => $subjectId,
                'ca' => 0,
                'exam' => 0,
                'total' => 0
            ];
        } else {
            $subjectId = $subjectRecord['id'];
        }

        // Determine which field to update and calculate totals
        $newCa = floatval($subjectRecord['ca']);
        $newExam = floatval($subjectRecord['exam']);

        // Only 'exam' type updates exam score, everything else updates ca score
        if ($attempt['assessment_type'] === 'exam') {
            $newExam = floatval($attempt['total_score']);
        } else {
            // For 'ca' and any custom assessment types (quiz, project, etc.)
            $newCa = floatval($attempt['total_score']);
        }

        // Calculate total and grade
        $total = $newCa + $newExam;
        $percentage = ($total / 100) * 100; // Assuming out of 100

        $grade = 'F';
        if ($percentage >= 80) {
            $grade = 'A';
        } elseif ($percentage >= 70) {
            $grade = 'B';
        } elseif ($percentage >= 60) {
            $grade = 'C';
        } elseif ($percentage >= 50) {
            $grade = 'D';
        } elseif ($percentage >= 40) {
            $grade = 'E';
        }

        $remark = '';
        if ($percentage >= 80) {
            $remark = 'EXCELLENT';
        } elseif ($percentage >= 70) {
            $remark = 'VERY GOOD';
        } elseif ($percentage >= 60) {
            $remark = 'GOOD';
        } elseif ($percentage >= 50) {
            $remark = 'FAIR';
        } elseif ($percentage >= 40) {
            $remark = 'PASS';
        } else {
            $remark = 'FAIL';
        }

        // Update the subject record
        $updateQuery = "UPDATE subjects
                        SET ca = ?, exam = ?, total = ?, grade = ?, remark = ?
                        WHERE id = ?";
        $updateStmt = $db->prepare($updateQuery);
        $updateStmt->execute([$newCa, $newExam, $total, $grade, $remark, $subjectId]);

        // Mark the attempt as pushed to report card
        $markPushedQuery = "UPDATE cbt_student_attempts
                            SET pushed_to_report_card = 1, pushed_at = NOW()
                            WHERE id = ?";
        $markPushedStmt = $db->prepare($markPushedQuery);
        $markPushedStmt->execute([$attemptId]);

        // Log the report card update
        $logQuery = "INSERT INTO cbt_activity_log
                     (school_id, user_id, user_type, activity_type, entity_type, entity_id, description, metadata)
                     VALUES (?, ?, 'student', 'score_pushed_to_report', 'attempt', ?, ?, ?)";
        $logStmt = $db->prepare($logQuery);
        $logStmt->execute([
            $attempt['school_id'],
            $attempt['student_id'],
            $attemptId,
            "CBT score pushed to report card for {$attempt['subject']}",
            json_encode([
                'assessment_type' => $attempt['assessment_type'],
                'score' => $attempt['total_score'],
                'subject' => $attempt['subject'],
                'ca' => $newCa,
                'exam' => $newExam,
                'total' => $total,
                'grade' => $grade
            ])
        ]);

        return [
            'success' => true,
            'message' => 'Report card updated successfully',
            'subject_id' => $subjectId,
            'subject' => $attempt['subject'],
            'ca' => $newCa,
            'exam' => $newExam,
            'total' => $total,
            'grade' => $grade
        ];

    } catch (PDOException $e) {
        return [
            'success' => false,
            'message' => 'Database error: ' . $e->getMessage()
        ];
    } catch (Exception $e) {
        return [
            'success' => false,
            'message' => $e->getMessage()
        ];
    }
}

/**
 * Manually trigger report card update for an exam
 * Useful if auto-update was disabled during exam submission
 * @param PDO $db Database connection
 * @param int $attemptId Attempt ID
 * @return array Result with success status
 */
function manualReportCardUpdate($db, $attemptId) {
    return updateReportCardFromCBT($db, $attemptId);
}

// If this file is called directly as an API endpoint
if (!isset($_SESSION['user_type'])) {
    // Session not started, file included as library
    return;
}

// API endpoint for manual report card updates (teacher only)
if ($_SESSION['user_type'] === 'teacher' && isset($_POST['action']) && $_POST['action'] === 'update_report_card') {
    $attemptId = intval($_POST['attempt_id'] ?? 0);

    if (!$attemptId) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Attempt ID is required']);
        exit;
    }

    $database = new Database();
    $db = $database->getConnection();

    $result = manualReportCardUpdate($db, $attemptId);

    if ($result['success']) {
        echo json_encode($result);
    } else {
        http_response_code(500);
        echo json_encode($result);
    }
    exit;
}
?>
