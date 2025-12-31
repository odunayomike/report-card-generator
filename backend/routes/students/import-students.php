<?php
/**
 * Smart Student Import from CSV
 * Supports auto-detection of column formats
 */

// Check if user is authenticated
if (!isset($_SESSION['school_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Not authenticated']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

try {
    $school_id = $_SESSION['school_id'];

    // Handle two phases: 1) Preview/Detect, 2) Confirm Import
    $phase = $_POST['phase'] ?? 'preview';

    if ($phase === 'preview') {
        // Phase 1: Upload file, detect columns, return preview

        if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'No file uploaded or upload error']);
            exit;
        }

        $file = $_FILES['file'];
        $filePath = $file['tmp_name'];

        // Validate file type
        $allowedMimes = ['text/csv', 'text/plain', 'application/csv', 'application/vnd.ms-excel'];
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $filePath);
        finfo_close($finfo);

        // Also check extension
        $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        if (!in_array($mimeType, $allowedMimes) && $extension !== 'csv') {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid file type. Please upload a CSV file.']);
            exit;
        }

        // Read CSV file
        $handle = fopen($filePath, 'r');
        if (!$handle) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to read file']);
            exit;
        }

        // Get headers from first row
        $headers = fgetcsv($handle);
        if (!$headers) {
            fclose($handle);
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'CSV file is empty']);
            exit;
        }

        // Clean headers (remove BOM, trim whitespace)
        $headers = array_map(function($header) {
            return trim(preg_replace('/[\x00-\x1F\x7F]|\xEF\xBB\xBF/', '', $header));
        }, $headers);

        // Auto-detect column mappings
        $mappings = autoDetectColumns($headers);

        // Read preview data (first 5 rows)
        $previewData = [];
        $rowCount = 0;
        while (($row = fgetcsv($handle)) !== false && $rowCount < 5) {
            $previewData[] = $row;
            $rowCount++;
        }

        // Count total rows
        while (fgetcsv($handle) !== false) {
            $rowCount++;
        }
        fclose($handle);

        // Save file temporarily for the import phase
        $tempDir = __DIR__ . '/../../temp/';
        if (!file_exists($tempDir)) {
            mkdir($tempDir, 0755, true);
        }

        $tempFileName = 'import_' . $school_id . '_' . time() . '.csv';
        $tempFilePath = $tempDir . $tempFileName;
        move_uploaded_file($filePath, $tempFilePath);

        echo json_encode([
            'success' => true,
            'phase' => 'preview',
            'headers' => $headers,
            'mappings' => $mappings,
            'previewData' => $previewData,
            'totalRows' => $rowCount,
            'tempFile' => $tempFileName
        ]);

    } elseif ($phase === 'import') {
        // Phase 2: Perform actual import with confirmed mappings

        $tempFileName = $_POST['tempFile'] ?? '';
        $mappings = json_decode($_POST['mappings'] ?? '{}', true);

        if (!$tempFileName || !$mappings) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Missing import data']);
            exit;
        }

        $tempFilePath = __DIR__ . '/../../temp/' . $tempFileName;
        if (!file_exists($tempFilePath)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Import file not found. Please re-upload.']);
            exit;
        }

        // Get database connection
        $database = new Database();
        $db = $database->getConnection();

        // Read and import CSV
        $handle = fopen($tempFilePath, 'r');
        $headers = fgetcsv($handle); // Skip header row

        // Clean headers
        $headers = array_map(function($header) {
            return trim(preg_replace('/[\x00-\x1F\x7F]|\xEF\xBB\xBF/', '', $header));
        }, $headers);

        $imported = 0;
        $skipped = 0;
        $errors = [];

        $db->beginTransaction();

        try {
            while (($row = fgetcsv($handle)) !== false) {
                // Map row data to our fields
                $studentData = mapRowToStudent($row, $headers, $mappings);

                // Validate required fields
                if (empty($studentData['name'])) {
                    $skipped++;
                    $errors[] = "Row " . ($imported + $skipped + 2) . ": Name is required";
                    continue;
                }

                // Generate admission number if not provided
                if (empty($studentData['admission_no'])) {
                    $studentData['admission_no'] = generateAdmissionNo($db, $school_id);
                }

                // Check if student already exists
                $checkQuery = "SELECT id FROM students WHERE school_id = ? AND admission_no = ?";
                $checkStmt = $db->prepare($checkQuery);
                $checkStmt->execute([$school_id, $studentData['admission_no']]);

                if ($checkStmt->fetch()) {
                    $skipped++;
                    $errors[] = "Row " . ($imported + $skipped + 2) . ": Student with admission no {$studentData['admission_no']} already exists";
                    continue;
                }

                // Insert student
                $insertQuery = "INSERT INTO students (
                    school_id, admission_no, name, gender, class, session, term,
                    guardian_email, height, weight, club_society, fav_col, created_at
                ) VALUES (
                    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW()
                )";

                $insertStmt = $db->prepare($insertQuery);
                $insertStmt->execute([
                    $school_id,
                    $studentData['admission_no'],
                    $studentData['name'],
                    $studentData['gender'] ?? 'MALE',
                    $studentData['class'] ?? '',
                    $studentData['session'] ?? date('Y') . '/' . (date('Y') + 1),
                    $studentData['term'] ?? 'First Term',
                    $studentData['guardian_email'] ?? null,
                    $studentData['height'] ?? null,
                    $studentData['weight'] ?? null,
                    $studentData['club_society'] ?? null,
                    $studentData['fav_col'] ?? null
                ]);

                $imported++;
            }

            $db->commit();
            fclose($handle);

            // Delete temp file
            unlink($tempFilePath);

            echo json_encode([
                'success' => true,
                'phase' => 'complete',
                'imported' => $imported,
                'skipped' => $skipped,
                'errors' => array_slice($errors, 0, 10), // Return first 10 errors
                'totalErrors' => count($errors)
            ]);

        } catch (Exception $e) {
            $db->rollBack();
            fclose($handle);
            throw $e;
        }
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Import error: ' . $e->getMessage()
    ]);
}

/**
 * Auto-detect column mappings based on header names
 */
function autoDetectColumns($headers) {
    $mappings = [];

    // Define detection patterns for each field
    $patterns = [
        'admission_no' => ['admission', 'admission no', 'admission number', 'reg no', 'registration', 'student id', 'id', 'number'],
        'name' => ['name', 'student name', 'full name', 'fullname'],
        'gender' => ['gender', 'sex'],
        'class' => ['class', 'current class', 'grade', 'level'],
        'session' => ['session', 'academic session', 'school session', 'year'],
        'term' => ['term', 'semester', 'period'],
        'guardian_email' => ['guardian email', 'parent email', 'guardian e-mail', 'parent e-mail', 'email'],
        'height' => ['height', 'student height'],
        'weight' => ['weight', 'student weight'],
        'club_society' => ['club', 'society', 'club/society', 'club society', 'organization'],
        'fav_col' => ['favourite color', 'favorite color', 'fav color', 'colour', 'color']
    ];

    foreach ($headers as $index => $header) {
        $headerLower = strtolower(trim($header));

        foreach ($patterns as $field => $keywords) {
            foreach ($keywords as $keyword) {
                if (strpos($headerLower, $keyword) !== false || $headerLower === $keyword) {
                    $mappings[$index] = $field;
                    break 2; // Break both loops
                }
            }
        }

        // If no mapping found, set as unmapped
        if (!isset($mappings[$index])) {
            $mappings[$index] = null;
        }
    }

    return $mappings;
}

/**
 * Map CSV row to student data array
 */
function mapRowToStudent($row, $headers, $mappings) {
    $student = [];

    foreach ($mappings as $columnIndex => $fieldName) {
        if ($fieldName && isset($row[$columnIndex])) {
            $value = trim($row[$columnIndex]);
            if ($value !== '') {
                $student[$fieldName] = $value;
            }
        }
    }

    return $student;
}

/**
 * Generate unique admission number
 */
function generateAdmissionNo($db, $school_id) {
    $year = date('Y');
    $prefix = 'STU' . substr($year, -2);

    // Get the last admission number for this school
    $query = "SELECT admission_no FROM students
              WHERE school_id = ? AND admission_no LIKE ?
              ORDER BY admission_no DESC LIMIT 1";
    $stmt = $db->prepare($query);
    $stmt->execute([$school_id, $prefix . '%']);
    $last = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($last) {
        $lastNum = intval(substr($last['admission_no'], -4));
        $newNum = $lastNum + 1;
    } else {
        $newNum = 1;
    }

    return $prefix . str_pad($newNum, 4, '0', STR_PAD_LEFT);
}
