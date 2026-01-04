<?php
/**
 * Add Current Session to Schools Table Migration
 */

require_once __DIR__ . '/config/database.php';

echo "Adding current_session to schools table...\n\n";

try {
    $database = new Database();
    $db = $database->getConnection();

    $migrationFile = __DIR__ . '/migrations/add_current_session_to_schools.sql';

    if (!file_exists($migrationFile)) {
        throw new Exception("Migration file not found: $migrationFile");
    }

    $sql = file_get_contents($migrationFile);

    // Split into statements
    $statements = array_filter(
        array_map('trim', explode(';', $sql)),
        function($stmt) {
            $stmt = preg_replace('/--.*$/m', '', $stmt);
            return !empty(trim($stmt));
        }
    );

    foreach ($statements as $index => $statement) {
        if (empty(trim($statement))) continue;

        try {
            echo "Executing statement " . ($index + 1) . "...\n";
            $db->exec($statement);
            echo "✓ Success\n\n";
        } catch (PDOException $e) {
            if (strpos($e->getMessage(), 'Duplicate column') !== false) {
                echo "⚠ Column already exists (skipping)\n\n";
            } else {
                throw $e;
            }
        }
    }

    // Verify columns were added
    $result = $db->query("SHOW COLUMNS FROM schools LIKE 'current_session'")->fetch();
    if ($result) {
        echo "✓ Column 'current_session' added successfully\n";
    }

    $result = $db->query("SHOW COLUMNS FROM schools LIKE 'current_term'")->fetch();
    if ($result) {
        echo "✓ Column 'current_term' added successfully\n";
    }

    echo "\n✓ Migration completed!\n";
    echo "\nSchools can now set their current session and term in School Settings.\n";

} catch (Exception $e) {
    echo "\n✗ Migration FAILED!\n";
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
?>
