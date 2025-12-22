<?php
/**
 * Apply Parents/Guardians Migration Manually
 */

require_once __DIR__ . '/../config/database.php';

echo "Applying Parents/Guardians Migration...\n\n";

$database = new Database();
$db = $database->getConnection();

try {
    // Create parents table
    echo "1. Creating parents table...\n";
    $db->exec("
        CREATE TABLE IF NOT EXISTS parents (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255) NOT NULL UNIQUE,
            name VARCHAR(255) NOT NULL,
            phone VARCHAR(50),
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_parent_email (email)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    echo "   ✓ Parents table created/verified\n\n";

    // Create parent_students table
    echo "2. Creating parent_students table...\n";
    $db->exec("
        CREATE TABLE IF NOT EXISTS parent_students (
            id INT AUTO_INCREMENT PRIMARY KEY,
            parent_id INT NOT NULL,
            student_id INT NOT NULL,
            relationship ENUM('father', 'mother', 'guardian', 'other') DEFAULT 'guardian',
            is_primary BOOLEAN DEFAULT FALSE COMMENT 'Primary contact for this student',
            added_by_school_id INT NOT NULL COMMENT 'School that created this relationship',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (parent_id) REFERENCES parents(id) ON DELETE CASCADE,
            FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
            FOREIGN KEY (added_by_school_id) REFERENCES schools(id) ON DELETE CASCADE,
            UNIQUE KEY unique_parent_student (parent_id, student_id),
            INDEX idx_parent_id (parent_id),
            INDEX idx_student_id (student_id),
            INDEX idx_school_id (added_by_school_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    echo "   ✓ Parent-students table created/verified\n\n";

    // Add parent_email column to students
    echo "3. Adding parent_email column to students...\n";
    try {
        $db->exec("ALTER TABLE students ADD COLUMN parent_email VARCHAR(255) NULL AFTER photo");
        echo "   ✓ parent_email column added\n\n";
    } catch (PDOException $e) {
        if (strpos($e->getMessage(), 'Duplicate column') !== false) {
            echo "   ⚠ parent_email column already exists\n\n";
        } else {
            throw $e;
        }
    }

    // Add index for parent_email
    echo "4. Adding index for parent_email...\n";
    try {
        $db->exec("ALTER TABLE students ADD INDEX idx_student_parent_email (parent_email)");
        echo "   ✓ Index added\n\n";
    } catch (PDOException $e) {
        if (strpos($e->getMessage(), 'Duplicate key') !== false) {
            echo "   ⚠ Index already exists\n\n";
        } else {
            throw $e;
        }
    }

    // Add guardian_email column to students
    echo "5. Adding guardian_email column to students...\n";
    try {
        $db->exec("ALTER TABLE students ADD COLUMN guardian_email VARCHAR(500) NULL AFTER parent_email");
        echo "   ✓ guardian_email column added\n\n";
    } catch (PDOException $e) {
        if (strpos($e->getMessage(), 'Duplicate column') !== false) {
            echo "   ⚠ guardian_email column already exists\n\n";
        } else {
            throw $e;
        }
    }

    // Add index for guardian_email
    echo "6. Adding index for guardian_email...\n";
    try {
        $db->exec("ALTER TABLE students ADD INDEX idx_student_guardian_email (guardian_email)");
        echo "   ✓ Index added\n\n";
    } catch (PDOException $e) {
        if (strpos($e->getMessage(), 'Duplicate key') !== false) {
            echo "   ⚠ Index already exists\n\n";
        } else {
            throw $e;
        }
    }

    echo "========================================\n";
    echo "✓ All migrations applied successfully!\n";
    echo "========================================\n";

} catch (PDOException $e) {
    echo "\n✗ Error: " . $e->getMessage() . "\n";
    exit(1);
}
?>
