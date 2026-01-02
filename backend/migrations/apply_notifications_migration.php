<?php
/**
 * Apply Notifications System Migration
 * Creates notifications, parent_device_tokens, and notification_settings tables
 */

require_once __DIR__ . '/../config/database.php';

echo "===========================================\n";
echo "Notifications System Migration\n";
echo "===========================================\n\n";

$database = new Database();
$db = $database->getConnection();

try {
    // Read the migration SQL file
    $sqlFile = __DIR__ . '/add_notifications_system.sql';

    if (!file_exists($sqlFile)) {
        echo "✗ Error: Migration file not found at $sqlFile\n";
        exit(1);
    }

    $sql = file_get_contents($sqlFile);

    // Split by semicolons to execute multiple statements
    $statements = array_filter(
        array_map('trim', explode(';', $sql)),
        function($statement) {
            return !empty($statement) &&
                   strpos($statement, '--') !== 0 &&
                   strpos($statement, 'SELECT') !== 0;
        }
    );

    echo "Starting migration...\n\n";

    // Execute each statement
    $executedCount = 0;
    foreach ($statements as $statement) {
        if (empty($statement)) continue;

        try {
            // Check what type of statement this is
            if (stripos($statement, 'CREATE TABLE IF NOT EXISTS notifications') !== false) {
                echo "1. Creating 'notifications' table...\n";
            } elseif (stripos($statement, 'CREATE TABLE IF NOT EXISTS parent_device_tokens') !== false) {
                echo "2. Creating 'parent_device_tokens' table...\n";
            } elseif (stripos($statement, 'CREATE TABLE IF NOT EXISTS notification_settings') !== false) {
                echo "3. Creating 'notification_settings' table...\n";
            }

            $db->exec($statement);
            $executedCount++;
            echo "   ✓ Success\n\n";

        } catch (PDOException $e) {
            // Check if it's a "table already exists" error
            if (strpos($e->getMessage(), 'already exists') !== false ||
                strpos($e->getMessage(), 'Duplicate') !== false) {
                echo "   ⚠ Table already exists (skipped)\n\n";
            } else {
                throw $e;
            }
        }
    }

    // Verify tables were created
    echo "Verifying tables...\n";
    $tables = ['notifications', 'parent_device_tokens', 'notification_settings'];
    $allCreated = true;

    foreach ($tables as $table) {
        $result = $db->query("SHOW TABLES LIKE '$table'");
        if ($result->rowCount() > 0) {
            echo "   ✓ Table '$table' exists\n";
        } else {
            echo "   ✗ Table '$table' NOT found\n";
            $allCreated = false;
        }
    }

    echo "\n===========================================\n";
    if ($allCreated) {
        echo "✓ Migration completed successfully!\n";
        echo "===========================================\n\n";
        echo "All notification system tables are ready:\n";
        echo "  • notifications - In-app notifications storage\n";
        echo "  • parent_device_tokens - FCM device tokens for push\n";
        echo "  • notification_settings - Parent preferences\n\n";

        echo "Next steps:\n";
        echo "  1. Configure FCM_SERVER_KEY in your environment\n";
        echo "  2. Test the notification system\n\n";
    } else {
        echo "⚠ Migration completed with warnings\n";
        echo "===========================================\n\n";
    }

} catch (PDOException $e) {
    echo "\n===========================================\n";
    echo "✗ Migration failed!\n";
    echo "===========================================\n\n";
    echo "Error: " . $e->getMessage() . "\n\n";
    exit(1);
}
?>
