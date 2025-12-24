<?php
/**
 * Apply Password Column Migration to Parents Table
 * Run this file once to add password column to parents table
 */

require_once __DIR__ . '/../config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    echo "Starting migration: Add password column to parents table...\n\n";

    // Read the SQL file
    $sql = file_get_contents(__DIR__ . '/add_password_to_parents.sql');

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
    echo "Next steps:\n";
    echo "1. Existing parents have been set with default password: 'password123'\n";
    echo "2. Schools should update parent passwords using the 'Add Parent' feature\n";
    echo "3. Parents can now login using email and password\n\n";

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
