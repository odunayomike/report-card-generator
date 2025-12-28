<?php
/**
 * Test Script to Check Archived Fees
 */

require_once __DIR__ . '/config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    echo "=== Checking fee_structure table ===\n\n";

    // Check if is_active column exists
    $columnsQuery = "SHOW COLUMNS FROM fee_structure LIKE 'is_active'";
    $columnsStmt = $db->query($columnsQuery);
    $column = $columnsStmt->fetch(PDO::FETCH_ASSOC);

    if ($column) {
        echo "✓ is_active column exists\n";
        echo "  Type: " . $column['Type'] . "\n";
        echo "  Default: " . ($column['Default'] ?? 'NULL') . "\n\n";
    } else {
        echo "✗ is_active column does NOT exist\n";
        echo "  Please run: php backend/migrations/apply_is_active_migration.php\n\n";
        exit(1);
    }

    // Get count of fee structures by status
    $countQuery = "SELECT
                    COUNT(*) as total,
                    SUM(CASE WHEN is_active = TRUE THEN 1 ELSE 0 END) as active_count,
                    SUM(CASE WHEN is_active = FALSE THEN 1 ELSE 0 END) as archived_count
                   FROM fee_structure";
    $countStmt = $db->query($countQuery);
    $counts = $countStmt->fetch(PDO::FETCH_ASSOC);

    echo "=== Fee Structure Counts ===\n";
    echo "Total fee structures: " . $counts['total'] . "\n";
    echo "Active: " . $counts['active_count'] . "\n";
    echo "Archived: " . $counts['archived_count'] . "\n\n";

    if ($counts['archived_count'] == 0) {
        echo "ℹ️  No archived fee structures found.\n";
        echo "   To test, archive a fee structure from the Fee Management page.\n\n";
    } else {
        // Show archived fees
        echo "=== Archived Fee Structures ===\n";
        $archivedQuery = "SELECT fs.id, fc.name as category_name, fs.class, fs.session, fs.term, fs.amount
                          FROM fee_structure fs
                          INNER JOIN fee_categories fc ON fs.fee_category_id = fc.id
                          WHERE fs.is_active = FALSE
                          ORDER BY fs.created_at DESC";
        $archivedStmt = $db->query($archivedQuery);
        $archivedFees = $archivedStmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($archivedFees as $fee) {
            echo "  - ID: {$fee['id']} | {$fee['category_name']} | ";
            echo ($fee['class'] ?? 'All Classes') . " | ";
            echo "{$fee['session']} {$fee['term']} | ₦{$fee['amount']}\n";
        }
    }

    echo "\n=== Test Complete ===\n";

} catch (PDOException $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    exit(1);
}
