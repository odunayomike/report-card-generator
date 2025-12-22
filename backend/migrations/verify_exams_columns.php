<?php
require_once __DIR__ . '/../config/database.php';

$database = new Database();
$db = $database->getConnection();

echo "Checking cbt_exams table for total_score column...\n\n";

$result = $db->query('DESCRIBE cbt_exams');
$columns = $result->fetchAll(PDO::FETCH_ASSOC);

$found = false;

foreach ($columns as $column) {
    if ($column['Field'] === 'total_score') {
        echo "✓ total_score: " . $column['Type'] . " (Default: " . $column['Default'] . ")\n";
        $found = true;
    }
    if ($column['Field'] === 'total_marks') {
        echo "✓ total_marks: " . $column['Type'] . " (Default: " . $column['Default'] . ")\n";
    }
}

if ($found) {
    echo "\n✓ total_score column is present!\n";
} else {
    echo "\n✗ total_score column is missing!\n";
}
?>
