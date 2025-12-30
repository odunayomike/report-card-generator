<?php
/**
 * Student Check Session Route Handler
 * Validates student session and checks school subscription status
 */

$database = new Database();
$db = $database->getConnection();

// Load subscription check middleware
require_once __DIR__ . '/../../middleware/subscription-check.php';

if (isset($_SESSION['user_type']) && $_SESSION['user_type'] === 'student' && isset($_SESSION['student_id'])) {
    // Fetch student data and school subscription status
    $query = "SELECT s.id, s.admission_number, s.name, s.class, s.school_id,
                     sc.school_name, sc.subscription_status, sc.subscription_end_date, sc.trial_end_date
              FROM students s
              INNER JOIN schools sc ON s.school_id = sc.id
              WHERE s.id = :id";
    $stmt = $db->prepare($query);
    $stmt->execute([':id' => $_SESSION['student_id']]);
    $student = $stmt->fetch();

    if ($student) {
        // Check school's subscription status
        $subscriptionCheck = checkSubscription($student['school_id'], $db);

        http_response_code(200);
        echo json_encode([
            'success' => true,
            'authenticated' => true,
            'user_type' => 'student',
            'student' => [
                'id' => $student['id'],
                'admission_number' => $student['admission_number'],
                'name' => $student['name'],
                'class' => $student['class'],
                'school_id' => $student['school_id'],
                'school_name' => $student['school_name']
            ],
            'subscription' => [
                'subscription_status' => $subscriptionCheck['status'],
                'subscription_end_date' => $subscriptionCheck['end_date'] ?? null,
                'trial_end_date' => $student['trial_end_date'],
                'days_remaining' => $subscriptionCheck['days_remaining'] ?? null,
                'has_access' => $subscriptionCheck['has_access']
            ]
        ]);
    } else {
        // Session exists but student not found - clear session
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
?>
