<?php
/**
 * Check Session Route Handler
 * Supports both school and teacher authentication
 */

$database = new Database();
$db = $database->getConnection();

if (isset($_SESSION['user_type'])) {
    $userType = $_SESSION['user_type'];

    if ($userType === 'school' && isset($_SESSION['school_id'])) {
        // Fetch complete school data from database
        $query = "SELECT id, school_name, email, phone, address, logo, motto, primary_color, secondary_color FROM schools WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->execute([':id' => $_SESSION['school_id']]);
        $school = $stmt->fetch();

        if ($school) {
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
                    'secondary_color' => $school['secondary_color']
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
        // Fetch teacher data
        $query = "SELECT t.id, t.name, t.email, t.phone, s.school_name
                  FROM teachers t
                  INNER JOIN schools s ON t.school_id = s.id
                  WHERE t.id = :id AND t.is_active = TRUE";
        $stmt = $db->prepare($query);
        $stmt->execute([':id' => $_SESSION['teacher_id']]);
        $teacher = $stmt->fetch();

        if ($teacher) {
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
                    'school_id' => $_SESSION['school_id'],
                    'school_name' => $teacher['school_name']
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
