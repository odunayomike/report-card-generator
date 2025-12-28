<?php
/**
 * Apply is_active Column Migration to Fee Structure Table
 * Run this file once to add is_active column
 */

require_once __DIR__ . '/../config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    echo "Starting migration: Add is_active column to fee_structure table...\n\n";

    // Read the SQL file
    $sql = file_get_contents(__DIR__ . '/add_is_active_to_fee_structure.sql');

    // Remove comments and split by semicolon
    $statements = array_filter(
        array_map('trim', explode(';', preg_replace('/--.*$/m', '', $sql))),
        function($statement) {
            return !empty($statement);
        }
    );

    foreach ($statements as $index => $statement) {
        if (!empty(trim($statement))) {
            echo "Executing statement " . ($index + 1) . "...\n";
            echo substr($statement, 0, 100) . "...\n";

            try {
                $db->exec($statement);
                echo "✓ Success\n\n";
            } catch (PDOException $e) {
                // Check if column already exists
                if (strpos($e->getMessage(), 'Duplicate column name') !== false) {
                    echo "⚠ Column already exists, skipping...\n\n";
                } else {
                    throw $e;
                }
            }
        }
    }

    echo "========================================\n";
    echo "Migration completed successfully!\n";
    echo "========================================\n\n";
    echo "The fee_structure table now has an is_active column.\n";
    echo "Fee structures can now be archived instead of deleted.\n\n";

} catch (PDOException $e) {
    echo "\n========================================\n";
    echo "ERROR: Migration failed!\n";
    echo "========================================\n";
    echo "Error message: " . $e->getMessage() . "\n";
    echo "Error code: " . $e->getCode() . "\n\n";
    exit(1);
} catch (Exception $e) {
    echo "\n========================================\n";
    echo "ERROR: " . $e->getMessage() . "\n";
    echo "========================================\n\n";
    exit(1);
}
