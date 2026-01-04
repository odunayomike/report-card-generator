<?php
/**
 * Database Migration Runner
 * Run this script to apply database migrations
 */

require_once __DIR__ . '/config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    echo "Running migration: add_contact_messages_table.sql\n";
    echo "==============================================\n\n";

    // Read the migration file
    $migrationFile = __DIR__ . '/migrations/add_contact_messages_table.sql';

    if (!file_exists($migrationFile)) {
        throw new Exception("Migration file not found: $migrationFile");
    }

    $sql = file_get_contents($migrationFile);

    // Execute the migration
    $db->exec($sql);

    echo "✓ Migration completed successfully!\n";
    echo "✓ Table 'contact_messages' has been created.\n\n";

    // Verify table was created
    $result = $db->query("SHOW TABLES LIKE 'contact_messages'");
    if ($result->rowCount() > 0) {
        echo "✓ Verification: Table exists in database.\n";

        // Show table structure
        echo "\nTable structure:\n";
        echo "----------------\n";
        $columns = $db->query("DESCRIBE contact_messages");
        foreach ($columns as $column) {
            echo sprintf("%-20s %-20s %-10s\n",
                $column['Field'],
                $column['Type'],
                $column['Null'] === 'NO' ? 'NOT NULL' : 'NULL'
            );
        }
    }

    echo "\n✓ Contact form is now ready to accept submissions!\n";

} catch (PDOException $e) {
    echo "✗ Database error: " . $e->getMessage() . "\n";
    exit(1);
} catch (Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "\n";
    exit(1);
}
