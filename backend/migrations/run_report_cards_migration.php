<?php
require_once __DIR__ . '/../config/database.php';

echo "Running Report Cards Table Migration...\n\n";

try {
    $database = new Database();
    $conn = $database->getConnection();

    $migrationFile = __DIR__ . '/create_report_cards_table.sql';

    if (!file_exists($migrationFile)) {
        throw new Exception("Migration file not found: $migrationFile");
    }

    $sql = file_get_contents($migrationFile);

    $statements = array_filter(
        array_map('trim', explode(';', $sql)),
        function($stmt) {
            return !empty($stmt);
        }
    );

    echo "Executing " . count($statements) . " SQL statements...\n\n";

    foreach ($statements as $index => $statement) {
        echo "Statement " . ($index + 1) . ":\n";
        echo substr($statement, 0, 100) . "...\n";

        try {
            $conn->exec($statement);
            echo "✓ Success\n\n";
        } catch (PDOException $e) {
            if (strpos($e->getMessage(), 'Duplicate column') !== false) {
                echo "⚠ Column already exists, skipping...\n\n";
            } elseif (strpos($e->getMessage(), 'already exists') !== false) {
                echo "⚠ Table/Index already exists, skipping...\n\n";
            } else {
                throw $e;
            }
        }
    }

    echo "\n✓ Migration completed successfully!\n\n";

    $checkQuery = "SHOW TABLES LIKE 'report_cards'";
    $result = $conn->query($checkQuery);

    if ($result->rowCount() > 0) {
        echo "✓ report_cards table exists\n";

        $columnsQuery = "DESCRIBE report_cards";
        $columns = $conn->query($columnsQuery)->fetchAll(PDO::FETCH_COLUMN);
        echo "  Columns: " . implode(', ', $columns) . "\n\n";
    }

    $checkSubjects = "SHOW COLUMNS FROM subjects LIKE 'report_card_id'";
    if ($conn->query($checkSubjects)->rowCount() > 0) {
        echo "✓ subjects.report_card_id column added\n";
    }

    $checkAttendance = "SHOW COLUMNS FROM attendance LIKE 'report_card_id'";
    if ($conn->query($checkAttendance)->rowCount() > 0) {
        echo "✓ attendance.report_card_id column added\n";
    }

    $checkRemarks = "SHOW COLUMNS FROM remarks LIKE 'report_card_id'";
    if ($conn->query($checkRemarks)->rowCount() > 0) {
        echo "✓ remarks.report_card_id column added\n";
    }

    echo "\nMigration completed successfully!\n";

} catch (Exception $e) {
    echo "\n✗ Migration failed: " . $e->getMessage() . "\n";
    exit(1);
}
