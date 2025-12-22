<?php
/**
 * CBT Import Questions Route
 * Handles importing questions from PDF, DOCX, or TXT files
 */

// Check if teacher or school admin is authenticated
$isTeacher = isset($_SESSION['user_type']) && $_SESSION['user_type'] === 'teacher' && isset($_SESSION['teacher_id']);
$isSchool = isset($_SESSION['user_type']) && $_SESSION['user_type'] === 'school' && isset($_SESSION['school_id']);

if (!$isTeacher && !$isSchool) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized - Teacher or School access required']);
    exit;
}

// Set user context
$userId = $isTeacher ? $_SESSION['teacher_id'] : null;
$schoolId = $isTeacher ? $_SESSION['school_id'] : $_SESSION['school_id'];

// For school admins, get a teacher ID
if (!$userId && $isSchool) {
    $database = new Database();
    $db = $database->getConnection();
    $teacherQuery = "SELECT id FROM teachers WHERE school_id = ? LIMIT 1";
    $teacherStmt = $db->prepare($teacherQuery);
    $teacherStmt->execute([$schoolId]);
    $teacher = $teacherStmt->fetch(PDO::FETCH_ASSOC);

    if ($teacher) {
        $userId = $teacher['id'];
    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'No teachers found. Please add a teacher first.']);
        exit;
    }
}

// Check if file was uploaded
if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'No file uploaded or upload error']);
    exit;
}

$file = $_FILES['file'];
$fileName = $file['name'];
$fileTmpPath = $file['tmp_name'];
$fileExtension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));

// Validate file type - only TXT for now
$allowedExtensions = ['txt'];
if (!in_array($fileExtension, $allowedExtensions)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid file type. Only TXT files are currently supported. PDF and DOCX support coming soon.']);
    exit;
}

try {
    // Extract text from file based on type
    $text = '';

    if ($fileExtension === 'txt') {
        $text = file_get_contents($fileTmpPath);
    } elseif ($fileExtension === 'pdf') {
        // Extract text from PDF using pdftotext command or fallback to basic extraction
        $text = extractTextFromPDF($fileTmpPath);
        if ($text === false) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Failed to extract text from PDF. Please ensure the PDF contains selectable text (not scanned images).'
            ]);
            exit;
        }
    } elseif ($fileExtension === 'docx') {
        // Extract text from DOCX
        $text = extractTextFromDOCX($fileTmpPath);
        if ($text === false) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Failed to extract text from DOCX file.'
            ]);
            exit;
        }
    } elseif ($fileExtension === 'doc') {
        // For old .doc format, suggest converting to .docx or .txt
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Legacy .doc format is not supported. Please save your document as .docx or .txt format.'
        ]);
        exit;
    }

    // Parse the text to extract questions
    $parsedData = parseQuestions($text);

    if (empty($parsedData['questions'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'No questions found in the file. Please check the format.']);
        exit;
    }

    // Validate required metadata
    if (empty($parsedData['subject'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Subject is required. Please add "Subject: YOUR_SUBJECT" at the top of your file.',
            'debug' => 'Found ' . count($parsedData['questions']) . ' questions but no subject'
        ]);
        exit;
    }

    if (empty($parsedData['class'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Class is required. Please add "Class: YOUR_CLASS" at the top of your file.',
            'debug' => 'Subject: ' . $parsedData['subject'] . ', but no class found'
        ]);
        exit;
    }

    // Insert questions into database
    $database = new Database();
    $db = $database->getConnection();
    $db->beginTransaction();

    $questionQuery = "INSERT INTO cbt_questions
                      (school_id, subject, class, question_text, question_type, topic, difficulty, marks, created_by)
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
    $questionStmt = $db->prepare($questionQuery);

    $optionQuery = "INSERT INTO cbt_question_options
                    (question_id, option_label, option_text, is_correct)
                    VALUES (?, ?, ?, ?)";
    $optionStmt = $db->prepare($optionQuery);

    $labels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    $successCount = 0;

    foreach ($parsedData['questions'] as $question) {
        // Insert question
        $questionStmt->execute([
            $schoolId,
            $parsedData['subject'],
            $parsedData['class'],
            $question['text'],
            'multiple_choice',
            $parsedData['topic'] ?? '',
            $parsedData['difficulty'] ?? 'medium',
            $parsedData['marks'] ?? 1,
            $userId
        ]);

        $questionId = $db->lastInsertId();

        // Insert options
        foreach ($question['options'] as $index => $option) {
            $optionStmt->execute([
                $questionId,
                $labels[$index] ?? chr(65 + $index),
                $option['text'],
                $option['is_correct'] ? 1 : 0
            ]);
        }

        $successCount++;
    }

    $db->commit();

    echo json_encode([
        'success' => true,
        'message' => "Successfully imported {$successCount} question(s)",
        'count' => $successCount
    ]);

} catch (Exception $e) {
    if (isset($db) && $db->inTransaction()) {
        $db->rollBack();
    }
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error processing file: ' . $e->getMessage()]);
}

/**
 * Parse questions from text content
 */
function parseQuestions($text) {
    // Handle different line endings and clean the text
    $text = str_replace(["\r\n", "\r"], "\n", $text);
    $lines = explode("\n", $text);

    $result = [
        'subject' => '',
        'class' => '',
        'topic' => '',
        'difficulty' => 'medium',
        'marks' => 1,
        'questions' => []
    ];

    $currentQuestion = null;
    $currentOptions = [];

    foreach ($lines as $line) {
        // Remove BOM and trim
        $line = trim($line, " \t\n\r\0\x0B\xEF\xBB\xBF");
        if (empty($line)) continue;

        // Parse metadata
        if (preg_match('/^Subject:\s*(.+)$/i', $line, $matches)) {
            $result['subject'] = strtoupper(trim($matches[1]));
            continue;
        }
        if (preg_match('/^Class:\s*(.+)$/i', $line, $matches)) {
            $result['class'] = trim($matches[1]);
            continue;
        }
        if (preg_match('/^Topic:\s*(.+)$/i', $line, $matches)) {
            $result['topic'] = trim($matches[1]);
            continue;
        }
        if (preg_match('/^Difficulty:\s*(.+)$/i', $line, $matches)) {
            $difficulty = strtolower(trim($matches[1]));
            if (in_array($difficulty, ['easy', 'medium', 'hard'])) {
                $result['difficulty'] = $difficulty;
            }
            continue;
        }
        if (preg_match('/^Marks:\s*(\d+)$/i', $line, $matches)) {
            $result['marks'] = intval($matches[1]);
            continue;
        }

        // Parse question (starts with "Question" or number followed by ":")
        if (preg_match('/^(?:Question\s+\d+:|Q\d+:|\d+[.):])\s*(.+)$/i', $line, $matches)) {
            // Save previous question if exists
            if ($currentQuestion && count($currentOptions) >= 2) {
                $result['questions'][] = [
                    'text' => $currentQuestion,
                    'options' => $currentOptions
                ];
            }

            $currentQuestion = trim($matches[1]);
            $currentOptions = [];
            continue;
        }

        // Parse options (A. B. C. D. or A) B) C) D))
        if (preg_match('/^([A-H])[.)]\s*(.+)$/i', $line, $matches)) {
            $optionText = trim($matches[2]);
            $isCorrect = false;

            // Check if marked as correct
            if (preg_match('/\(correct\)|\*$/i', $optionText)) {
                $isCorrect = true;
                $optionText = preg_replace('/\s*\(correct\)|\*$/i', '', $optionText);
            }

            $currentOptions[] = [
                'text' => trim($optionText),
                'is_correct' => $isCorrect
            ];
            continue;
        }
    }

    // Save last question
    if ($currentQuestion && count($currentOptions) >= 2) {
        $result['questions'][] = [
            'text' => $currentQuestion,
            'options' => $currentOptions
        ];
    }

    return $result;
}

/**
 * Extract text from PDF file
 */
function extractTextFromPDF($filePath) {
    // Method 1: Try using pdftotext command line tool (if available)
    if (function_exists('shell_exec')) {
        $output = shell_exec("pdftotext " . escapeshellarg($filePath) . " - 2>&1");
        if ($output && !empty(trim($output)) && strpos($output, 'command not found') === false) {
            return $output;
        }
    }

    // Method 2: Use basic PDF parsing (works for simple PDFs)
    $content = file_get_contents($filePath);

    if (!$content) {
        return false;
    }

    // Basic PDF text extraction
    // This works for simple PDFs with text objects
    $text = '';

    // Extract text between stream markers
    if (preg_match_all('/\(([^)]+)\)/i', $content, $matches)) {
        $text = implode("\n", $matches[1]);
    }

    // Also try to extract from BT/ET blocks (text objects)
    if (preg_match_all('/BT\s*(.*?)\s*ET/s', $content, $matches)) {
        foreach ($matches[1] as $textBlock) {
            // Extract text from Tj operators
            if (preg_match_all('/\[(.*?)\]\s*TJ/s', $textBlock, $tjMatches)) {
                foreach ($tjMatches[1] as $tj) {
                    if (preg_match_all('/\(([^)]*)\)/', $tj, $textMatches)) {
                        $text .= implode(' ', $textMatches[1]) . "\n";
                    }
                }
            }
            // Extract text from Tj operators (single)
            if (preg_match_all('/\(([^)]+)\)\s*Tj/i', $textBlock, $tjMatches)) {
                $text .= implode("\n", $tjMatches[1]) . "\n";
            }
        }
    }

    // Decode PDF escape sequences
    $text = str_replace(['\\(', '\\)', '\\\\'], ['(', ')', '\\'], $text);

    // Clean up the text
    $text = preg_replace('/\s+/', ' ', $text);
    $text = str_replace(['\r\n', '\r', '\n'], "\n", $text);

    if (empty(trim($text))) {
        return false;
    }

    return $text;
}

/**
 * Extract text from DOCX file
 */
function extractTextFromDOCX($filePath) {
    // DOCX is a ZIP file containing XML files
    $zip = new ZipArchive();

    if ($zip->open($filePath) !== true) {
        return false;
    }

    // The main document is in word/document.xml
    $content = $zip->getFromName('word/document.xml');
    $zip->close();

    if ($content === false) {
        return false;
    }

    // Parse XML and extract text
    $xml = simplexml_load_string($content);

    if ($xml === false) {
        return false;
    }

    // Register namespaces
    $xml->registerXPathNamespace('w', 'http://schemas.openxmlformats.org/wordprocessingml/2006/main');

    // Extract all text nodes
    $textNodes = $xml->xpath('//w:t');

    $text = '';
    $previousWasParagraph = false;

    // Also get paragraph breaks
    $paragraphs = $xml->xpath('//w:p');

    foreach ($paragraphs as $paragraph) {
        $paragraph->registerXPathNamespace('w', 'http://schemas.openxmlformats.org/wordprocessingml/2006/main');
        $textInParagraph = $paragraph->xpath('.//w:t');

        $paragraphText = '';
        foreach ($textInParagraph as $textNode) {
            $paragraphText .= (string)$textNode;
        }

        if (!empty(trim($paragraphText))) {
            $text .= trim($paragraphText) . "\n";
        }
    }

    if (empty(trim($text))) {
        return false;
    }

    return $text;
}
?>
