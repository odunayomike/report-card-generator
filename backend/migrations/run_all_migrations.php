<?php
/**
 * Run All Pending Database Migrations
 * This script executes all SQL migration files in order
 */

require_once __DIR__ . '/../config/database.php';

// ANSI color codes for terminal output
define('COLOR_GREEN', "\033[32m");
define('COLOR_RED', "\033[31m");
define('COLOR_YELLOW', "\033[33m");
define('COLOR_BLUE', "\033[34m");
define('COLOR_RESET', "\033[0m");

echo COLOR_BLUE . "========================================\n" . COLOR_RESET;
echo COLOR_BLUE . "Database Migration Script\n" . COLOR_RESET;
echo COLOR_BLUE . "========================================\n\n" . COLOR_RESET;

// Get database connection
$database = new Database();
$db = $database->getConnection();

if (!$db) {
    echo COLOR_RED . "✗ Failed to connect to database\n" . COLOR_RESET;
    exit(1);
}

echo COLOR_GREEN . "✓ Connected to database\n\n" . COLOR_RESET;

// Define migrations in order of execution
$migrations = [
    'add_super_admin.sql',
    'cbt_system_phase1_fixed.sql',
    'add_assessment_config_columns.sql',
    'update_subscription_plans.sql',
    'add_parents_guardians.sql',
    'add_guardian_email_to_students.sql'
];

$migrationsDir = __DIR__;
$successful = 0;
$failed = 0;
$skipped = 0;

echo COLOR_YELLOW . "Starting migrations...\n\n" . COLOR_RESET;

foreach ($migrations as $migration) {
    $filePath = $migrationsDir . '/' . $migration;

    echo "Running: " . COLOR_BLUE . $migration . COLOR_RESET . "\n";

    if (!file_exists($filePath)) {
        echo COLOR_RED . "  ✗ File not found\n\n" . COLOR_RESET;
        $failed++;
        continue;
    }

    // Read SQL file
    $sql = file_get_contents($filePath);

    if ($sql === false) {
        echo COLOR_RED . "  ✗ Failed to read file\n\n" . COLOR_RESET;
        $failed++;
        continue;
    }

    // Split SQL into individual statements
    $statements = array_filter(
        array_map('trim', explode(';', $sql)),
        function($stmt) {
            return !empty($stmt) &&
                   strpos($stmt, '--') !== 0 &&
                   strpos($stmt, '/*') !== 0;
        }
    );

    $migrationSuccess = true;
    $statementsExecuted = 0;

    foreach ($statements as $statement) {
        // Skip comments and empty statements
        if (empty(trim($statement))) {
            continue;
        }

        try {
            $db->exec($statement);
            $statementsExecuted++;
        } catch (PDOException $e) {
            $errorMessage = $e->getMessage();

            // Check if error is benign (already exists)
            if (
                stripos($errorMessage, 'Duplicate column name') !== false ||
                stripos($errorMessage, 'Duplicate key name') !== false ||
                stripos($errorMessage, 'already exists') !== false ||
                stripos($errorMessage, 'Table') !== false && stripos($errorMessage, 'already exists') !== false
            ) {
                echo COLOR_YELLOW . "  ⚠ Already exists (skipping): " . substr($statement, 0, 50) . "...\n" . COLOR_RESET;
                $skipped++;
                continue;
            }

            // Real error
            echo COLOR_RED . "  ✗ Error: " . $errorMessage . "\n" . COLOR_RESET;
            echo COLOR_RED . "  Statement: " . substr($statement, 0, 100) . "...\n\n" . COLOR_RESET;
            $migrationSuccess = false;
            break;
        }
    }

    if ($migrationSuccess) {
        echo COLOR_GREEN . "  ✓ Success ($statementsExecuted statements executed)\n\n" . COLOR_RESET;
        $successful++;
    } else {
        echo COLOR_RED . "  ✗ Failed\n\n" . COLOR_RESET;
        $failed++;
    }
}

// Summary
echo COLOR_BLUE . "========================================\n" . COLOR_RESET;
echo COLOR_BLUE . "Migration Summary\n" . COLOR_RESET;
echo COLOR_BLUE . "========================================\n" . COLOR_RESET;
echo COLOR_GREEN . "Successful: $successful\n" . COLOR_RESET;
echo COLOR_RED . "Failed: $failed\n" . COLOR_RESET;
echo COLOR_YELLOW . "Skipped (already exists): $skipped\n" . COLOR_RESET;
echo COLOR_BLUE . "========================================\n\n" . COLOR_RESET;

if ($failed > 0) {
    echo COLOR_RED . "⚠ Some migrations failed. Please check the errors above.\n" . COLOR_RESET;
    exit(1);
} else {
    echo COLOR_GREEN . "✓ All migrations completed successfully!\n" . COLOR_RESET;
    exit(0);
}
?>
