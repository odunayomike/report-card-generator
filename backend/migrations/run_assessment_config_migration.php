<?php
/**
 * Migration Runner: Add Assessment Configuration Columns
 */

require_once __DIR__ . '/../config/database.php';

$database = new Database();
$db = $database->getConnection();

echo "Running migration: Add Assessment Configuration columns...\n\n";

// Statement 1: Add ca_max_marks column
try {
    $db->exec("ALTER TABLE schools ADD COLUMN ca_max_marks INT DEFAULT 40 COMMENT 'Maximum marks for CA assessments'");
    echo "✓ Added ca_max_marks column\n";
} catch (PDOException $e) {
    if (strpos($e->getMessage(), 'Duplicate column') !== false) {
        echo "✓ ca_max_marks column already exists\n";
    } else {
        echo "✗ Error adding ca_max_marks: " . $e->getMessage() . "\n";
    }
}

// Statement 2: Add exam_max_marks column
try {
    $db->exec("ALTER TABLE schools ADD COLUMN exam_max_marks INT DEFAULT 60 COMMENT 'Maximum marks for Exam assessments'");
    echo "✓ Added exam_max_marks column\n";
} catch (PDOException $e) {
    if (strpos($e->getMessage(), 'Duplicate column') !== false) {
        echo "✓ exam_max_marks column already exists\n";
    } else {
        echo "✗ Error adding exam_max_marks: " . $e->getMessage() . "\n";
    }
}

echo "\nMigration completed!\n";
?>
