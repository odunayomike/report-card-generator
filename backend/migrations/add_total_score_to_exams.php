<?php
/**
 * Migration: Add total_score column to cbt_exams table
 */

require_once __DIR__ . '/../config/database.php';

$database = new Database();
$db = $database->getConnection();

echo "Running migration: Add total_score column to cbt_exams...\n\n";

// Add total_score column
try {
    $db->exec("ALTER TABLE cbt_exams ADD COLUMN total_score DECIMAL(10,2) DEFAULT 10.00 COMMENT 'Total score for the exam'");
    echo "✓ Added total_score column\n";
} catch (PDOException $e) {
    if (strpos($e->getMessage(), 'Duplicate column') !== false) {
        echo "✓ total_score column already exists\n";
    } else {
        echo "✗ Error adding total_score: " . $e->getMessage() . "\n";
        exit(1);
    }
}

// Update existing exams to have total_score equal to total_marks
try {
    $db->exec("UPDATE cbt_exams SET total_score = total_marks WHERE total_score IS NULL OR total_score = 0");
    echo "✓ Updated existing exams with total_score values\n";
} catch (PDOException $e) {
    echo "✗ Error updating existing exams: " . $e->getMessage() . "\n";
}

echo "\nMigration completed!\n";
?>
