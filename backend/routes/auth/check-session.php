<?php
/**
 * Check Session Route Handler
 */

if (isset($_SESSION['school_id'])) {
    // Fetch complete school data from database
    $database = new Database();
    $db = $database->getConnection();

    $query = "SELECT id, school_name, email, phone, address, logo, motto, primary_color, secondary_color FROM schools WHERE id = :id";
    $stmt = $db->prepare($query);
    $stmt->execute([':id' => $_SESSION['school_id']]);
    $school = $stmt->fetch();

    if ($school) {
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'authenticated' => true,
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
} else {
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'authenticated' => false
    ]);
}
