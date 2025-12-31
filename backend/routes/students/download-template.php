<?php
/**
 * Download CSV Template for Student Import
 */

// Set headers for CSV download
header('Content-Type: text/csv; charset=utf-8');
header('Content-Disposition: attachment; filename="student_import_template.csv"');
header('Pragma: no-cache');
header('Expires: 0');

// Create output stream
$output = fopen('php://output', 'w');

// Add BOM for Excel UTF-8 support
fprintf($output, chr(0xEF).chr(0xBB).chr(0xBF));

// CSV Headers with example data
$headers = [
    'Admission No',
    'Name',
    'Gender',
    'Class',
    'Session',
    'Term',
    'Guardian Email',
    'Height',
    'Weight',
    'Club/Society',
    'Favourite Color'
];

fputcsv($output, $headers);

// Add example row
$exampleRow = [
    'STU24001',
    'John Doe',
    'MALE',
    'JSS 1',
    '2024/2025',
    'First Term',
    'jane.doe@example.com',
    '150cm',
    '45kg',
    'Science Club',
    'Blue'
];

fputcsv($output, $exampleRow);

fclose($output);
exit;
