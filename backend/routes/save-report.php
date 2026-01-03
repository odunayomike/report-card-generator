<?php
/**
 * Save Report Card Route Handler
 * Session and database already loaded in index.php
 * Supports both school and teacher access
 */

// Check authentication (either school or teacher)
if (!isset($_SESSION['user_type']) || !isset($_SESSION['school_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized - Please log in']);
    exit;
}

$userType = $_SESSION['user_type'];
$schoolId = $_SESSION['school_id'];

$database = new Database();
$db = $database->getConnection();

// Get posted data
$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid data provided']);
    exit();
}

// If teacher, verify they are assigned to this class (check class and session only, not term)
if ($userType === 'teacher') {
    $className = trim($data['class'] ?? '');
    $session = trim($data['session'] ?? '');
    $term = trim($data['term'] ?? '');

    if (empty($className) || empty($session) || empty($term)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Class, session, and term are required']);
        exit;
    }

    // Verify teacher is assigned to this class and session (term-independent)
    $verifyQuery = "SELECT id FROM teacher_classes
                    WHERE teacher_id = ?
                    AND TRIM(LOWER(class_name)) = LOWER(?)
                    AND TRIM(LOWER(session)) = LOWER(?)";
    $verifyStmt = $db->prepare($verifyQuery);
    $verifyStmt->execute([$_SESSION['teacher_id'], $className, $session]);

    if (!$verifyStmt->fetch()) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'You are not assigned to this class']);
        exit;
    }
}

try {
    // Start transaction
    $db->beginTransaction();

    // Check if student exists in master students table
    $checkStudentQuery = "SELECT id FROM students WHERE admission_no = :admission_no AND school_id = :school_id";
    $checkStudentStmt = $db->prepare($checkStudentQuery);
    $checkStudentStmt->execute([
        ':admission_no' => $data['admissionNo'] ?? '',
        ':school_id' => $schoolId
    ]);
    $existingStudent = $checkStudentStmt->fetch();

    if ($existingStudent) {
        $student_id = $existingStudent['id'];

        // Update student info with latest data
        $updateStudentQuery = "UPDATE students
                              SET name = :name,
                                  gender = :gender,
                                  current_class = :class,
                                  updated_at = CURRENT_TIMESTAMP
                              WHERE id = :id";
        $updateStudentStmt = $db->prepare($updateStudentQuery);
        $updateStudentStmt->execute([
            ':id' => $student_id,
            ':name' => $data['name'] ?? '',
            ':gender' => $data['gender'] ?? '',
            ':class' => $data['class'] ?? ''
        ]);
    } else {
        // Create new student in master table
        $insertStudentQuery = "INSERT INTO students (school_id, admission_no, name, gender, current_class)
                              VALUES (:school_id, :admission_no, :name, :gender, :class)";
        $insertStudentStmt = $db->prepare($insertStudentQuery);
        $insertStudentStmt->execute([
            ':school_id' => $schoolId,
            ':admission_no' => $data['admissionNo'] ?? '',
            ':name' => $data['name'] ?? '',
            ':gender' => $data['gender'] ?? '',
            ':class' => $data['class'] ?? ''
        ]);
        $student_id = $db->lastInsertId();
    }

    // Check if a report already exists for this student, session, and term
    $checkQuery = "SELECT id FROM report_cards
                   WHERE school_id = :school_id
                   AND student_admission_no = :admission_no
                   AND session = :session
                   AND term = :term";

    $checkStmt = $db->prepare($checkQuery);
    $checkStmt->execute([
        ':school_id' => $schoolId,
        ':admission_no' => $data['admissionNo'] ?? '',
        ':session' => $data['session'] ?? '',
        ':term' => $data['term'] ?? ''
    ]);

    $existingReport = $checkStmt->fetch();

    if ($existingReport) {
        $report_card_id = $existingReport['id'];

        $query = "UPDATE report_cards
                  SET student_id = :student_id, student_name = :name, class = :class, student_gender = :gender,
                      height = :height, weight = :weight,
                      club_society = :club_society, fav_col = :fav_col,
                      student_photo = :photo, updated_at = CURRENT_TIMESTAMP
                  WHERE id = :id";

        $stmt = $db->prepare($query);
        $stmt->execute([
            ':id' => $report_card_id,
            ':student_id' => $student_id,
            ':name' => $data['name'] ?? '',
            ':class' => $data['class'] ?? '',
            ':gender' => $data['gender'] ?? '',
            ':height' => $data['height'] ?? '',
            ':weight' => $data['weight'] ?? '',
            ':club_society' => $data['clubSociety'] ?? '',
            ':fav_col' => $data['favCol'] ?? '',
            ':photo' => $data['photo'] ?? null
        ]);

        $db->prepare("DELETE FROM attendance WHERE report_card_id = ?")->execute([$report_card_id]);
        $db->prepare("DELETE FROM subjects WHERE report_card_id = ?")->execute([$report_card_id]);
        $db->prepare("DELETE FROM affective_domain WHERE student_id = ?")->execute([$student_id]);
        $db->prepare("DELETE FROM psychomotor_domain WHERE student_id = ?")->execute([$student_id]);
        $db->prepare("DELETE FROM remarks WHERE report_card_id = ?")->execute([$report_card_id]);

    } else {
        $query = "INSERT INTO report_cards (school_id, student_id, student_admission_no, student_name, student_gender, class, session, term, height, weight, club_society, fav_col, student_photo)
                  VALUES (:school_id, :student_id, :admission_no, :name, :gender, :class, :session, :term, :height, :weight, :club_society, :fav_col, :photo)";

        $stmt = $db->prepare($query);
        $stmt->execute([
            ':school_id' => $schoolId,
            ':student_id' => $student_id,
            ':admission_no' => $data['admissionNo'] ?? '',
            ':name' => $data['name'] ?? '',
            ':gender' => $data['gender'] ?? '',
            ':class' => $data['class'] ?? '',
            ':session' => $data['session'] ?? '',
            ':term' => $data['term'] ?? '',
            ':height' => $data['height'] ?? '',
            ':weight' => $data['weight'] ?? '',
            ':club_society' => $data['clubSociety'] ?? '',
            ':fav_col' => $data['favCol'] ?? '',
            ':photo' => $data['photo'] ?? null
        ]);

        $report_card_id = $db->lastInsertId();
    }

    if (isset($data['noOfTimesSchoolOpened'])) {
        $query = "INSERT INTO attendance (report_card_id, no_of_times_school_opened, no_of_times_present, no_of_times_absent)
                  VALUES (:report_card_id, :opened, :present, :absent)";

        $stmt = $db->prepare($query);

        $opened = ($data['noOfTimesSchoolOpened'] ?? '') === '' ? 0 : intval($data['noOfTimesSchoolOpened']);
        $present = ($data['noOfTimesPresent'] ?? '') === '' ? 0 : intval($data['noOfTimesPresent']);
        $absent = ($data['noOfTimesAbsent'] ?? '') === '' ? 0 : intval($data['noOfTimesAbsent']);

        $stmt->execute([
            ':report_card_id' => $report_card_id,
            ':opened' => $opened,
            ':present' => $present,
            ':absent' => $absent
        ]);
    }

    if (isset($data['subjects']) && is_array($data['subjects'])) {
        $query = "INSERT INTO subjects (report_card_id, subject_name, ca, exam, total, grade, remark)
                  VALUES (:report_card_id, :subject_name, :ca, :exam, :total, :grade, :remark)";

        $stmt = $db->prepare($query);

        foreach ($data['subjects'] as $subject) {
            if (isset($subject['total']) && $subject['total'] !== '') {
                $total = floatval($subject['total']);
                if ($total >= 70) {
                    $grade = 'A';
                    $remark = 'EXCELLENT';
                } elseif ($total >= 60) {
                    $grade = 'B';
                    $remark = 'VERY GOOD';
                } elseif ($total >= 50) {
                    $grade = 'C';
                    $remark = 'GOOD';
                } elseif ($total >= 40) {
                    $grade = 'D';
                    $remark = 'FAIR';
                } else {
                    $grade = 'F';
                    $remark = 'FAIL';
                }

                $stmt->execute([
                    ':report_card_id' => $report_card_id,
                    ':subject_name' => $subject['name'] ?? '',
                    ':ca' => $subject['ca'] ?? 0,
                    ':exam' => $subject['exam'] ?? 0,
                    ':total' => $subject['total'] ?? 0,
                    ':grade' => $grade,
                    ':remark' => $remark
                ]);
            }
        }
    }

    // Insert affective domain
    if (isset($data['affectiveDomain']) && is_array($data['affectiveDomain'])) {
        $query = "INSERT INTO affective_domain (student_id, trait_name, rating)
                  VALUES (:student_id, :trait_name, :rating)";

        $stmt = $db->prepare($query);

        foreach ($data['affectiveDomain'] as $trait => $rating) {
            if ($rating !== '') {
                $stmt->execute([
                    ':student_id' => $student_id,
                    ':trait_name' => $trait,
                    ':rating' => intval($rating)
                ]);
            }
        }
    }

    // Insert psychomotor domain
    if (isset($data['psychomotorDomain']) && is_array($data['psychomotorDomain'])) {
        $query = "INSERT INTO psychomotor_domain (student_id, skill_name, rating)
                  VALUES (:student_id, :skill_name, :rating)";

        $stmt = $db->prepare($query);

        foreach ($data['psychomotorDomain'] as $skill => $rating) {
            if ($rating !== '') {
                $stmt->execute([
                    ':student_id' => $student_id,
                    ':skill_name' => $skill,
                    ':rating' => intval($rating)
                ]);
            }
        }
    }

    if (isset($data['teacherName']) || isset($data['principalName'])) {
        $query = "INSERT INTO remarks (report_card_id, teacher_name, teacher_remark, principal_name, principal_remark, next_term_begins)
                  VALUES (:report_card_id, :teacher_name, :teacher_remark, :principal_name, :principal_remark, :next_term_begins)";

        $stmt = $db->prepare($query);

        $nextTermBegins = $data['nextTermBegins'] ?? '';
        if (empty($nextTermBegins)) {
            $nextTermBegins = null;
        }

        $stmt->execute([
            ':report_card_id' => $report_card_id,
            ':teacher_name' => $data['teacherName'] ?? '',
            ':teacher_remark' => $data['teacherRemark'] ?? '',
            ':principal_name' => $data['principalName'] ?? '',
            ':principal_remark' => $data['principalRemark'] ?? '',
            ':next_term_begins' => $nextTermBegins
        ]);
    }

    // Commit transaction
    $db->commit();

    // Send notification to parent(s) about new report card
    try {
        require_once __DIR__ . '/../utils/NotificationHelper.php';
        $notificationHelper = new NotificationHelper($db);

        // Get parent IDs for this student
        $parentQuery = "SELECT ps.parent_id, s.id as student_id, s.name as student_name
                        FROM parent_students ps
                        INNER JOIN students s ON ps.student_id = s.id
                        WHERE s.admission_no = ? AND s.school_id = ?
                        LIMIT 1";
        $parentStmt = $db->prepare($parentQuery);
        $parentStmt->execute([$data['admissionNo'] ?? '', $schoolId]);
        $studentInfo = $parentStmt->fetch(PDO::FETCH_ASSOC);

        if ($studentInfo) {
            // Get all parents for this student
            $allParentsQuery = "SELECT parent_id FROM parent_students WHERE student_id = ?";
            $allParentsStmt = $db->prepare($allParentsQuery);
            $allParentsStmt->execute([$studentInfo['student_id']]);
            $parentIds = $allParentsStmt->fetchAll(PDO::FETCH_COLUMN);

            // Send notification to each parent
            foreach ($parentIds as $parentId) {
                $notificationHelper->notifyReportCardPublished(
                    $parentId,
                    $schoolId,
                    $studentInfo['student_id'],
                    $studentInfo['student_name'],
                    $report_card_id,
                    $data['term'] ?? '',
                    $data['session'] ?? ''
                );
            }
        }
    } catch (Exception $e) {
        // Log error but don't fail the request
        error_log('Failed to send report card notification: ' . $e->getMessage());
    }

    http_response_code(201);
    echo json_encode([
        'success' => true,
        'message' => 'Report card saved successfully',
        'report_card_id' => $report_card_id
    ]);

} catch (Exception $e) {
    // Rollback transaction on error
    $db->rollBack();

    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error saving report card: ' . $e->getMessage()
    ]);
}
?>
