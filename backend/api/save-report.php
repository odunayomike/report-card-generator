<?php
/**
 * Save Report Card API Endpoint
 * Saves a complete report card to the database
 */

require_once '../config/cors.php';
require_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

// Get posted data
$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid data provided']);
    exit();
}

try {
    // Start transaction
    $db->beginTransaction();

    // Insert student data
    $query = "INSERT INTO students (school_id, name, class, session, admission_no, term, gender, height, weight, club_society, fav_col, photo)
              VALUES (:school_id, :name, :class, :session, :admission_no, :term, :gender, :height, :weight, :club_society, :fav_col, :photo)";

    $stmt = $db->prepare($query);
    $stmt->execute([
        ':school_id' => $data['school_id'] ?? 1,
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

    // Insert attendance data
    if (isset($data['noOfTimesSchoolOpened'])) {
        $query = "INSERT INTO attendance (student_id, no_of_times_school_opened, no_of_times_present, no_of_times_absent)
                  VALUES (:student_id, :opened, :present, :absent)";

        $stmt = $db->prepare($query);
        $stmt->execute([
            ':student_id' => $student_id,
            ':opened' => $data['noOfTimesSchoolOpened'] ?? 0,
            ':present' => $data['noOfTimesPresent'] ?? 0,
            ':absent' => $data['noOfTimesAbsent'] ?? 0
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
