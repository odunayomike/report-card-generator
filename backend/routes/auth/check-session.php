<?php
/**
 * Check Session Route Handler
 * Supports both school and teacher authentication
 */

$database = new Database();
$db = $database->getConnection();

// Load subscription check middleware
require_once __DIR__ . '/../../middleware/subscription-check.php';

if (isset($_SESSION['user_type'])) {
    $userType = $_SESSION['user_type'];

    if ($userType === 'school' && isset($_SESSION['school_id'])) {
        // Fetch complete school data from database
        $query = "SELECT id, school_name, email, phone, address, logo, motto, primary_color, secondary_color,
                         subscription_status, subscription_end_date, trial_end_date, assessment_types, available_subjects,
                         ca_max_marks, exam_max_marks, onboarding_completed
                  FROM schools WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->execute([':id' => $_SESSION['school_id']]);
        $school = $stmt->fetch();

        if ($school) {
            // Check subscription status
            $subscriptionCheck = checkSubscription($school['id'], $db);

            // Parse assessment_types JSON
            $assessmentTypes = ['CA', 'Exam']; // Default
            if (!empty($school['assessment_types'])) {
                $decoded = json_decode($school['assessment_types'], true);
                if (is_array($decoded)) {
                    $assessmentTypes = $decoded;
                }
            }

            // Parse available_subjects JSON
            $availableSubjects = [];
            if (!empty($school['available_subjects'])) {
                $decoded = json_decode($school['available_subjects'], true);
                if (is_array($decoded)) {
                    $availableSubjects = $decoded;
                }
            }

            http_response_code(200);
            echo json_encode([
                'success' => true,
                'authenticated' => true,
                'user_type' => 'school',
                'school' => [
                    'id' => $school['id'],
                    'school_name' => $school['school_name'],
                    'email' => $school['email'],
                    'phone' => $school['phone'],
                    'address' => $school['address'],
                    'logo' => $school['logo'],
                    'motto' => $school['motto'],
                    'primary_color' => $school['primary_color'],
                    'secondary_color' => $school['secondary_color'],
                    'assessment_types' => $assessmentTypes,
                    'available_subjects' => $availableSubjects,
                    'ca_max_marks' => $school['ca_max_marks'] ?? 40,
                    'exam_max_marks' => $school['exam_max_marks'] ?? 60,
                    'subscription_status' => $subscriptionCheck['status'],
                    'subscription_end_date' => $subscriptionCheck['end_date'] ?? null,
                    'trial_end_date' => $school['trial_end_date'],
                    'days_remaining' => $subscriptionCheck['days_remaining'] ?? null,
                    'has_access' => $subscriptionCheck['has_access'],
                    'onboarding_completed' => (bool)$school['onboarding_completed']
                ]
            ]);
        } else {
            // Session exists but school not found - clear session
            session_destroy();
            http_response_code(200);
            echo json_encode([
                'success' => true,
                'authenticated' => false
            ]);
        }
    } elseif ($userType === 'teacher' && isset($_SESSION['teacher_id'])) {
        // Fetch teacher data and school settings
        $query = "SELECT t.id, t.name, t.email, t.phone, s.school_name, s.id as school_id,
                         s.assessment_types, s.available_subjects, s.ca_max_marks, s.exam_max_marks
                  FROM teachers t
                  INNER JOIN schools s ON t.school_id = s.id
                  WHERE t.id = :id AND t.is_active = TRUE";
        $stmt = $db->prepare($query);
        $stmt->execute([':id' => $_SESSION['teacher_id']]);
        $teacher = $stmt->fetch();

        if ($teacher) {
            // Check school's subscription status
            $subscriptionCheck = checkSubscription($teacher['school_id'], $db);

            // Parse assessment_types JSON
            $assessmentTypes = ['CA', 'Exam']; // Default
            if (!empty($teacher['assessment_types'])) {
                $decoded = json_decode($teacher['assessment_types'], true);
                if (is_array($decoded)) {
                    $assessmentTypes = $decoded;
                }
            }

            // Parse available_subjects JSON
            $availableSubjects = [];
            if (!empty($teacher['available_subjects'])) {
                $decoded = json_decode($teacher['available_subjects'], true);
                if (is_array($decoded)) {
                    $availableSubjects = $decoded;
                }
            }

            http_response_code(200);
            echo json_encode([
                'success' => true,
                'authenticated' => true,
                'user_type' => 'teacher',
                'user' => [
                    'id' => $teacher['id'],
                    'name' => $teacher['name'],
                    'email' => $teacher['email'],
                    'phone' => $teacher['phone'],
                    'school_id' => $teacher['school_id'],
                    'school_name' => $teacher['school_name']
                ],
                'school' => [
                    'id' => $teacher['school_id'],
                    'school_name' => $teacher['school_name'],
                    'assessment_types' => $assessmentTypes,
                    'available_subjects' => $availableSubjects,
                    'ca_max_marks' => $teacher['ca_max_marks'] ?? 40,
                    'exam_max_marks' => $teacher['exam_max_marks'] ?? 60,
                    'subscription_status' => $subscriptionCheck['status'],
                    'subscription_end_date' => $subscriptionCheck['end_date'] ?? null,
                    'days_remaining' => $subscriptionCheck['days_remaining'] ?? null,
                    'has_access' => $subscriptionCheck['has_access']
                ]
            ]);
        } else {
            // Session exists but teacher not found - clear session
            session_destroy();
            http_response_code(200);
            echo json_encode([
                'success' => true,
                'authenticated' => false
            ]);
        }
    } else {
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'authenticated' => false
        ]);
    }
} else {
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'authenticated' => false
    ]);
}
