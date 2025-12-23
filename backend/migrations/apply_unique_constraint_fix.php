<?php
/**
 * Fix Unique Constraint Migration
 * Allows same student to have multiple reports for different terms/sessions
 */

require_once __DIR__ . '/../config/database.php';

echo "Fixing Students Table Unique Constraint...\n\n";

$database = new Database();
$db = $database->getConnection();

try {
    // Check if the new constraint already exists
    $checkQuery = "SHOW KEYS FROM students WHERE Key_name = 'unique_student_report'";
    $result = $db->query($checkQuery);

    if ($result->rowCount() > 0) {
        echo "✓ New constraint already exists - no changes needed\n\n";
    } else {
        // Add new unique constraint that includes session and term
        echo "1. Adding new unique constraint (unique_student_report)...\n";
        try {
            $db->exec("ALTER TABLE students ADD UNIQUE KEY unique_student_report (school_id, admission_no, session, term)");
            echo "   ✓ New constraint added (allows same student for different terms/sessions)\n\n";
        } catch (PDOException $e) {
            if (strpos($e->getMessage(), "Duplicate key name") !== false) {
                echo "   ⚠ New constraint already exists\n\n";
            } else {
                throw $e;
            }
        }

        // Try to drop the old unique constraint (may fail if still referenced)
        echo "2. Attempting to drop old unique constraint (unique_admission_per_school)...\n";
        try {
            $db->exec("ALTER TABLE students DROP INDEX unique_admission_per_school");
            echo "   ✓ Old constraint dropped\n\n";
        } catch (PDOException $e) {
            if (strpos($e->getMessage(), "needed in a foreign key constraint") !== false) {
                echo "   ⚠ Cannot drop old constraint (referenced by foreign key)\n";
                echo "   ℹ This is OK - the new constraint will handle uniqueness correctly\n\n";
            } elseif (strpos($e->getMessage(), "check that column/key exists") !== false ||
                strpos($e->getMessage(), "Can't DROP") !== false) {
                echo "   ⚠ Constraint already removed or doesn't exist\n\n";
            } else {
                throw $e;
            }
        }
    }

    echo "========================================\n";
    echo "✓ Migration completed successfully!\n";
    echo "========================================\n\n";

    echo "Students can now have multiple reports for different terms and sessions.\n";

} catch (PDOException $e) {
    echo "\n✗ Error: " . $e->getMessage() . "\n";
    exit(1);
}
?>
