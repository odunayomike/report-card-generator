<?php
require_once __DIR__ . '/../config/database.php';

$database = new Database();
$db = $database->getConnection();

echo "Checking schools table for assessment configuration columns...\n\n";

$result = $db->query('DESCRIBE schools');
$columns = $result->fetchAll(PDO::FETCH_ASSOC);

$found = ['ca_max_marks' => false, 'exam_max_marks' => false];

foreach ($columns as $column) {
    if ($column['Field'] === 'ca_max_marks') {
        echo "✓ ca_max_marks: " . $column['Type'] . " (Default: " . $column['Default'] . ")\n";
        $found['ca_max_marks'] = true;
    }
    if ($column['Field'] === 'exam_max_marks') {
        echo "✓ exam_max_marks: " . $column['Type'] . " (Default: " . $column['Default'] . ")\n";
        $found['exam_max_marks'] = true;
    }
}

if ($found['ca_max_marks'] && $found['exam_max_marks']) {
    echo "\n✓ All assessment configuration columns are present!\n";
} else {
    echo "\n✗ Some columns are missing!\n";
}
?>
