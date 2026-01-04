<?php
/**
 * Subject Enrollment System Migration Runner
 * Run this script to apply the subject enrollment system migration
 */

require_once __DIR__ . '/config/database.php';

echo "Starting Subject Enrollment System Migration...\n\n";

try {
    $database = new Database();
    $db = $database->getConnection();

    // Read the migration file
    $migrationFile = __DIR__ . '/migrations/add_subject_enrollment_system.sql';

    if (!file_exists($migrationFile)) {
        throw new Exception("Migration file not found: $migrationFile");
    }

    $sql = file_get_contents($migrationFile);

    // Split the SQL into individual statements
    $statements = array_filter(
        array_map('trim', explode(';', $sql)),
        function($stmt) {
            // Remove comments and empty statements
            $stmt = preg_replace('/--.*$/m', '', $stmt);
            return !empty(trim($stmt));
        }
    );

    echo "Found " . count($statements) . " SQL statements to execute.\n\n";

    // Execute each statement
    $successCount = 0;
    foreach ($statements as $index => $statement) {
        if (empty(trim($statement))) {
            continue;
        }

        try {
            echo "Executing statement " . ($index + 1) . "...\n";
            $db->exec($statement);
            $successCount++;
            echo "✓ Success\n\n";
        } catch (PDOException $e) {
            // Check if error is about duplicate column (already exists)
            if (strpos($e->getMessage(), 'Duplicate column name') !== false) {
                echo "⚠ Warning: Column already exists (skipping)\n\n";
                $successCount++;
            } elseif (strpos($e->getMessage(), 'already exists') !== false) {
                echo "⚠ Warning: Table/Index already exists (skipping)\n\n";
                $successCount++;
            } else {
                echo "✗ Error: " . $e->getMessage() . "\n\n";
                throw $e;
            }
        }
    }

    echo "\n========================================\n";
    echo "Migration completed successfully!\n";
    echo "Executed $successCount statements.\n";
    echo "========================================\n\n";

    // Verify tables were created
    echo "Verifying tables...\n";

    $tables = ['class_subjects', 'student_subject_enrollment'];
    foreach ($tables as $table) {
        $result = $db->query("SHOW TABLES LIKE '$table'")->fetch();
        if ($result) {
            echo "✓ Table '$table' exists\n";
        } else {
            echo "✗ Table '$table' NOT found\n";
        }
    }

    // Verify teacher_classes has subject column
    $result = $db->query("SHOW COLUMNS FROM teacher_classes LIKE 'subject'")->fetch();
    if ($result) {
        echo "✓ Column 'subject' added to teacher_classes\n";
    } else {
        echo "✗ Column 'subject' NOT found in teacher_classes\n";
    }

    echo "\n✓ Migration verification complete!\n";
    echo "\nYou can now:\n";
    echo "1. Configure class subjects at /dashboard/manage-class-subjects\n";
    echo "2. Enroll students in subjects at /dashboard/manage-student-subjects\n";
    echo "3. Assign teachers to subjects at /dashboard/manage-teachers\n";

} catch (Exception $e) {
    echo "\n========================================\n";
    echo "Migration FAILED!\n";
    echo "Error: " . $e->getMessage() . "\n";
    echo "========================================\n";
    exit(1);
}
?>
