<?php
/**
 * Run Database Migration
 */

require_once 'config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    // Read the migration file
    $migrationSQL = file_get_contents(__DIR__ . '/migration_school_profile_settings.sql');

    // Remove SQL comments
    $lines = explode("\n", $migrationSQL);
    $cleanedSQL = '';
    foreach ($lines as $line) {
        $line = trim($line);
        // Skip empty lines and comment lines
        if (empty($line) || strpos($line, '--') === 0) {
            continue;
        }
        $cleanedSQL .= ' ' . $line;
    }

    // Split by semicolon to get individual statements
    $statements = explode(';', $cleanedSQL);
    $statements = array_filter(array_map('trim', $statements));

    echo "Starting migration...\n";
    echo "Number of statements to execute: " . count($statements) . "\n\n";

    foreach ($statements as $index => $statement) {
        if (empty(trim($statement))) {
            continue;
        }

        try {
            echo "Executing statement " . ($index + 1) . "...\n";
            echo substr($statement, 0, 80) . "...\n";
            $db->exec($statement);
            echo "✓ Success\n\n";
        } catch (PDOException $e) {
            // Check if error is about duplicate column (column already exists)
            if (strpos($e->getMessage(), 'Duplicate column name') !== false) {
                echo "⚠ Column already exists, skipping...\n\n";
            } else {
                echo "✗ Error: " . $e->getMessage() . "\n\n";
                throw $e;
            }
        }
    }

    echo "Migration completed successfully!\n";

} catch (Exception $e) {
    echo "Migration failed: " . $e->getMessage() . "\n";
    exit(1);
}
?>
