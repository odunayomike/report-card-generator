<?php
/**
 * Public External Student Registration
 * Allows parents to register their children for entrance examinations
 * This is a public endpoint accessible without authentication
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../utils/SimpleEmailService.php';

try {
    $input = json_decode(file_get_contents('php://input'), true);

    // Support both school_id and school_slug
    $schoolId = isset($input['school_id']) ? intval($input['school_id']) : null;
    $schoolSlug = isset($input['school_slug']) ? trim($input['school_slug']) : null;

    if (!$schoolId && !$schoolSlug) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'School ID or slug is required'
        ]);
        exit;
    }

    // Validate required fields
    $requiredFields = ['name', 'applying_for_class', 'parent_name', 'parent_phone'];
    foreach ($requiredFields as $field) {
        if (!isset($input[$field]) || empty(trim($input[$field]))) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => ucfirst(str_replace('_', ' ', $field)) . ' is required'
            ]);
            exit;
        }
    }

    // Extract and validate input
    $name = trim($input['name']);
    $email = isset($input['email']) ? trim($input['email']) : null;
    $phone = isset($input['phone']) ? trim($input['phone']) : null;
    $dateOfBirth = isset($input['date_of_birth']) ? $input['date_of_birth'] : null;
    $gender = isset($input['gender']) ? strtoupper($input['gender']) : null;
    $address = isset($input['address']) ? trim($input['address']) : null;
    $applyingForClass = trim($input['applying_for_class']);
    $previousSchool = isset($input['previous_school']) ? trim($input['previous_school']) : null;

    // Parent information
    $parentName = trim($input['parent_name']);
    $parentEmail = isset($input['parent_email']) ? trim($input['parent_email']) : null;
    $parentPhone = trim($input['parent_phone']);
    $parentRelationship = isset($input['parent_relationship']) ? $input['parent_relationship'] : 'father';

    // Notes
    $notes = isset($input['notes']) ? trim($input['notes']) : null;

    // Validate email format if provided
    if ($email && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid email format']);
        exit;
    }

    if ($parentEmail && !filter_var($parentEmail, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid parent email format']);
        exit;
    }

    // Validate gender
    if ($gender && !in_array($gender, ['MALE', 'FEMALE'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Gender must be MALE or FEMALE']);
        exit;
    }

    // Validate parent relationship
    if (!in_array($parentRelationship, ['father', 'mother', 'guardian'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid parent relationship']);
        exit;
    }

    $database = new Database();
    $db = $database->getConnection();

    // Verify school exists and is active (support both ID and slug lookup)
    if ($schoolSlug) {
        $schoolQuery = "SELECT id, school_name, email, registration_slug FROM schools WHERE registration_slug = ?";
        $schoolStmt = $db->prepare($schoolQuery);
        $schoolStmt->execute([$schoolSlug]);
    } else {
        $schoolQuery = "SELECT id, school_name, email, registration_slug FROM schools WHERE id = ?";
        $schoolStmt = $db->prepare($schoolQuery);
        $schoolStmt->execute([$schoolId]);
    }

    $school = $schoolStmt->fetch(PDO::FETCH_ASSOC);

    if (!$school) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'School not found']);
        exit;
    }

    // Set schoolId from fetched school if it was looked up by slug
    if (!$schoolId) {
        $schoolId = $school['id'];
    }

    // Check for duplicate registration (same parent phone for same school)
    $duplicateQuery = "SELECT id, exam_code FROM external_students
                       WHERE school_id = ? AND parent_phone = ? AND status != 'converted'";
    $duplicateStmt = $db->prepare($duplicateQuery);
    $duplicateStmt->execute([$schoolId, $parentPhone]);
    $existingStudent = $duplicateStmt->fetch(PDO::FETCH_ASSOC);

    if ($existingStudent) {
        http_response_code(409);
        echo json_encode([
            'success' => false,
            'message' => 'A registration with this parent phone number already exists',
            'existing_exam_code' => $existingStudent['exam_code']
        ]);
        exit;
    }

    // Generate unique exam code
    $examCode = generateExamCode($db, $schoolId);

    // Generate default password
    $defaultPassword = 'EXT' . substr($parentPhone, -4);
    $passwordHash = password_hash($defaultPassword, PASSWORD_DEFAULT);

    // Insert external student
    $query = "INSERT INTO external_students (
        school_id, name, email, phone, date_of_birth, gender, address,
        applying_for_class, previous_school,
        parent_name, parent_email, parent_phone, parent_relationship,
        exam_code, password_hash, status, created_by, notes
    ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?
    )";

    $stmt = $db->prepare($query);
    $stmt->execute([
        $schoolId, $name, $email, $phone, $dateOfBirth, $gender, $address,
        $applyingForClass, $previousSchool,
        $parentName, $parentEmail, $parentPhone, $parentRelationship,
        $examCode, $passwordHash, $schoolId, $notes // created_by = school_id for public registrations
    ]);

    $externalStudentId = $db->lastInsertId();

    // Log activity
    logActivity($db, $externalStudentId, $schoolId, 'enrollment', "Public registration: $name", $_SERVER['REMOTE_ADDR'] ?? null);

    // Return success with credentials immediately (don't wait for email)
    http_response_code(201);
    echo json_encode([
        'success' => true,
        'message' => 'Registration successful! Please save your credentials.' . ($parentEmail ? ' Check your email for login details.' : ''),
        'data' => [
            'school_name' => $school['school_name'],
            'student_name' => $name,
            'exam_code' => $examCode,
            'password' => $defaultPassword,
            'login_url' => 'https://schoolhub.tech/external-student/login',
            'email_will_be_sent' => !empty($parentEmail)
        ]
    ]);

    // Flush output to send response immediately
    if (function_exists('fastcgi_finish_request')) {
        fastcgi_finish_request();
    } else {
        // For non-FPM environments
        if (ob_get_level() > 0) {
            ob_end_flush();
        }
        flush();
    }

    // Now send email asynchronously (after response is sent)
    if ($parentEmail) {
        try {
            $emailService = new SimpleEmailService();
            $loginUrl = 'https://schoolhub.tech/external-student/login';

            $emailSent = $emailService->sendRegistrationEmail(
                $parentEmail,
                $name,
                $school['school_name'],
                $school['email'], // School's email address
                $examCode,
                $defaultPassword,
                $loginUrl
            );

            if ($emailSent) {
                // Log email sent activity
                logActivity($db, $externalStudentId, $schoolId, 'email_sent', "Registration email sent to $parentEmail", $_SERVER['REMOTE_ADDR'] ?? null);
            }
        } catch (Exception $e) {
            // Log email failure but don't fail the registration
            error_log("Failed to send registration email: " . $e->getMessage());
            logActivity($db, $externalStudentId, $schoolId, 'email_failed', "Failed to send email to $parentEmail: " . $e->getMessage(), $_SERVER['REMOTE_ADDR'] ?? null);
        }
    }

    // Exit to prevent any further output
    exit;

} catch (PDOException $e) {
    error_log("External student registration error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Registration failed. Please try again later.'
    ]);
    exit;
}

/**
 * Generate unique exam code for external student
 */
function generateExamCode($db, $schoolId) {
    $year = date('Y');
    $attempts = 0;
    $maxAttempts = 10;

    do {
        $random = str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);
        $examCode = "EXT-{$year}-{$schoolId}-{$random}";

        $checkQuery = "SELECT id FROM external_students WHERE exam_code = ?";
        $stmt = $db->prepare($checkQuery);
        $stmt->execute([$examCode]);

        if ($stmt->rowCount() === 0) {
            return $examCode;
        }

        $attempts++;
    } while ($attempts < $maxAttempts);

    throw new Exception('Failed to generate unique exam code');
}

/**
 * Log activity for external student
 */
function logActivity($db, $externalStudentId, $schoolId, $activityType, $details, $ipAddress = null) {
    $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? null;

    $query = "INSERT INTO external_student_activity_log
              (external_student_id, school_id, activity_type, details, ip_address, user_agent)
              VALUES (?, ?, ?, ?, ?, ?)";

    $stmt = $db->prepare($query);
    $stmt->execute([$externalStudentId, $schoolId, $activityType, $details, $ipAddress, $userAgent]);
}
