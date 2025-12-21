<?php
/**
 * Script to Create Super Admin Account
 * Run this script from command line: php scripts/create-super-admin.php
 */

require_once __DIR__ . '/../config/database.php';

echo "=== Create Super Admin Account ===\n\n";

// Get super admin details from user input
echo "Enter super admin name: ";
$name = trim(fgets(STDIN));

echo "Enter super admin email: ";
$email = trim(fgets(STDIN));

echo "Enter super admin password: ";
$password = trim(fgets(STDIN));

echo "Enter super admin phone (optional): ";
$phone = trim(fgets(STDIN));
$phone = empty($phone) ? null : $phone;

// Validate inputs
if (empty($name) || empty($email) || empty($password)) {
    echo "\nError: Name, email, and password are required!\n";
    exit(1);
}

// Validate email format
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo "\nError: Invalid email format!\n";
    exit(1);
}

// Hash password
$hashed_password = password_hash($password, PASSWORD_DEFAULT);

try {
    $db = new Database();
    $conn = $db->getConnection();

    // Check if super admin with this email already exists
    $checkStmt = $conn->prepare("SELECT id FROM super_admins WHERE email = :email");
    $checkStmt->bindParam(':email', $email);
    $checkStmt->execute();

    if ($checkStmt->fetch()) {
        echo "\nError: A super admin with this email already exists!\n";
        exit(1);
    }

    // Insert super admin
    $stmt = $conn->prepare("
        INSERT INTO super_admins (name, email, password, phone, is_active)
        VALUES (:name, :email, :password, :phone, 1)
    ");

    $stmt->bindParam(':name', $name);
    $stmt->bindParam(':email', $email);
    $stmt->bindParam(':password', $hashed_password);
    $stmt->bindParam(':phone', $phone);

    $stmt->execute();

    $super_admin_id = $conn->lastInsertId();

    echo "\n✓ Super admin account created successfully!\n";
    echo "ID: $super_admin_id\n";
    echo "Name: $name\n";
    echo "Email: $email\n";
    echo "\nYou can now log in at: /super-admin/login\n";

} catch (PDOException $e) {
    echo "\nError: Failed to create super admin account\n";
    echo "Database error: " . $e->getMessage() . "\n";
    exit(1);
}
