<?php
/**
 * Verify Database Migrations
 * Checks if all expected tables and columns exist
 */

require_once __DIR__ . '/../config/database.php';

echo "========================================\n";
echo "Database Structure Verification\n";
echo "========================================\n\n";

$database = new Database();
$db = $database->getConnection();

if (!$db) {
    echo "✗ Failed to connect to database\n";
    exit(1);
}

echo "✓ Connected to database\n\n";

// Check for expected tables and columns
$checks = [
    'parents table' => "SHOW TABLES LIKE 'parents'",
    'parent_students table' => "SHOW TABLES LIKE 'parent_students'",
    'students.guardian_email column' => "SHOW COLUMNS FROM students LIKE 'guardian_email'",
    'students.parent_email column' => "SHOW COLUMNS FROM students LIKE 'parent_email'",
];

echo "Checking database structure...\n\n";

$passed = 0;
$failed = 0;

foreach ($checks as $name => $query) {
    try {
        $result = $db->query($query);
        if ($result->rowCount() > 0) {
            echo "✓ $name exists\n";
            $passed++;
        } else {
            echo "✗ $name NOT FOUND\n";
            $failed++;
        }
    } catch (PDOException $e) {
        echo "✗ Error checking $name: " . $e->getMessage() . "\n";
        $failed++;
    }
}

echo "\n========================================\n";
echo "Summary: $passed passed, $failed failed\n";
echo "========================================\n\n";

// Show parents table structure if it exists
try {
    echo "Parents Table Structure:\n";
    echo "------------------------\n";
    $result = $db->query("DESCRIBE parents");
    foreach ($result->fetchAll(PDO::FETCH_ASSOC) as $column) {
        echo "{$column['Field']} ({$column['Type']}) {$column['Null']} {$column['Key']}\n";
    }
    echo "\n";
} catch (PDOException $e) {
    echo "Could not retrieve parents table structure\n\n";
}

// Show students table relevant columns
try {
    echo "Students Table - Email Columns:\n";
    echo "-------------------------------\n";
    $result = $db->query("SHOW COLUMNS FROM students WHERE Field LIKE '%email%'");
    foreach ($result->fetchAll(PDO::FETCH_ASSOC) as $column) {
        echo "{$column['Field']} ({$column['Type']}) - Null: {$column['Null']}, Key: {$column['Key']}\n";
    }
    echo "\n";
} catch (PDOException $e) {
    echo "Could not retrieve students email columns\n\n";
}

// Count existing data
try {
    $parentCount = $db->query("SELECT COUNT(*) FROM parents")->fetchColumn();
    $relationshipCount = $db->query("SELECT COUNT(*) FROM parent_students")->fetchColumn();
    $studentsWithGuardian = $db->query("SELECT COUNT(*) FROM students WHERE guardian_email IS NOT NULL")->fetchColumn();

    echo "Current Data:\n";
    echo "-------------\n";
    echo "Parents: $parentCount\n";
    echo "Parent-Student relationships: $relationshipCount\n";
    echo "Students with guardian email: $studentsWithGuardian\n";
} catch (PDOException $e) {
    echo "Could not retrieve data counts: " . $e->getMessage() . "\n";
}

echo "\n✓ Verification complete!\n";
?>
