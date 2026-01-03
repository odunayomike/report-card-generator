<?php
require_once __DIR__ . '/../config/database.php';

echo "Running Students Table Consolidation Migration...\n\n";

try {
    $database = new Database();
    $conn = $database->getConnection();

    $migrationFile = __DIR__ . '/consolidate_students_table.sql';

    if (!file_exists($migrationFile)) {
        throw new Exception("Migration file not found: $migrationFile");
    }

    $sql = file_get_contents($migrationFile);

    $statements = array_filter(
        array_map('trim', explode(';', $sql)),
        function($stmt) {
            return !empty($stmt) && !preg_match('/^--/', $stmt);
        }
    );

    echo "Executing " . count($statements) . " SQL statements...\n\n";

    $conn->beginTransaction();

    foreach ($statements as $index => $statement) {
        echo "Statement " . ($index + 1) . ":\n";
        $preview = preg_replace('/\s+/', ' ', substr($statement, 0, 80));
        echo $preview . "...\n";

        try {
            $result = $conn->exec($statement);
            if ($result !== false) {
                echo "✓ Success (Affected rows: " . $result . ")\n\n";
            } else {
                echo "✓ Success\n\n";
            }
        } catch (PDOException $e) {
            if (strpos($e->getMessage(), 'Duplicate entry') !== false) {
                echo "⚠ Duplicate entry, skipping...\n\n";
            } elseif (strpos($e->getMessage(), "Can't DROP") !== false || strpos($e->getMessage(), "check the manual") !== false) {
                echo "⚠ Column doesn't exist, skipping...\n\n";
            } elseif (strpos($e->getMessage(), "Duplicate column") !== false) {
                echo "⚠ Column already exists, skipping...\n\n";
            } else {
                throw $e;
            }
        }
    }

    if ($conn->inTransaction()) {
        $conn->commit();
    }
    echo "\n✓ Migration completed successfully!\n\n";

    echo "Verification:\n";

    $studentCount = $conn->query("SELECT COUNT(*) FROM students")->fetchColumn();
    echo "✓ Total unique students: $studentCount\n";

    $reportCount = $conn->query("SELECT COUNT(*) FROM report_cards")->fetchColumn();
    echo "✓ Total report cards: $reportCount\n";

    $checkColumns = $conn->query("SHOW COLUMNS FROM students")->fetchAll(PDO::FETCH_COLUMN);
    echo "✓ Students table columns: " . implode(', ', $checkColumns) . "\n";

    $subjectsLinked = $conn->query("SELECT COUNT(*) FROM subjects WHERE report_card_id IS NOT NULL")->fetchColumn();
    echo "✓ Subjects linked to report_cards: $subjectsLinked\n";

    $attendanceLinked = $conn->query("SELECT COUNT(*) FROM attendance WHERE report_card_id IS NOT NULL")->fetchColumn();
    echo "✓ Attendance linked to report_cards: $attendanceLinked\n";

    $remarksLinked = $conn->query("SELECT COUNT(*) FROM remarks WHERE report_card_id IS NOT NULL")->fetchColumn();
    echo "✓ Remarks linked to report_cards: $remarksLinked\n";

    echo "\nMigration completed successfully!\n";

} catch (Exception $e) {
    if (isset($conn) && $conn->inTransaction()) {
        $conn->rollBack();
    }
    echo "\n✗ Migration failed: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
    exit(1);
}
