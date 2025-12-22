<?php
/**
 * PDF Debug Script
 * Use this to diagnose PDF generation issues in production
 */

header('Content-Type: application/json');

$debug = [];

// Check if exec is available
$execAvailable = function_exists('exec');
$shellExecAvailable = function_exists('shell_exec');
$debug['exec_available'] = $execAvailable;
$debug['shell_exec_available'] = $shellExecAvailable;

// Check Node.js availability
$possibleNodePaths = [
    '/usr/bin/node',
    '/usr/local/bin/node',
    '/opt/node/bin/node'
];

$debug['node_check'] = [];
foreach ($possibleNodePaths as $path) {
    $exists = file_exists($path);
    $debug['node_check'][$path] = $exists;
    if ($exists && $execAvailable) {
        @exec($path . ' --version 2>&1', $versionOutput);
        $debug['node_versions'][$path] = $versionOutput[0] ?? 'unknown';
    }
}

// Check if node is in PATH
if ($execAvailable) {
    @exec('which node 2>&1', $whichOutput);
    $debug['which_node'] = $whichOutput;

    @exec('node --version 2>&1', $nodeVersion);
    $debug['node_version_from_path'] = $nodeVersion[0] ?? 'not found';
} else {
    $debug['which_node'] = 'exec() disabled';
    $debug['node_version_from_path'] = 'exec() disabled';
}

// Check puppeteer installation
$packageJsonPath = __DIR__ . '/../package.json';
if (file_exists($packageJsonPath)) {
    $packageJson = json_decode(file_get_contents($packageJsonPath), true);
    $debug['package_json'] = [
        'exists' => true,
        'dependencies' => $packageJson['dependencies'] ?? []
    ];
} else {
    $debug['package_json'] = ['exists' => false];
}

// Check node_modules
$nodeModulesPath = __DIR__ . '/../node_modules';
$debug['node_modules'] = [
    'exists' => file_exists($nodeModulesPath),
    'puppeteer_exists' => file_exists($nodeModulesPath . '/puppeteer')
];

// Check temp directory
$tempDir = __DIR__ . '/../temp/';
$debug['temp_directory'] = [
    'exists' => file_exists($tempDir),
    'writable' => is_writable($tempDir),
    'path' => $tempDir
];

if (!file_exists($tempDir)) {
    mkdir($tempDir, 0755, true);
    $debug['temp_directory']['created'] = true;
}

// Check pdf-service.js
$pdfServicePath = __DIR__ . '/../pdf-service.js';
$debug['pdf_service'] = [
    'exists' => file_exists($pdfServicePath),
    'readable' => is_readable($pdfServicePath),
    'path' => $pdfServicePath
];

// Check PHP settings
$debug['php_settings'] = [
    'exec_enabled' => function_exists('exec'),
    'shell_exec_enabled' => function_exists('shell_exec'),
    'max_execution_time' => ini_get('max_execution_time'),
    'memory_limit' => ini_get('memory_limit'),
    'disable_functions' => ini_get('disable_functions')
];

// Check system
$debug['system'] = [
    'php_version' => phpversion(),
    'os' => PHP_OS,
    'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? 'unknown'
];

// Test simple node execution
if ($execAvailable) {
    @exec('node -e "console.log(\'test\')" 2>&1', $testOutput, $testReturnCode);
    $debug['node_test'] = [
        'output' => $testOutput,
        'return_code' => $testReturnCode,
        'success' => $testReturnCode === 0
    ];
} else {
    $debug['node_test'] = [
        'error' => 'exec() function is disabled on this server',
        'solution' => 'Contact hosting provider to enable exec() or use alternative PDF generation method'
    ];
}

// Add warning if exec is disabled
if (!$execAvailable) {
    $debug['CRITICAL_WARNING'] = [
        'message' => 'exec() function is DISABLED on this server',
        'impact' => 'PDF generation using Node.js/Puppeteer will NOT work',
        'solutions' => [
            '1. Contact your hosting provider to enable exec() in php.ini',
            '2. Use a cloud-based PDF service (recommended for shared hosting)',
            '3. Upgrade to VPS/Dedicated server with full PHP function access',
            '4. Use PHP-only PDF library (limited features)'
        ]
    ];
}

echo json_encode($debug, JSON_PRETTY_PRINT);
?>
