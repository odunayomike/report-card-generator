<?php
/**
 * Generate Unique Admission Number
 * Auto-generates admission numbers for new students
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

$database = new Database();
$db = $database->getConnection();

try {
    // Get the school information for prefix
    $schoolQuery = "SELECT school_name FROM schools WHERE id = ?";
    $schoolStmt = $db->prepare($schoolQuery);
    $schoolStmt->execute([$schoolId]);
    $school = $schoolStmt->fetch(PDO::FETCH_ASSOC);

    // Generate 2-letter prefix from school name
    $prefix = 'ST';
    if ($school && !empty($school['school_name'])) {
        $words = explode(' ', $school['school_name']);
        if (count($words) >= 2) {
            // Use first 2 initials if multiple words
            $prefix = strtoupper(substr($words[0], 0, 1) . substr($words[1], 0, 1));
        } else {
            // Use first 2 letters if single word
            $prefix = strtoupper(substr($school['school_name'], 0, 2));
        }
    }

    // Get the highest existing number for this school
    $query = "SELECT admission_no FROM students
              WHERE school_id = ?
              ORDER BY id DESC
              LIMIT 1";
    $stmt = $db->prepare($query);
    $stmt->execute([$schoolId]);
    $lastStudent = $stmt->fetch(PDO::FETCH_ASSOC);

    $nextNumber = 1;

    if ($lastStudent && !empty($lastStudent['admission_no'])) {
        // Extract number from last admission number
        $lastAdmissionNo = $lastStudent['admission_no'];

        // Try to extract the numeric part at the end
        if (preg_match('/(\d+)$/', $lastAdmissionNo, $matches)) {
            $nextNumber = intval($matches[1]) + 1;
        }
    }

    // Format: PREFIX(2) + NUMBER(4) = 6 characters total (e.g., ST0001, AB0042)
    // This allows up to 9999 students per school
    $admissionNumber = $prefix . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);

    // Check if this number already exists (just to be safe)
    $checkQuery = "SELECT id FROM students WHERE school_id = ? AND admission_no = ?";
    $checkStmt = $db->prepare($checkQuery);
    $checkStmt->execute([$schoolId, $admissionNumber]);

    // If it exists, keep incrementing until we find a unique one
    while ($checkStmt->fetch()) {
        $nextNumber++;
        $admissionNumber = $prefix . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);
        $checkStmt->execute([$schoolId, $admissionNumber]);
    }

    echo json_encode([
        'success' => true,
        'admission_number' => $admissionNumber
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
