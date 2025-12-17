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

// If teacher, verify they are assigned to this class
if ($userType === 'teacher') {
    $className = $data['class'] ?? '';
    $session = $data['session'] ?? '';
    $term = $data['term'] ?? '';

    if (empty($className) || empty($session) || empty($term)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Class, session, and term are required']);
        exit;
    }

    $verifyQuery = "SELECT id FROM teacher_classes
                    WHERE teacher_id = ? AND class_name = ? AND session = ? AND term = ?";
    $verifyStmt = $db->prepare($verifyQuery);
    $verifyStmt->execute([$_SESSION['teacher_id'], $className, $session, $term]);

    if (!$verifyStmt->fetch()) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'You are not assigned to this class']);
        exit;
    }
}

try {
    // Start transaction
    $db->beginTransaction();

    // Check if a report already exists for this student, session, and term
    $checkQuery = "SELECT id FROM students
                   WHERE school_id = :school_id
                   AND admission_no = :admission_no
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
        // UPDATE existing report
        $student_id = $existingReport['id'];

        $query = "UPDATE students
                  SET name = :name, class = :class, gender = :gender,
                      height = :height, weight = :weight,
                      club_society = :club_society, fav_col = :fav_col,
                      photo = :photo, updated_at = CURRENT_TIMESTAMP
                  WHERE id = :id";

        $stmt = $db->prepare($query);
        $stmt->execute([
            ':id' => $student_id,
            ':name' => $data['name'] ?? '',
            ':class' => $data['class'] ?? '',
            ':gender' => $data['gender'] ?? '',
            ':height' => $data['height'] ?? '',
            ':weight' => $data['weight'] ?? '',
            ':club_society' => $data['clubSociety'] ?? '',
            ':fav_col' => $data['favCol'] ?? '',
            ':photo' => $data['photo'] ?? null
        ]);

        // Delete existing related data before re-inserting
        $db->prepare("DELETE FROM attendance WHERE student_id = ?")->execute([$student_id]);
        $db->prepare("DELETE FROM subjects WHERE student_id = ?")->execute([$student_id]);
        $db->prepare("DELETE FROM affective_domain WHERE student_id = ?")->execute([$student_id]);
        $db->prepare("DELETE FROM psychomotor_domain WHERE student_id = ?")->execute([$student_id]);
        $db->prepare("DELETE FROM remarks WHERE student_id = ?")->execute([$student_id]);

    } else {
        // INSERT new report
        $query = "INSERT INTO students (school_id, name, class, session, admission_no, term, gender, height, weight, club_society, fav_col, photo)
                  VALUES (:school_id, :name, :class, :session, :admission_no, :term, :gender, :height, :weight, :club_society, :fav_col, :photo)";

        $stmt = $db->prepare($query);
        $stmt->execute([
            ':school_id' => $schoolId,
            ':name' => $data['name'] ?? '',
            ':class' => $data['class'] ?? '',
            ':session' => $data['session'] ?? '',
            ':admission_no' => $data['admissionNo'] ?? '',
            ':term' => $data['term'] ?? '',
            ':gender' => $data['gender'] ?? '',
            ':height' => $data['height'] ?? '',
            ':weight' => $data['weight'] ?? '',
            ':club_society' => $data['clubSociety'] ?? '',
            ':fav_col' => $data['favCol'] ?? '',
            ':photo' => $data['photo'] ?? null
        ]);

        $student_id = $db->lastInsertId();
    }

    // Insert attendance data
    if (isset($data['noOfTimesSchoolOpened'])) {
        $query = "INSERT INTO attendance (student_id, no_of_times_school_opened, no_of_times_present, no_of_times_absent)
                  VALUES (:student_id, :opened, :present, :absent)";

        $stmt = $db->prepare($query);

        // Convert empty strings to 0 for integer fields
        $opened = ($data['noOfTimesSchoolOpened'] ?? '') === '' ? 0 : intval($data['noOfTimesSchoolOpened']);
        $present = ($data['noOfTimesPresent'] ?? '') === '' ? 0 : intval($data['noOfTimesPresent']);
        $absent = ($data['noOfTimesAbsent'] ?? '') === '' ? 0 : intval($data['noOfTimesAbsent']);

        $stmt->execute([
            ':student_id' => $student_id,
            ':opened' => $opened,
            ':present' => $present,
            ':absent' => $absent
        ]);
    }

    // Insert subjects
    if (isset($data['subjects']) && is_array($data['subjects'])) {
        $query = "INSERT INTO subjects (student_id, subject_name, ca, exam, total, grade, remark)
                  VALUES (:student_id, :subject_name, :ca, :exam, :total, :grade, :remark)";

        $stmt = $db->prepare($query);

        foreach ($data['subjects'] as $subject) {
            if (isset($subject['total']) && $subject['total'] !== '') {
                // Calculate grade and remark
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
                    ':student_id' => $student_id,
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

    // Insert remarks
    if (isset($data['teacherName']) || isset($data['principalName'])) {
        $query = "INSERT INTO remarks (student_id, teacher_name, teacher_remark, principal_name, principal_remark, next_term_begins)
                  VALUES (:student_id, :teacher_name, :teacher_remark, :principal_name, :principal_remark, :next_term_begins)";

        $stmt = $db->prepare($query);
        $stmt->execute([
            ':student_id' => $student_id,
            ':teacher_name' => $data['teacherName'] ?? '',
            ':teacher_remark' => $data['teacherRemark'] ?? '',
            ':principal_name' => $data['principalName'] ?? '',
            ':principal_remark' => $data['principalRemark'] ?? '',
            ':next_term_begins' => $data['nextTermBegins'] ?? date('Y-m-d')
        ]);
    }

    // Commit transaction
    $db->commit();

    http_response_code(201);
    echo json_encode([
        'success' => true,
        'message' => 'Report card saved successfully',
        'student_id' => $student_id
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
