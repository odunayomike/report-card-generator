<?php
/**
 * Search Students by Name or Admission Number
 * Returns students matching the search query for autocomplete
 */

// Check authentication
if (!isset($_SESSION['user_type']) || !isset($_SESSION['school_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized - Please log in']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$schoolId = $_SESSION['school_id'];
$query = isset($_GET['q']) ? trim($_GET['q']) : '';

if (strlen($query) < 1) {
    echo json_encode(['success' => true, 'students' => []]);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();

    // Search by name or admission number in master students table
    $searchQuery = "SELECT
                        s.id,
                        s.name,
                        s.admission_no,
                        s.current_class,
                        s.gender,
                        s.guardian_email,
                        p.name as parent_name,
                        p.phone as parent_phone,
                        ps.relationship as parent_relationship
                    FROM students s
                    LEFT JOIN parent_students ps ON s.id = ps.student_id AND ps.is_primary = TRUE
                    LEFT JOIN parents p ON ps.parent_id = p.id
                    WHERE s.school_id = ?
                    AND (s.name LIKE ? OR s.admission_no LIKE ?)
                    ORDER BY s.name ASC
                    LIMIT 20";

    $stmt = $db->prepare($searchQuery);
    $searchTerm = "%{$query}%";
    $stmt->execute([$schoolId, $searchTerm, $searchTerm]);
    $students = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'students' => array_map(function($student) {
            return [
                'id' => (int)$student['id'],
                'name' => $student['name'],
                'admission_no' => $student['admission_no'],
                'current_class' => $student['current_class'],
                'gender' => $student['gender'],
                'guardian_email' => $student['guardian_email'],
                'parent_name' => $student['parent_name'],
                'parent_phone' => $student['parent_phone'],
                'parent_relationship' => $student['parent_relationship'] ?? 'guardian'
            ];
        }, $students)
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
