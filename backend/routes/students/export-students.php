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

    // Get all students for this school with latest class per admission_no
    $query = "SELECT
                s.admission_no,
                s.name,
                s.gender,
                s.class,
                s.session,
                s.term,
                s.guardian_email,
                s.height,
                s.weight,
                s.club_society,
                s.fav_col
              FROM students s
              INNER JOIN (
                  SELECT admission_no, MAX(created_at) as latest
                  FROM students
                  WHERE school_id = ?
                  GROUP BY admission_no
              ) latest_students
              ON s.admission_no = latest_students.admission_no
              AND s.created_at = latest_students.latest
              WHERE s.school_id = ?
              ORDER BY s.class, s.name";

    $stmt = $db->prepare($query);
    $stmt->execute([$school_id, $school_id]);
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
        'Class',
        'Session',
        'Term',
        'Guardian Email',
        'Height',
        'Weight',
        'Club/Society',
        'Favourite Color'
    ];

    fputcsv($output, $headers);

    // Add student data
    foreach ($students as $student) {
        $row = [
            $student['admission_no'],
            $student['name'],
            $student['gender'],
            $student['class'],
            $student['session'],
            $student['term'],
            $student['guardian_email'] ?? '',
            $student['height'] ?? '',
            $student['weight'] ?? '',
            $student['club_society'] ?? '',
            $student['fav_col'] ?? ''
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
