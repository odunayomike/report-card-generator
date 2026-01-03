<?php
if (!isset($_SESSION['user_type']) || !isset($_SESSION['school_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized. Please login.']);
    exit;
}

$userType = $_SESSION['user_type'];
$schoolId = $_SESSION['school_id'];

$database = new Database();
$db = $database->getConnection();

$id = isset($_GET['id']) ? intval($_GET['id']) : 0;

if ($id <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid ID']);
    exit();
}

try {
    $reportData = null;
    $isNewFormat = false;

    $checkNewQuery = "SELECT rc.*, sc.school_name, sc.address as school_address, sc.phone as school_phone, sc.email as school_email, sc.logo as school_logo
                      FROM report_cards rc
                      LEFT JOIN schools sc ON rc.school_id = sc.id
                      WHERE rc.id = :id AND rc.school_id = :school_id";
    $stmt = $db->prepare($checkNewQuery);
    $stmt->execute([':id' => $id, ':school_id' => $schoolId]);
    $reportData = $stmt->fetch();

    if ($reportData) {
        $isNewFormat = true;
    } else {
        $checkOldQuery = "SELECT s.*, sc.school_name, sc.address as school_address, sc.phone as school_phone, sc.email as school_email, sc.logo as school_logo
                          FROM students s
                          LEFT JOIN schools sc ON s.school_id = sc.id
                          WHERE s.id = :id AND s.school_id = :school_id";
        $stmt = $db->prepare($checkOldQuery);
        $stmt->execute([':id' => $id, ':school_id' => $schoolId]);
        $reportData = $stmt->fetch();
    }

    if (!$reportData) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Report not found']);
        exit();
    }

    if ($userType === 'teacher') {
        $verifyQuery = "SELECT id FROM teacher_classes
                        WHERE teacher_id = ?
                        AND TRIM(LOWER(class_name)) = LOWER(?)
                        AND TRIM(LOWER(session)) = LOWER(?)";
        $verifyStmt = $db->prepare($verifyQuery);
        $verifyStmt->execute([
            $_SESSION['teacher_id'],
            trim($reportData['class']),
            trim($isNewFormat ? $reportData['session'] : $reportData['session'])
        ]);

        if (!$verifyStmt->fetch()) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'You are not assigned to this student\'s class']);
            exit;
        }
    }

    if ($isNewFormat) {
        $query = "SELECT * FROM attendance WHERE report_card_id = :id";
        $stmt = $db->prepare($query);
        $stmt->execute([':id' => $id]);
        $attendance = $stmt->fetch();

        $query = "SELECT * FROM subjects WHERE report_card_id = :id";
        $stmt = $db->prepare($query);
        $stmt->execute([':id' => $id]);
        $subjects = $stmt->fetchAll();

        $query = "SELECT * FROM remarks WHERE report_card_id = :id";
        $stmt = $db->prepare($query);
        $stmt->execute([':id' => $id]);
        $remarks = $stmt->fetch();

        $studentQuery = "SELECT id FROM students WHERE admission_no = ? AND school_id = ? LIMIT 1";
        $studentStmt = $db->prepare($studentQuery);
        $studentStmt->execute([$reportData['student_admission_no'], $schoolId]);
        $studentRecord = $studentStmt->fetch();
        $studentId = $studentRecord ? $studentRecord['id'] : null;

        $affective = [];
        $psychomotor = [];
        if ($studentId) {
            $query = "SELECT * FROM affective_domain WHERE student_id = :id";
            $stmt = $db->prepare($query);
            $stmt->execute([':id' => $studentId]);
            $affective_rows = $stmt->fetchAll();
            foreach ($affective_rows as $row) {
                $affective[$row['trait_name']] = $row['rating'];
            }

            $query = "SELECT * FROM psychomotor_domain WHERE student_id = :id";
            $stmt = $db->prepare($query);
            $stmt->execute([':id' => $studentId]);
            $psychomotor_rows = $stmt->fetchAll();
            foreach ($psychomotor_rows as $row) {
                $psychomotor[$row['skill_name']] = $row['rating'];
            }
        }

        $formatted_subjects = [];
        foreach ($subjects as $subject) {
            $formatted_subjects[] = [
                'name' => $subject['subject_name'],
                'ca' => $subject['ca'],
                'exam' => $subject['exam'],
                'total' => $subject['total']
            ];
        }

        $response = [
            'success' => true,
            'data' => [
                'id' => $reportData['id'],
                'name' => $reportData['student_name'],
                'class' => $reportData['class'],
                'session' => $reportData['session'],
                'admissionNo' => $reportData['student_admission_no'],
                'term' => $reportData['term'],
                'gender' => $reportData['student_gender'],
                'height' => $reportData['height'],
                'weight' => $reportData['weight'],
                'clubSociety' => $reportData['club_society'],
                'favCol' => $reportData['fav_col'],
                'photo' => $reportData['student_photo'],
                'noOfTimesSchoolOpened' => $attendance['no_of_times_school_opened'] ?? '',
                'noOfTimesPresent' => $attendance['no_of_times_present'] ?? '',
                'noOfTimesAbsent' => $attendance['no_of_times_absent'] ?? '',
                'subjects' => $formatted_subjects,
                'affectiveDomain' => $affective,
                'psychomotorDomain' => $psychomotor,
                'teacherName' => $remarks['teacher_name'] ?? '',
                'teacherRemark' => $remarks['teacher_remark'] ?? '',
                'principalName' => $remarks['principal_name'] ?? '',
                'principalRemark' => $remarks['principal_remark'] ?? '',
                'nextTermBegins' => $remarks['next_term_begins'] ?? '',
                'schoolName' => $reportData['school_name'] ?? 'BAILEY\'S BOWEN COLLEGE',
                'schoolAddress' => $reportData['school_address'] ?? 'No 14 Davis Cole Crescent, Pineville Estate, Sunrise, Lagos State.',
                'schoolPhone' => $reportData['school_phone'] ?? '08115414915, 07034552256',
                'schoolEmail' => $reportData['school_email'] ?? 'baileysbowencollege@gmail.com',
                'schoolLogo' => $reportData['school_logo'] ?? ''
            ]
        ];
    } else {
        $query = "SELECT * FROM attendance WHERE student_id = :id";
        $stmt = $db->prepare($query);
        $stmt->execute([':id' => $id]);
        $attendance = $stmt->fetch();

        $query = "SELECT * FROM subjects WHERE student_id = :id";
        $stmt = $db->prepare($query);
        $stmt->execute([':id' => $id]);
        $subjects = $stmt->fetchAll();

        $query = "SELECT * FROM affective_domain WHERE student_id = :id";
        $stmt = $db->prepare($query);
        $stmt->execute([':id' => $id]);
        $affective_rows = $stmt->fetchAll();

        $affective = [];
        foreach ($affective_rows as $row) {
            $affective[$row['trait_name']] = $row['rating'];
        }

        $query = "SELECT * FROM psychomotor_domain WHERE student_id = :id";
        $stmt = $db->prepare($query);
        $stmt->execute([':id' => $id]);
        $psychomotor_rows = $stmt->fetchAll();

        $psychomotor = [];
        foreach ($psychomotor_rows as $row) {
            $psychomotor[$row['skill_name']] = $row['rating'];
        }

        $query = "SELECT * FROM remarks WHERE student_id = :id";
        $stmt = $db->prepare($query);
        $stmt->execute([':id' => $id]);
        $remarks = $stmt->fetch();

        $formatted_subjects = [];
        foreach ($subjects as $subject) {
            $formatted_subjects[] = [
                'name' => $subject['subject_name'],
                'ca' => $subject['ca'],
                'exam' => $subject['exam'],
                'total' => $subject['total']
            ];
        }

        $response = [
            'success' => true,
            'data' => [
                'id' => $reportData['id'],
                'name' => $reportData['name'],
                'class' => $reportData['class'],
                'session' => $reportData['session'],
                'admissionNo' => $reportData['admission_no'],
                'term' => $reportData['term'],
                'gender' => $reportData['gender'],
                'height' => $reportData['height'],
                'weight' => $reportData['weight'],
                'clubSociety' => $reportData['club_society'],
                'favCol' => $reportData['fav_col'],
                'photo' => $reportData['photo'],
                'noOfTimesSchoolOpened' => $attendance['no_of_times_school_opened'] ?? '',
                'noOfTimesPresent' => $attendance['no_of_times_present'] ?? '',
                'noOfTimesAbsent' => $attendance['no_of_times_absent'] ?? '',
                'subjects' => $formatted_subjects,
                'affectiveDomain' => $affective,
                'psychomotorDomain' => $psychomotor,
                'teacherName' => $remarks['teacher_name'] ?? '',
                'teacherRemark' => $remarks['teacher_remark'] ?? '',
                'principalName' => $remarks['principal_name'] ?? '',
                'principalRemark' => $remarks['principal_remark'] ?? '',
                'nextTermBegins' => $remarks['next_term_begins'] ?? '',
                'schoolName' => $reportData['school_name'] ?? 'BAILEY\'S BOWEN COLLEGE',
                'schoolAddress' => $reportData['school_address'] ?? 'No 14 Davis Cole Crescent, Pineville Estate, Sunrise, Lagos State.',
                'schoolPhone' => $reportData['school_phone'] ?? '08115414915, 07034552256',
                'schoolEmail' => $reportData['school_email'] ?? 'baileysbowencollege@gmail.com',
                'schoolLogo' => $reportData['school_logo'] ?? ''
            ]
        ];
    }

    http_response_code(200);
    echo json_encode($response);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error retrieving report card: ' . $e->getMessage()
    ]);
}
