<?php
require_once __DIR__ . '/../config/database.php';

echo "Running Promotion System Migration...\n\n";

try {
    $database = new Database();
    $conn = $database->getConnection();

    $migrationFile = __DIR__ . '/add_promotion_system.sql';

    if (!file_exists($migrationFile)) {
        throw new Exception("Migration file not found: $migrationFile");
    }

    $sql = file_get_contents($migrationFile);

    // Remove comment lines
    $lines = explode("\n", $sql);
    $cleanedLines = array_filter($lines, function($line) {
        $trimmed = trim($line);
        return !empty($trimmed) && !preg_match('/^--/', $trimmed);
    });
    $cleanedSql = implode("\n", $cleanedLines);

    // Split by semicolon
    $statements = array_filter(
        array_map('trim', explode(';', $cleanedSql)),
        function($stmt) {
            return !empty($stmt);
        }
    );

    echo "Executing " . count($statements) . " SQL statements...\n\n";

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
            if (strpos($e->getMessage(), 'Duplicate column') !== false) {
                echo "⚠ Column already exists, skipping...\n\n";
            } elseif (strpos($e->getMessage(), 'Duplicate key') !== false) {
                echo "⚠ Key already exists, skipping...\n\n";
            } elseif (strpos($e->getMessage(), 'Duplicate entry') !== false) {
                echo "⚠ Duplicate entry, skipping...\n\n";
            } else {
                throw $e;
            }
        }
    }

    echo "\n✓ Promotion system migration completed successfully!\n\n";

    echo "Verification:\n";

    // Check if columns were added
    $checkSchools = $conn->query("SHOW COLUMNS FROM schools LIKE 'promotion_threshold'")->fetchAll();
    echo "✓ Schools promotion settings: " . (count($checkSchools) > 0 ? "Added" : "Not found") . "\n";

    $hierarchyCount = $conn->query("SELECT COUNT(*) FROM class_hierarchy")->fetchColumn();
    echo "✓ Class hierarchy entries: $hierarchyCount\n";

    $checkPromotions = $conn->query("SHOW TABLES LIKE 'student_promotions'")->fetchAll();
    echo "✓ Student promotions table: " . (count($checkPromotions) > 0 ? "Created" : "Not found") . "\n";

    echo "\nPromotion system is ready!\n";

} catch (Exception $e) {
    echo "\n✗ Migration failed: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
    exit(1);
}
