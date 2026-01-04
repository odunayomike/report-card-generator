<?php
/**
 * Migration Runner Script
 * Run this script to execute a migration file
 */

require_once __DIR__ . '/config/database.php';

// Check if migration file is provided
if ($argc < 2) {
    echo "Usage: php run_migration.php <migration_file_path>\n";
    echo "Example: php run_migration.php migrations/make_teacher_classes_term_optional.sql\n";
    exit(1);
}

$migrationFile = $argv[1];
$fullPath = __DIR__ . '/' . $migrationFile;

// Check if file exists
if (!file_exists($fullPath)) {
    echo "Error: Migration file not found: $fullPath\n";
    exit(1);
}

echo "Running migration: $migrationFile\n";
echo str_repeat("-", 50) . "\n";

try {
    // Get database connection
    $database = new Database();
    $db = $database->getConnection();

    // Read SQL file
    $sql = file_get_contents($fullPath);

    // Split SQL statements by semicolon
    $statements = array_filter(
        array_map('trim', explode(';', $sql)),
        function($stmt) {
            // Remove empty statements and comments
            $stmt = trim($stmt);
            return !empty($stmt) && strpos($stmt, '--') !== 0;
        }
    );

    // Execute each statement
    $db->beginTransaction();

    foreach ($statements as $index => $statement) {
        if (empty(trim($statement))) {
            continue;
        }

        echo "\nExecuting statement " . ($index + 1) . "...\n";
        echo substr($statement, 0, 100) . (strlen($statement) > 100 ? '...' : '') . "\n";

        try {
            $db->exec($statement);
            echo "✓ Success\n";
        } catch (PDOException $e) {
            echo "✗ Error: " . $e->getMessage() . "\n";
            throw $e;
        }
    }

    $db->commit();

    echo "\n" . str_repeat("-", 50) . "\n";
    echo "Migration completed successfully!\n";

} catch (Exception $e) {
    if (isset($db)) {
        $db->rollBack();
    }
    echo "\n" . str_repeat("-", 50) . "\n";
    echo "Migration failed: " . $e->getMessage() . "\n";
    exit(1);
}
?>
