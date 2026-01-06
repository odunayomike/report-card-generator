<?php
/**
 * Export Students to CSV
 */

// Check if user is authenticated
if (!isset($_SESSION['school_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Not authenticated']);
    exit;
}

try {
    $school_id = $_SESSION['school_id'];

    // Get database connection
    $database = new Database();
    $db = $database->getConnection();

    // Get all students for this school
    $query = "SELECT
                s.admission_no,
                s.name,
                s.gender,
                s.current_class,
                s.guardian_email
              FROM students s
              WHERE s.school_id = ?
              ORDER BY s.current_class, s.name";

    $stmt = $db->prepare($query);
    $stmt->execute([$school_id]);
    $students = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Set headers for CSV download
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="students_export_' . date('Y-m-d_His') . '.csv"');
    header('Pragma: no-cache');
    header('Expires: 0');

    // Create output stream
    $output = fopen('php://output', 'w');

    // Add BOM for Excel UTF-8 support
    fprintf($output, chr(0xEF).chr(0xBB).chr(0xBF));

    // CSV Headers
    $headers = [
        'Admission No',
        'Name',
        'Gender',
        'Current Class',
        'Guardian Email'
    ];

    fputcsv($output, $headers);

    // Add student data
    foreach ($students as $student) {
        $row = [
            $student['admission_no'],
            $student['name'],
            $student['gender'],
            $student['current_class'] ?? '',
            $student['guardian_email'] ?? ''
        ];

        fputcsv($output, $row);
    }

    fclose($output);
    exit;

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
